# Implementation Guide - Remaining Features

This document provides detailed implementation instructions for the remaining features requested.

---

## ✅ COMPLETED FEATURES

### 1. InfoCard Preview Modal (DONE)
- **Preview card** shows repository/package info with action buttons
- **Primary button**: "Open in Browser" (opens external browser)
- **Secondary buttons**: "WebView" (opens in-app browser), "Share"
- **Settings**: `enableInfoCardPreview` (default: true)
- **Behavior**: If disabled, tap opens external browser directly

**Files Modified:**
- `packages/app/src/store/InfoCard.ts` - Added `showWebView` state
- `packages/app/src/components/InfoCard/InfoCardModal.tsx` - Complete redesign
- `packages/app/src/screens/HomeScreen.tsx` - Respects `enableInfoCardPreview` setting
- `packages/app/src/models/UserSettings.ts` - Added `enableInfoCardPreview` and `defaultBrowserAction` fields

---

## 🚧 REMAINING FEATURES TO IMPLEMENT

### 2. OpenRouter AI Provider

**Status**: Type definitions updated, implementation pending

**What's Done:**
- ✅ Added `openRouterApiKey` and `openRouterModel` to UserSettings
- ✅ Updated `AIProvider` type to include `'openrouter'`
- ✅ Updated `AIClientConfig` and `AIResponse` interfaces

**What's Needed:**

#### A. Create OpenRouter Client Class

Add to `packages/app/src/api/ai/aiClient.ts`:

```typescript
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
        'Authorization': `Bearer ${this.apiKey}`,
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
```

#### B. Update AIClient Class

Update the `sendMessage` method in `AIClient` class:

```typescript
async sendMessage(
  messages: AIMessage[],
  config: AIClientConfig,
): Promise<AIResponse> {
  switch (config.provider) {
    case 'gemini':
      return this.geminiClient.sendMessage(
        messages,
        config.model,
        config.maxTokens,
        config.temperature,
      );
    case 'ollama':
      return this.ollamaClient.sendMessage(
        messages,
        config.model,
        config.maxTokens,
        config.temperature,
      );
    case 'openrouter':
      return this.openRouterClient.sendMessage(
        messages,
        config.model,
        config.maxTokens,
        config.temperature,
      );
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

async testConnection(provider: 'gemini' | 'ollama' | 'openrouter'): Promise<boolean> {
  switch (provider) {
    case 'gemini':
      return this.geminiClient.testConnection();
    case 'ollama':
      return this.ollamaClient.testConnection();
    case 'openrouter':
      return this.openRouterClient.testConnection();
    default:
      return false;
  }
}
```

#### C. Update SecureKeys Enum

Add to `packages/app/src/utils/secureStorage.ts`:

```typescript
export enum SecureKeys {
  GEMINI_API_KEY = 'gemini_api_key',
  OLLAMA_ENDPOINT = 'ollama_endpoint',
  OPENROUTER_API_KEY = 'openrouter_api_key', // ADD THIS
  GITHUB_TOKEN = 'github_token',
  NPM_TOKEN = 'npm_token',
}
```

#### D. Update aiService.ts

Update `getAIConfig()` function:

```typescript
function getAIConfig(): AIClientConfig {
  const settings = useSettingsStore.getState().settings;

  let model: string;
  switch (settings.preferredAIProvider) {
    case 'gemini':
      model = settings.geminiModel;
      break;
    case 'ollama':
      model = settings.ollamaModel || 'llama2';
      break;
    case 'openrouter':
      model = settings.openRouterModel || 'anthropic/claude-3-5-sonnet';
      break;
    default:
      model = settings.geminiModel;
  }

  return {
    provider: settings.preferredAIProvider,
    model,
    maxTokens: settings.aiResponseMaxTokens,
    temperature: 0.7,
  };
}
```

---

### 3. SearchScreen UI Improvements

**Current Issues:**
- Layout feels cramped
- Filter panel design is inconsistent
- Quick filter chips look "scuffed"

**Recommended Improvements:**

#### A. Update Search Bar Styling

```typescript
// Increase padding and improve spacing
searchContainer: {
  flexDirection: 'row',
  paddingHorizontal: Spacing.lg, // Changed from md
  paddingVertical: Spacing.sm, // Add vertical padding
  gap: Spacing.md, // Changed from sm
  backgroundColor: HackerTheme.darkerGreen, // Add background
  borderBottomWidth: 1,
  borderBottomColor: HackerTheme.primary + '20',
},
searchInputContainer: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: HackerTheme.darkGreen,
  borderRadius: 12, // Increased from 8
  borderWidth: 1,
  borderColor: HackerTheme.primary + '40', // More visible
  paddingHorizontal: Spacing.lg, // Changed from md
  paddingVertical: Spacing.xs, // Add vertical padding
  gap: Spacing.sm,
  height: 48, // Fixed height
},
```

