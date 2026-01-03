/**
 * AI Service
 * High-level AI operations for the app
 */

import { aiClient, AIMessage, AIClientConfig } from './aiClient';
import {
  BASE_SYSTEM_PROMPT,
  explainRepoPrompt,
  explainPackagePrompt,
  compareAlternativesPrompt,
  contextualQuestionPrompt,
  summarizeReleasePrompt,
  repoSystemPrompt,
  packageSystemPrompt,
} from './prompts';
import { GitHubRepository } from '../../models/GitHubRepository';
import { NpmPackage } from '../../models/NpmPackage';
import { useSettingsStore } from '../../store/settingsStore';

/**
 * Get AI client configuration from settings
 */
function getAIConfig(): AIClientConfig {
  const settings = useSettingsStore.getState().settings;

  return {
    provider: settings.preferredAIProvider,
    model:
      settings.preferredAIProvider === 'gemini'
        ? settings.geminiModel
        : settings.ollamaModel || 'llama2',
    maxTokens: settings.aiResponseMaxTokens,
    temperature: 0.7,
  };
}

/**
 * Send a message to AI with context
 */
export async function sendMessage(
  userMessage: string,
  conversationHistory: AIMessage[] = [],
  systemPrompt: string = BASE_SYSTEM_PROMPT,
): Promise<{ content: string; tokenCount?: number }> {
  const config = getAIConfig();

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await aiClient.sendMessage(messages, config);
    return {
      content: response.content,
      tokenCount: response.tokenCount,
    };
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error(
      `Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Explain what a GitHub repository does
 */
export async function explainRepo(
  repo: GitHubRepository,
): Promise<{ content: string; tokenCount?: number }> {
  const prompt = explainRepoPrompt(repo);
  const systemPrompt = repoSystemPrompt();

  return sendMessage(prompt, [], systemPrompt);
}

/**
 * Explain what an npm package does
 */
export async function explainPackage(
  pkg: NpmPackage,
): Promise<{ content: string; tokenCount?: number }> {
  const prompt = explainPackagePrompt(pkg);
  const systemPrompt = packageSystemPrompt();

  return sendMessage(prompt, [], systemPrompt);
}

/**
 * Compare multiple repositories or packages
 */
export async function compareAlternatives(
  mainItem: GitHubRepository | NpmPackage,
  alternatives: Array<GitHubRepository | NpmPackage>,
): Promise<{ content: string; tokenCount?: number }> {
  const prompt = compareAlternativesPrompt(mainItem, alternatives);
  const isRepo = 'fullName' in mainItem;
  const systemPrompt = isRepo ? repoSystemPrompt() : packageSystemPrompt();

  return sendMessage(prompt, [], systemPrompt);
}

/**
 * Ask a question about a specific repo or package
 */
export async function askContextualQuestion(
  question: string,
  context: GitHubRepository | NpmPackage,
  conversationHistory: AIMessage[] = [],
): Promise<{ content: string; tokenCount?: number }> {
  const prompt = contextualQuestionPrompt(question, context);
  const isRepo = 'fullName' in context;
  const systemPrompt = isRepo ? repoSystemPrompt() : packageSystemPrompt();

  return sendMessage(prompt, conversationHistory, systemPrompt);
}

/**
 * Summarize release notes
 */
export async function summarizeRelease(
  repo: GitHubRepository,
  releaseNotes: string,
): Promise<{ content: string; tokenCount?: number }> {
  const prompt = summarizeReleasePrompt(repo, releaseNotes);
  const systemPrompt = repoSystemPrompt();

  return sendMessage(prompt, [], systemPrompt);
}

/**
 * Test connection to AI provider
 */
export async function testAIConnection(
  provider: 'gemini' | 'ollama',
): Promise<boolean> {
  try {
    return await aiClient.testConnection(provider);
  } catch (error) {
    console.error(`Failed to test ${provider} connection:`, error);
    return false;
  }
}

/**
 * List available Ollama models
 */
export async function listOllamaModels(): Promise<string[]> {
  try {
    return await aiClient.listOllamaModels();
  } catch (error) {
    console.error('Failed to list Ollama models:', error);
    return [];
  }
}

/**
 * Format conversation history for AI
 */
export function formatConversationHistory(
  messages: Array<{ role: string; content: string }>,
): AIMessage[] {
  return messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
}

/**
 * Prepare context for a new conversation
 */
export function prepareConversationContext(
  item?: GitHubRepository | NpmPackage,
): {
  systemPrompt: string;
  contextMessage?: AIMessage;
} {
  if (!item) {
    return { systemPrompt: BASE_SYSTEM_PROMPT };
  }

  const isRepo = 'fullName' in item;
  const systemPrompt = isRepo ? repoSystemPrompt() : packageSystemPrompt();

  // Don't include context as a message, let the user ask about it
  return { systemPrompt };
}

export default {
  sendMessage,
  explainRepo,
  explainPackage,
  compareAlternatives,
  askContextualQuestion,
  summarizeRelease,
  testAIConnection,
  listOllamaModels,
  formatConversationHistory,
  prepareConversationContext,
};
