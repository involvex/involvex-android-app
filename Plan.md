# Implementation Plan: TrendingHub Feature Enhancements

## Overview

This plan covers fixing the Android release build, improving version management, and adding AI-powered chat features to help users understand GitHub repos and npm packages.

## Task 1: Fix release:android Script ⚡ (Quick Fix)

**Problem**: Script uses `--tasks AssembleRelease` but Gradle task is case-sensitive `assembleRelease`

**Solution**:

- Update `packages/app/package.json` line 14
- Change from: `"release:android": "react-native build-android --tasks AssembleRelease"`
- Change to: `"release:android": "react-native build-android --mode release"`

**Files Modified**:

- `packages/app/package.json`

**Risk**: Low - This is the recommended React Native CLI approach

---

## Task 2: Improve Version Management Script 🏷️

**Current Issues**:

- No error handling or rollback
- No validation of clean working directory
- Creates lightweight tags (no release notes)
- No remote push automation
- Only supports patch bumps

**Enhanced Script Design** (`scripts/bump-app-version.js`):

### Features to Add:

1. **Pre-flight checks**:

   - Verify git working directory is clean
   - Validate current branch (should be on main/monorepo-migration)
   - Run typecheck before bumping

2. **Safe git operations**:

   - Create annotated tags with release notes
   - Rollback on failure
   - Optional `--push` flag to push commits and tags
   - Dry-run mode with `--dry-run` flag

3. **Version type support**:

   - Support `--patch` (default), `--minor`, `--major` flags
   - Consistent tag naming: `v{version}` format

4. **Better output**:
   - Show what changed
   - Confirm before creating tag
   - Show next steps if not auto-pushing

**Implementation Steps**:

1. Add command-line argument parsing (using process.argv)
2. Add git status check function
3. Add typecheck execution
4. Add rollback capability (git reset --hard)
5. Add annotated tag creation with template
6. Add optional push to remote
7. Add colorized console output

**Files Modified**:

- `scripts/bump-app-version.js` (rewrite with enhanced features)

**New Commands**:

```bash
bun run app:version:patch           # Bump patch version
bun run app:version:minor           # Bump minor version (add to package.json)
bun run app:version:major           # Bump major version (add to package.json)
bun run app:version:patch --push    # Bump and push to remote
bun run app:version:patch --dry-run # Preview changes without executing
```

---

## Task 3: Add AI Provider API Keys to Settings 🔐

**Providers**: Google Gemini + Local/Ollama

**UserSettings Model Changes** (`packages/app/src/models/UserSettings.ts`):

Add new fields in "Advanced Settings" section:

```typescript
// AI Provider Settings (new section, 4 fields)
geminiApiKey: string | null;
geminiModel: "gemini-pro" | "gemini-flash";
ollamaEndpoint: string | null; // e.g., http://localhost:11434
ollamaModel: string | null; // e.g., llama2, mistral
enableAIFeatures: boolean;
```

**Security Implementation**:

- Use `react-native-keychain` for encrypted storage (already in dependencies)
- Store AI keys separately from AsyncStorage
- Create `src/utils/secureStorage.ts` helper
- Keys stored with keychain keys: `@secure:gemini_key`, `@secure:ollama_endpoint`

**SettingsScreen UI** (`packages/app/src/screens/SettingsScreen.tsx`):

Add new collapsible section "AI Assistant Settings 🤖" after "Advanced Protocols":

- Enable AI Features toggle
- Gemini API Key input (secure text)
- Gemini Model selector (dropdown: gemini-pro, gemini-flash)
- Ollama Endpoint input
- Ollama Model input
- Test connection button

**Files Modified**:

- `packages/app/src/models/UserSettings.ts` (add AI fields)
- `packages/app/src/screens/SettingsScreen.tsx` (add AI settings section ~50 lines)
- `packages/app/src/utils/secureStorage.ts` (NEW - keychain wrapper)

---

## Task 4: Build AI Chat Feature 💬

**Architecture**: Bottom sheet that slides up from bottom of screen

### 4.1 Create AI Service Layer

**Files to Create**:

1. **`packages/app/src/api/ai/aiClient.ts`**:

   - Gemini API client (using fetch)
   - Ollama API client (using fetch)
   - Unified interface for both providers
   - Token streaming support
   - Error handling and retry logic

2. **`packages/app/src/api/ai/aiService.ts`**:

   - High-level service methods
   - `sendMessage(message, context?)` - Send user message
   - `explainRepo(repo: GitHubRepository)` - Explain what repo does
   - `explainPackage(pkg: NpmPackage)` - Explain npm package
   - `compareAlternatives(item, alternatives[])` - Compare packages
   - Context preparation (format repo/package data for AI)

3. **`packages/app/src/api/ai/prompts.ts`**:
   - System prompts for each use case
   - Context formatting templates
   - Example prompts for users

### 4.2 Create AI Store