#### B. Improve Quick Filters

```typescript
quickFiltersContainer: {
  marginTop: 0, // Remove margin
  paddingVertical: Spacing.md, // Add vertical padding
  backgroundColor: HackerTheme.darkerGreen,
  borderBottomWidth: 1,
  borderBottomColor: HackerTheme.primary + '20',
},
quickFilterChip: {
  paddingHorizontal: Spacing.lg, // Increased from md
  paddingVertical: Spacing.md, // Increased from sm
  borderRadius: 20, // More rounded
  borderWidth: 1,
  borderColor: HackerTheme.primary + '40', // More visible
  backgroundColor: HackerTheme.darkGreen, // Changed from darkerGreen
  marginRight: Spacing.md, // Increased from sm
},
quickFilterChipActive: {
  backgroundColor: HackerTheme.primary + '20', // Semi-transparent
  borderColor: HackerTheme.primary,
  borderWidth: 2, // Thicker border when active
},
```

#### C. Redesign Filters Panel

```typescript
filtersPanel: {
  backgroundColor: HackerTheme.darkGreen,
  marginHorizontal: Spacing.lg, // Changed from md
  marginVertical: Spacing.md,
  padding: Spacing.lg, // Increased from md
  borderRadius: 16, // Increased from 12
  borderWidth: 1,
  borderColor: HackerTheme.primary + '40', // More visible
  gap: Spacing.md, // Add gap between sections
},
filterLabel: {
  ...Typography.bodyText,
  color: HackerTheme.primary,
  fontWeight: '600', // Make labels bold
  marginBottom: Spacing.sm, // Increased from xs
  marginTop: 0, // Remove top margin (use gap instead)
},
```

---

### 4. npm Package Category Filters

**Implementation:**

#### A. Add Category Constants

Add to `packages/app/src/screens/SearchScreen.tsx`:

```typescript
const NPM_CATEGORIES = [
  { id: 'frontend', label: 'Front-end', keywords: 'react vue angular svelte' },
  { id: 'backend', label: 'Back-end', keywords: 'express fastify koa nest' },
  { id: 'cli', label: 'CLI', keywords: 'cli command-line terminal' },
  { id: 'docs', label: 'Documentation', keywords: 'documentation docs markdown' },
  { id: 'css', label: 'CSS', keywords: 'css styles tailwind sass' },
  { id: 'testing', label: 'Testing', keywords: 'test jest mocha vitest' },
  { id: 'iot', label: 'IoT', keywords: 'iot arduino raspberry-pi mqtt' },
  { id: 'coverage', label: 'Coverage', keywords: 'coverage istanbul nyc' },
  { id: 'mobile', label: 'Mobile', keywords: 'mobile ios android react-native' },
  { id: 'frameworks', label: 'Frameworks', keywords: 'framework next nuxt remix' },
  { id: 'robotics', label: 'Robotics', keywords: 'robotics robot automation' },
  { id: 'math', label: 'Math', keywords: 'math mathematics algebra' },
];
```

#### B. Add Category Filter Component

```typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

const renderNpmCategoryFilters = () => {
  if (activeTab !== 'npm') return null;

  return (
    <View style={styles.categoryFiltersContainer}>
      <Text style={styles.categoryTitle}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFiltersContent}
      >
        {NPM_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => {
              setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              );
              const selected = NPM_CATEGORIES.find(c => c.id === category.id);
              if (selected) {
                setSearchQuery(selected.keywords);
                setTimeout(handleSearch, 100);
              }
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

#### C. Add Category Styles

```typescript
categoryFiltersContainer: {
  paddingVertical: Spacing.md,
  backgroundColor: HackerTheme.darkerGreen,
  borderBottomWidth: 1,
  borderBottomColor: HackerTheme.primary + '20',
},
categoryTitle: {
  ...Typography.heading3,
  color: HackerTheme.primary,
  paddingHorizontal: Spacing.lg,
  marginBottom: Spacing.sm,
},
categoryFiltersContent: {
  paddingHorizontal: Spacing.lg,
  gap: Spacing.sm,
},
categoryChip: {
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: HackerTheme.primary + '40',
  backgroundColor: HackerTheme.darkGreen,
  marginRight: Spacing.md,
},
categoryChipActive: {
  backgroundColor: HackerTheme.primary + '20',
  borderColor: HackerTheme.primary,
  borderWidth: 2,
},
categoryText: {
  ...Typography.bodyText,
  color: HackerTheme.lightGrey,
  fontWeight: '600',
},
categoryTextActive: {
  color: HackerTheme.primary,
  fontWeight: 'bold',
},
```

#### D. Update Render Order

```typescript
return (
  <View style={styles.container}>
    {renderTabSelector()}
    {renderSearchBar()}
    {renderQuickFilters()}
    {renderNpmCategoryFilters()} {/* ADD THIS */}
    {renderAdvancedFilters()}
    {/* ... rest of component */}
  </View>
);
```

---

### 5. Recently Updated Packages

**Implementation:**

#### A. Add npmService Method

Add to `packages/app/src/api/npm/npmService.ts`:

```typescript
/**
 * Get recently updated packages
 */
