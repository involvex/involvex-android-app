/**
 * AI Client
 * Handles communication with Gemini and Ollama APIs
 */

import { getSecureValue, SecureKeys } from '../../utils/secureStorage';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  tokenCount?: number;
  model: string;
  provider: 'gemini' | 'ollama' | 'openrouter';
}

export interface AIClientConfig {
  provider: 'gemini' | 'ollama' | 'openrouter';
  model: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Gemini API Client
 */
class GeminiClient {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async initialize(): Promise<void> {
    this.apiKey = await getSecureValue(SecureKeys.GEMINI_API_KEY);
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }
  }

  async sendMessage(
    messages: AIMessage[],
    model: string = 'gemini-flash',
    maxTokens: number = 2048,
    temperature: number = 0.7,
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      await this.initialize();
    }

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Gemini expects alternating user/model roles, so we need to combine consecutive messages
    const combinedContents = this.combineConsecutiveMessages(contents);

    const requestBody = {
      contents: combinedContents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    };

    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Gemini API error: ${error.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    const tokenCount = data.usageMetadata?.totalTokenCount;

    return {
      content,
      tokenCount,
      model,
      provider: 'gemini',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      const testMessages: AIMessage[] = [
        { role: 'user', content: 'Hello, please respond with OK' },
      ];
      const response = await this.sendMessage(testMessages, 'gemini-flash');
      return response.content.length > 0;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  /**
   * Combine consecutive messages from the same role
   * Gemini requires alternating user/model roles
   */
  private combineConsecutiveMessages(
    contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    const combined: typeof contents = [];

    for (const content of contents) {
      const lastContent = combined[combined.length - 1];

      if (lastContent && lastContent.role === content.role) {
        // Combine with previous message
        lastContent.parts.push(...content.parts);
      } else {
        // Add as new message
        combined.push(content);
      }
    }

    return combined;
  }
}

/**
 * Ollama API Client
 */
class OllamaClient {
  private endpoint: string | null = null;

  async initialize(): Promise<void> {
    this.endpoint = await getSecureValue(SecureKeys.OLLAMA_ENDPOINT);
    if (!this.endpoint) {
      throw new Error('Ollama endpoint not configured');
    }
  }

  async sendMessage(
    messages: AIMessage[],
    model: string = 'llama2',
    maxTokens: number = 2048,
    temperature: number = 0.7,
  ): Promise<AIResponse> {
    if (!this.endpoint) {
      await this.initialize();
    }

    const requestBody = {
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      options: {
        num_predict: maxTokens,
        temperature,
      },
      stream: false,
    };

    const response = await fetch(`${this.endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.message || !data.message.content) {
      throw new Error('No response from Ollama API');
    }

    return {
      content: data.message.content,
      tokenCount: data.total_tokens || undefined,
      model,
      provider: 'ollama',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();

      // Test if Ollama is reachable
      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    if (!this.endpoint) {
      await this.initialize();
    }

    try {
      const response = await fetch(`${this.endpoint}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch Ollama models');
      }

      const data = await response.json();
      return data.models?.map((m: { name: string }) => m.name) || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }
}

/**
 * OpenRouter API Client
 */
class OpenRouterClient {
  private apiKey: string | null = null;
  private baseUrl = 'https://openrouter.ai/api/v1';

  async initialize(): Promise<void> {
    this.apiKey = await getSecureValue(SecureKeys.OPENROUTER_API_KEY);
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }
  }

  async sendMessage(
    messages: AIMessage[],
    model: string = 'anthropic/claude-3-5-sonnet',
    maxTokens: number = 2048,
    temperature: number = 0.7,
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      await this.initialize();
    }

    // Convert messages to OpenAI format (OpenRouter uses OpenAI-compatible API)
    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const requestBody = {
      model,
      messages: openAIMessages,
      max_tokens: maxTokens,
      temperature,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://involvex.app', // Required by OpenRouter
        'X-Title': 'Involvex App', // Optional
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenRouter API error: ${error.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    const content = data.choices[0].message.content;
    const tokenCount = data.usage?.total_tokens;

    return {
      content,
      tokenCount,
      model,
      provider: 'openrouter',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      const testMessages: AIMessage[] = [
        { role: 'user', content: 'Hello, please respond with OK' },
      ];
      const response = await this.sendMessage(testMessages);
      return response.content.length > 0;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

/**
 * Unified AI Client
 */
export class AIClient {
  private gemini = new GeminiClient();
  private ollama = new OllamaClient();
  private openRouter = new OpenRouterClient();

  /**
   * Send a message using the specified provider
   */
  async sendMessage(
    messages: AIMessage[],
    config: AIClientConfig,
  ): Promise<AIResponse> {
    const { provider, model, maxTokens = 2048, temperature = 0.7 } = config;

    switch (provider) {
      case 'gemini':
        return this.gemini.sendMessage(messages, model, maxTokens, temperature);
      case 'ollama':
        return this.ollama.sendMessage(messages, model, maxTokens, temperature);
      case 'openrouter':
        return this.openRouter.sendMessage(
          messages,
          model,
          maxTokens,
          temperature,
        );
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  /**
   * Test connection to a provider
   */
  async testConnection(
    provider: 'gemini' | 'ollama' | 'openrouter',
  ): Promise<boolean> {
    switch (provider) {
      case 'gemini':
        return this.gemini.testConnection();
      case 'ollama':
        return this.ollama.testConnection();
      case 'openrouter':
        return this.openRouter.testConnection();
      default:
        return false;
    }
  }

  /**
   * List available Ollama models
   */
  async listOllamaModels(): Promise<string[]> {
    return this.ollama.listModels();
  }

  /**
   * Get Gemini client instance
   */
  getGeminiClient(): GeminiClient {
    return this.gemini;
  }

  /**
   * Get Ollama client instance
   */
  getOllamaClient(): OllamaClient {
    return this.ollama;
  }
}

// Export singleton instance
export const aiClient = new AIClient();
export default aiClient;