**File**: `packages/app/src/store/aiChatStore.ts`

State:

```typescript
{
  messages: ChatMessage[];          // Conversation history
  isOpen: boolean;                  // Bottom sheet open/closed
  loading: boolean;                 // AI is responding
  activeProvider: 'gemini' | 'ollama';
  currentContext: GitHubRepository | NpmPackage | null;
  error: string | null;
}
```

Actions:

- `openChat(context?)` - Open bottom sheet, optionally with repo/package context
- `closeChat()` - Close bottom sheet
- `sendMessage(text)` - Send message to AI
- `clearHistory()` - Clear conversation
- `switchProvider(provider)` - Change AI provider
- `loadHistory()` - Load from SQLite
- `saveHistory()` - Persist to SQLite

### 4.3 Create Database Table

**File**: `packages/app/src/database/schema.ts`

Add new table:

```sql
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,              -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  context_type TEXT,               -- 'repo' | 'package' | null
  context_id TEXT,                 -- repo full_name or package name
  provider TEXT NOT NULL,          -- 'gemini' | 'ollama'
  model TEXT NOT NULL,
  created_at TEXT NOT NULL,
  token_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_chat_created ON ai_chat_messages(created_at);
```

### 4.4 Create Chat UI Components

**Files to Create**:

1. **`packages/app/src/components/AIChat/AIChatBottomSheet.tsx`** (Main Component):

   - Bottom sheet using `react-native-gesture-handler`
   - Backdrop with blur effect
   - Draggable handle
   - Height: 60% of screen, can expand to 90%
   - Context badge showing current repo/package
   - Provider selector (Gemini/Ollama badge)

2. **`packages/app/src/components/AIChat/MessageList.tsx`**:

   - FlashList for message rendering
   - User messages (right-aligned, green bubble)
   - AI messages (left-aligned, cyan bubble)
   - System messages (centered, dimmed)
   - Auto-scroll to bottom on new message
   - Timestamp and token count display

3. **`packages/app/src/components/AIChat/MessageInput.tsx`**:

   - TextInput with HackerTheme styling
   - Send button with icon
   - Loading indicator when AI is responding
   - Quick action buttons:
     - "Explain this repo" (if context is repo)
     - "Compare alternatives" (if context exists)
     - "Show release notes" (if repo has releases)

4. **`packages/app/src/components/AIChat/ContextCard.tsx`**:
   - Shows current repo/package context
   - Displays: name, stars, description
   - Clear context button

### 4.5 Integrate into Existing Screens

**HomeScreen Integration** (`packages/app/src/screens/HomeScreen.tsx`):

- Add floating action button (FAB) in bottom-right corner
- On repo/package item long-press → open chat with context
- FAB opens chat without context (general Q&A)

**Files Modified**:

- `packages/app/src/screens/HomeScreen.tsx` (add FAB, long-press handlers)
- `packages/app/App.tsx` (render AIChatBottomSheet at root level)

### 4.6 Implementation Order

1. Create database table and migration
2. Create secure storage utility
3. Add AI settings to UserSettings model
4. Add AI settings UI to SettingsScreen
5. Create AI API clients (Gemini + Ollama)
6. Create AI service with prompts
7. Create aiChatStore with Zustand
8. Create UI components (BottomSheet, MessageList, MessageInput, ContextCard)
9. Integrate FAB into HomeScreen
10. Add long-press handlers to repo/package items
11. Render bottom sheet in App.tsx
12. Test with both providers

**Estimated Files**:

- **New**: 12 files
- **Modified**: 5 files
- **Complexity**: Medium-High (new feature with external API integration)

---

## Task 5: Extend App and Web Features 🚀

### Mobile App Extensions

1. **SearchScreen Implementation**:

   - Search both GitHub repos and npm packages
   - Filter by language, stars, date range
   - Recent searches history
   - Search suggestions

2. **SubscriptionsScreen Implementation**:

   - List of subscribed repos/packages
   - Swipe-to-unsubscribe
   - Filter by type (repo/package)
   - Sort by recently added
   - Sync with cloud (if web deployed)

3. **Release Notifications**:

   - Background polling for new releases
   - Push notifications using existing notification system
   - Mark as read/unread
   - Open release notes in WebView

4. **Sharing Features**:
   - Share repo/package link
   - Share AI chat conversation
   - Export chat as text/markdown

### Web Platform Extensions (`packages/web`)

1. **Landing Page Features**:

   - Hero section with demo
   - Feature showcase
   - Download links (Play Store placeholder)
   - Trending repos widget (live data)

2. **Dashboard Features** (if authentication added):

   - View subscriptions across devices
   - Analytics (most viewed repos, engagement)
   - Sync settings with mobile app
   - Export user data

3. **Public Repo/Package Pages**:
   - SEO-friendly pages for trending items
   - Server-side rendering with Remix
   - Share links that preview with Open Graph tags
   - Comments/discussion (future feature)