async getRecentlyUpdated(
  limit: number = 20
): Promise<NpmPackage[]> {
  try {
    const response = await this.client.get('/-/v1/search', {
      params: {
        text: 'boost-exact:false',
        size: limit,
        from: 0,
        quality: 0.5,
        popularity: 0.8,
        maintenance: 0.9, // Prioritize well-maintained packages
      },
    });

    if (!response.data || !response.data.objects) {
      return [];
    }

    // Sort by modified date (most recent first)
    const sortedObjects = response.data.objects.sort((a: any, b: any) => {
      const dateA = new Date(a.package.date).getTime();
      const dateB = new Date(b.package.date).getTime();
      return dateB - dateA;
    });

    return sortedObjects
      .slice(0, limit)
      .map((obj: any) => NpmPackage.fromNpmAPI(obj.package));
  } catch (error) {
    console.error('Error fetching recently updated packages:', error);
    throw error;
  }
}
```

#### B. Add to SearchScreen State

```typescript
const [recentlyUpdated, setRecentlyUpdated] = useState<NpmPackage[]>([]);

useEffect(() => {
  if (activeTab === 'npm' && recentlyUpdated.length === 0) {
    loadRecentlyUpdated();
  }
}, [activeTab]);

const loadRecentlyUpdated = async () => {
  try {
    const packages = await npmService.getRecentlyUpdated(10);
    setRecentlyUpdated(packages);
  } catch (error) {
    console.error('Failed to load recently updated packages:', error);
  }
};
```

#### C. Add Recently Updated Section

```typescript
const renderRecentlyUpdated = () => {
  if (activeTab !== 'npm' || recentlyUpdated.length === 0) return null;

  return (
    <View style={styles.recentlyUpdatedContainer}>
      <View style={styles.recentlyUpdatedHeader}>
        <Icon name="update" size={20} color={HackerTheme.primary} />
        <Text style={styles.recentlyUpdatedTitle}>Recently Updated</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentlyUpdatedContent}
      >
        {recentlyUpdated.map(pkg => (
          <TouchableOpacity
            key={pkg.name}
            style={styles.recentlyUpdatedCard}
            onPress={() => handleItemPress(pkg)}
          >
            <Icon name="npm" size={24} color={HackerTheme.primary} />
            <Text style={styles.recentlyUpdatedName} numberOfLines={1}>
              {pkg.name}
            </Text>
            <Text style={styles.recentlyUpdatedVersion}>v{pkg.version}</Text>
            <Text style={styles.recentlyUpdatedDownloads}>
              {pkg.formattedDownloads}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

#### D. Add Styles

```typescript
recentlyUpdatedContainer: {
  paddingVertical: Spacing.md,
  backgroundColor: HackerTheme.darkerGreen,
  borderBottomWidth: 1,
  borderBottomColor: HackerTheme.primary + '20',
},
recentlyUpdatedHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.sm,
  paddingHorizontal: Spacing.lg,
  marginBottom: Spacing.sm,
},
recentlyUpdatedTitle: {
  ...Typography.heading3,
  color: HackerTheme.primary,
},
recentlyUpdatedContent: {
  paddingHorizontal: Spacing.lg,
  gap: Spacing.md,
},
recentlyUpdatedCard: {
  width: 140,
  backgroundColor: HackerTheme.darkGreen,
  borderRadius: 12,
  padding: Spacing.md,
  borderWidth: 1,
  borderColor: HackerTheme.primary + '40',
  alignItems: 'center',
  gap: Spacing.xs,
},
recentlyUpdatedName: {
  ...Typography.bodyText,
  color: HackerTheme.primary,
  fontWeight: '600',
  textAlign: 'center',
},
recentlyUpdatedVersion: {
  ...Typography.captionText,
  color: HackerTheme.accent,
},
recentlyUpdatedDownloads: {
  ...Typography.captionText,
  color: HackerTheme.lightGrey,
},
```

---

## 📝 Summary

**Completed (3/5):**
1. ✅ InfoCard preview modal with optional WebView
2. ✅ InfoCard enable/disable setting
3. ✅ Type definitions for OpenRouter

**Pending (2/5):**
4. ⏳ OpenRouter implementation (detailed guide above)
5. ⏳ SearchScreen improvements + npm filters + recently updated (detailed guide above)

**Next Steps:**
1. Implement OpenRouter client following section 2
2. Improve SearchScreen UI following section 3
3. Add npm category filters following section 4
4. Add recently updated packages following section 5
5. Run full build and test

All type definitions are in place and TypeScript checks pass ✓
