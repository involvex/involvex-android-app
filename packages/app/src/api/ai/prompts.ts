/**
 * AI Prompts and Templates
 * System prompts and context formatting for AI interactions
 */

import { GitHubRepository } from '../../models/GitHubRepository';
import { NpmPackage } from '../../models/NpmPackage';

/**
 * Base system prompt for all AI interactions
 */
export const BASE_SYSTEM_PROMPT = `You are an AI assistant helping developers explore and understand GitHub repositories and npm packages.

Your role is to:
- Provide clear, concise explanations about repositories and packages
- Help developers understand what a project does and how to use it
- Compare similar packages and suggest alternatives
- Answer technical questions about dependencies, features, and use cases
- Be helpful, accurate, and developer-friendly

Keep responses:
- Concise (2-3 paragraphs max unless asked for details)
- Technical but accessible
- Focused on practical information
- Honest about limitations (say "I don't know" if unsure)

Format responses in plain text (no markdown unless specifically asked).`;

/**
 * Format GitHub repository context for AI
 */
export function formatRepoContext(repo: GitHubRepository): string {
  return `Repository Context:
- Name: ${repo.fullName}
- Description: ${repo.description || 'No description'}
- Language: ${repo.language || 'Unknown'}
- Stars: ${repo.formattedStars}
- Forks: ${repo.formattedForks}
- Topics: ${repo.topics?.split(',').join(', ') || 'None'}
- License: ${repo.license || 'No license'}
- Last Updated: ${repo.timeAgo}
- Homepage: ${repo.homepage || 'None'}
${repo.hasRecentActivity ? '- Status: Active development' : '- Status: Low activity'}`;
}

/**
 * Format npm package context for AI
 */
export function formatPackageContext(pkg: NpmPackage): string {
  return `Package Context:
- Name: ${pkg.name}
- Description: ${pkg.description || 'No description'}
- Version: ${pkg.version}
- Downloads: ${pkg.formattedDownloads}
- Keywords: ${pkg.keywordsString || 'None'}
- License: ${pkg.license || 'No license'}
- Last Updated: ${pkg.timeAgo}
- Dependencies: ${pkg.totalDependencyCount} total
- Repository: ${pkg.repositoryUrl || 'None'}
${pkg.hasRecentActivity ? '- Status: Recently updated' : '- Status: Outdated'}`;
}

/**
 * Prompt for explaining a repository
 */
export function explainRepoPrompt(repo: GitHubRepository): string {
  return `${formatRepoContext(repo)}

Please explain what this repository does, its main purpose, and key features. Keep it concise and practical.`;
}

/**
 * Prompt for explaining a package
 */
export function explainPackagePrompt(pkg: NpmPackage): string {
  return `${formatPackageContext(pkg)}

Please explain what this npm package does, its main purpose, and when developers should use it. Keep it concise and practical.`;
}

/**
 * Prompt for comparing alternatives
 */
export function compareAlternativesPrompt(
  mainItem: GitHubRepository | NpmPackage,
  alternatives: Array<GitHubRepository | NpmPackage>,
): string {
  const isRepo = 'fullName' in mainItem;
  const mainContext = isRepo
    ? formatRepoContext(mainItem as GitHubRepository)
    : formatPackageContext(mainItem as NpmPackage);

  const alternativesText = alternatives
    .map((item, idx) => {
      const context = isRepo
        ? formatRepoContext(item as GitHubRepository)
        : formatPackageContext(item as NpmPackage);
      return `Alternative ${idx + 1}:\n${context}`;
    })
    .join('\n\n');

  return `Main ${isRepo ? 'Repository' : 'Package'}:
${mainContext}

${alternativesText}

Please compare these ${isRepo ? 'repositories' : 'packages'} and highlight:
1. Key differences in features and approach
2. Which one might be better for specific use cases
3. Pros and cons of each

Keep it practical and help developers choose the right tool for their needs.`;
}

/**
 * Prompt for general questions with context
 */
export function contextualQuestionPrompt(
  question: string,
  context: GitHubRepository | NpmPackage,
): string {
  const isRepo = 'fullName' in context;
  const contextText = isRepo
    ? formatRepoContext(context as GitHubRepository)
    : formatPackageContext(context as NpmPackage);

  return `${contextText}

User Question: ${question}

Please answer the question about this ${isRepo ? 'repository' : 'package'}.`;
}

/**
 * Prompt for release notes summary
 */
export function summarizeReleasePrompt(
  repo: GitHubRepository,
  releaseNotes: string,
): string {
  return `Repository: ${repo.fullName}

Release Notes:
${releaseNotes}

Please summarize the key changes in this release:
1. New features
2. Breaking changes
3. Bug fixes
4. Important notes for developers

Keep it concise and highlight what's most important for users.`;
}

/**
 * System prompt for repository-focused conversations
 */
export function repoSystemPrompt(): string {
  return `${BASE_SYSTEM_PROMPT}

You are currently helping explore a GitHub repository. Focus on:
- Code quality and architecture
- Dependencies and security
- Community activity and maintainability
- Practical usage examples`;
}

/**
 * System prompt for package-focused conversations
 */
export function packageSystemPrompt(): string {
  return `${BASE_SYSTEM_PROMPT}

You are currently helping explore an npm package. Focus on:
- Installation and usage
- API and features
- Dependencies and bundle size
- Alternatives and ecosystem fit`;
}

/**
 * Example prompts for users
 */
export const EXAMPLE_PROMPTS = {
  repo: [
    'What does this repository do?',
    'Is this actively maintained?',
    'What are the main features?',
    'Are there any security concerns?',
    'How do I get started using this?',
  ],
  package: [
    'What is this package used for?',
    'How do I install and use it?',
    'What are popular alternatives?',
    'Is this package well-maintained?',
    'What are the dependencies?',
  ],
  general: [
    'Compare this with similar options',
    'What are the pros and cons?',
    'Show me related packages/repos',
    'Explain the latest release',
  ],
};