### Shared Package Utilities

Add to `packages/shared`:

- AI prompt templates (shared between mobile and web)
- Markdown parser for release notes
- Date/time utilities (shared formatting)
- Validation schemas for API responses

---

## Implementation Priorities

### Phase 1 (Quick Wins):

1. ✅ Fix release:android script (5 min)
2. ✅ Improve version management script (1-2 hours)

### Phase 2 (AI Foundation):

3. ✅ Add secure storage utility (30 min)
4. ✅ Add AI settings to model and UI (1 hour)
5. ✅ Create AI API clients (2-3 hours)

### Phase 3 (AI Chat Core):

6. ✅ Create database table for messages (30 min)
7. ✅ Create aiChatStore (1 hour)
8. ✅ Build bottom sheet UI components (3-4 hours)
9. ✅ Integrate into HomeScreen (1 hour)

### Phase 4 (Polish & Test):

10. ✅ Test with Gemini API (1 hour)
11. ✅ Test with Ollama locally (1 hour)
12. ✅ Error handling and edge cases (2 hours)

### Phase 5 (Extended Features - Future):

13. 🔄 Implement SearchScreen
14. 🔄 Implement SubscriptionsScreen
15. 🔄 Add web dashboard features

---

## Critical Files Reference

### Files to Modify:

1. `packages/app/package.json` - Fix release script
2. `scripts/bump-app-version.js` - Enhanced version management
3. `packages/app/src/models/UserSettings.ts` - Add AI fields
4. `packages/app/src/screens/SettingsScreen.tsx` - Add AI settings UI
5. `packages/app/src/screens/HomeScreen.tsx` - Add FAB and long-press
6. `packages/app/src/database/schema.ts` - Add chat messages table
7. `packages/app/App.tsx` - Render bottom sheet

### Files to Create:

1. `packages/app/src/utils/secureStorage.ts` - Keychain wrapper
2. `packages/app/src/api/ai/aiClient.ts` - API clients
3. `packages/app/src/api/ai/aiService.ts` - Business logic
4. `packages/app/src/api/ai/prompts.ts` - System prompts
5. `packages/app/src/store/aiChatStore.ts` - Chat state
6. `packages/app/src/components/AIChat/AIChatBottomSheet.tsx` - Main UI
7. `packages/app/src/components/AIChat/MessageList.tsx` - Message display
8. `packages/app/src/components/AIChat/MessageInput.tsx` - Input field
9. `packages/app/src/components/AIChat/ContextCard.tsx` - Context display
10. `packages/app/src/models/ChatMessage.ts` - Message model
11. `packages/app/src/database/repositories/aiChatRepository.ts` - DB operations
12. `packages/app/src/api/ai/index.ts` - Exports

---

## Testing Checklist

- [ ] release:android builds APK successfully
- [ ] Version bump script with dry-run works
- [ ] Version bump script creates proper git tag
- [ ] Gemini API key stored securely in keychain
- [ ] Ollama connection works with local endpoint
- [ ] Bottom sheet opens/closes smoothly
- [ ] Chat messages persist in SQLite
- [ ] AI responds correctly to repo explanations
- [ ] AI compares packages accurately
- [ ] Long-press on repo opens chat with context
- [ ] FAB opens chat without context
- [ ] Chat history loads on app restart
- [ ] Error handling shows user-friendly messages
- [ ] Works offline (shows cached messages)
- [ ] Android build succeeds with new features
- [ ] iOS compatibility (if applicable)

---

## Security Considerations

1. **API Keys**:

   - Never log API keys
   - Use keychain (encrypted) not AsyncStorage
   - Validate key format before saving
   - Show masked keys in UI (•••••)

2. **AI Responses**:

   - Sanitize AI output before rendering
   - Don't send sensitive user data to AI
   - Add disclaimer that AI can make mistakes
   - Rate limiting to prevent abuse

3. **Local AI (Ollama)**:
   - Validate endpoint URL format
   - Add timeout for requests (30s)
   - Handle connection refused gracefully
   - Don't expose user's local IP

---

## Next Steps After Implementation

1. Add analytics to track AI feature usage
2. Implement conversation branching (multiple threads)
3. Add voice input for messages
4. Export conversations to share with others
5. Add AI-generated summaries for long conversations
6. Integrate with web dashboard for cross-platform sync
7. Add support for more AI providers (OpenAI, Claude)
8. Fine-tune prompts based on user feedback

---

## Estimated Total Time

- **Quick fixes** (Tasks 1-2): 2-3 hours
- **AI settings** (Task 3): 2 hours
- **AI chat feature** (Task 4): 10-12 hours
- **Testing & polish**: 3-4 hours
- **Total**: ~18-21 hours of focused development

---

This plan follows existing codebase patterns, maintains TypeScript strict typing, uses HackerTheme for UI consistency, and prioritizes security for API key management.
