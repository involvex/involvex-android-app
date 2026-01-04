import { json, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { Changelog } from "~/types/changelog";

export const meta: MetaFunction = () => [
  { title: "Changelog - Involvex" },
  {
    name: "description",
    content: "View all updates and improvements to Involvex",
  },
];

export const loader = async () => {
  const changelogs: Changelog[] = [
    {
      version: "0.0.15",
      releaseDate: "2025-01-04",
      status: "Latest",
      highlights: [
        "🤖 Multi-Provider AI Chat Support",
        "🔍 Advanced SearchScreen UI",
        "📱 InfoCard Preview Modal",
        "⚙️ OpenRouter Integration",
        "🎯 npm Category Filters",
      ],
      changes: {
        Added: [
          "OpenRouter AI provider with Claude 3.5 Sonnet, GPT-4, Llama 2 model selection",
          "OpenRouter API key configuration in Settings → AI Assistant",
          "npm package category filters (12 categories: Frontend, Backend, CLI, Documentation, CSS, Testing, IoT, Coverage, Mobile, Frameworks, Robotics, Math)",
          "Recently Updated Packages section in SearchScreen",
          "InfoCard preview modal with optional in-app browser",
          "InfoCard enable/disable setting",
          "VSCode launch configs and build tasks",
          "Enhanced VSCode settings for development",
        ],
        Improved: [
          "SearchScreen UI: better spacing, styling, and visual hierarchy",
          "Quick filter chips: more visible borders, better active states",
          "Filter panel: enhanced padding, better organization",
          "Settings screen: expanded AI section to 9 configuration options",
          "Gradle configuration: fixed hard link issues on Windows",
        ],
        Fixed: [
          "Author URL case sensitivity (https://involvex.github.io/Involvex/)",
          "Gradle hard link warnings with cross-drive configuration",
          "TypeScript type definitions for OpenRouter provider",
        ],
      },
      features: [
        {
          title: "OpenRouter Integration",
          description:
            "Added complete support for OpenRouter API with secure key storage, model selection, and settings configuration.",
          components: ["aiClient.ts", "SettingsScreen.tsx", "secureStorage.ts"],
        },
        {
          title: "SearchScreen Enhancements",
          description:
            "Improved UI with npm category filters and recently updated packages section for better package discovery.",
          components: ["SearchScreen.tsx", "npmService.ts"],
        },
        {
          title: "InfoCard Modal",
          description:
            "Two-mode interface with preview cards and optional in-app WebView browser with share and external open options.",
          components: ["InfoCardModal.tsx", "InfoCard.ts"],
        },
      ],
      technicalDetails: {
        dependencies:
          "No new dependencies added (uses existing react-native-webview)",
        breakingChanges: "None",
        migrations: "No database migrations required",
        compatibility: "React Native 0.83.1+, TypeScript 5.9+",
      },
    },
    {
      version: "0.0.14",
      releaseDate: "2025-01-03",
      status: "Stable",
      highlights: [
        "✨ Initial app version bump",
        "🐛 Bug fixes and improvements",
      ],
      changes: {
        Added: ["Alert component to App.tsx"],
        Fixed: [
          "Missing Alert import in App.tsx",
          "TypeScript errors in type checking",
        ],
      },
      features: [],
      technicalDetails: {
        dependencies: "None",
        breakingChanges: "None",
        migrations: "None",
        compatibility: "React Native 0.83.1+",
      },
    },
    {
      version: "0.0.13",
      releaseDate: "2025-01-02",
      status: "Stable",
      highlights: ["🤖 AI-powered chat assistant", "💬 GitHub and npm support"],
      changes: {
        Added: [
          "AI-powered chat assistant for GitHub repositories and npm packages",
          "Integration with Gemini and Ollama AI providers",
          "Chat history management",
          "Context-aware responses for repos and packages",
          "Secure API key storage",
        ],
        Improved: [
          "Home screen layout for better content discovery",
          "User interface responsiveness",
        ],
      },
      features: [],
      technicalDetails: {
        dependencies: "Added Zustand for state management",
        breakingChanges: "None",
        migrations: "None",
        compatibility: "React Native 0.83.1+",
      },
    },
  ];

  return json({ changelogs });
};

export default function Changelog() {
  const { changelogs } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-emerald-500/20 bg-slate-900/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2">
            Changelog
          </h1>
          <p className="text-slate-300">
            Track all updates and improvements to Involvex
          </p>
        </div>
      </div>

      {/* Changelogs */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {changelogs.map((changelog) => (
          <ChangelogItem key={changelog.version} changelog={changelog} />
        ))}
      </div>
    </div>
  );
}

function ChangelogItem({ changelog }: { changelog: Changelog }) {
  return (
    <div className="mb-12 last:mb-0">
      {/* Version Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-2xl font-bold text-emerald-400">
            v{changelog.version}
          </h2>
          <div className="flex gap-2">
            {changelog.status === "Latest" && (
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-xs font-semibold text-emerald-400">
                Latest
              </span>
            )}
            {changelog.status === "Stable" && (
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-xs font-semibold text-blue-400">
                Stable
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Released on{" "}
          {new Date(changelog.releaseDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Highlights */}
      {changelog.highlights.length > 0 && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3">
            Highlights
          </h3>
          <ul className="space-y-2">
            {changelog.highlights.map((highlight, idx) => (
              <li key={idx} className="text-sm text-emerald-300">
                ✨ {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Changes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(changelog.changes).map(
          ([category, items]) =>
            items.length > 0 && (
              <div
                key={category}
                className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg"
              >
                <h3 className="font-semibold text-slate-200 mb-3">
                  {category === "Added" && "➕ Added"}
                  {category === "Improved" && "⬆️ Improved"}
                  {category === "Fixed" && "🔧 Fixed"}
                </h3>
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-300 leading-relaxed"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ),
        )}
      </div>

      {/* Features */}
      {changelog.features.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            Featured Updates
          </h3>
          <div className="space-y-4">
            {changelog.features.map((feature, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg"
              >
                <h4 className="font-semibold text-emerald-400 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-slate-300 mb-3">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.components.map((comp) => (
                    <code
                      key={comp}
                      className="px-2 py-1 bg-slate-900 text-xs text-emerald-300 rounded border border-slate-700"
                    >
                      {comp}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg text-sm">
        <h4 className="font-semibold text-slate-200 mb-3">Technical Details</h4>
        <div className="space-y-2 text-slate-300">
          <p>
            <strong className="text-slate-200">Dependencies:</strong>{" "}
            {changelog.technicalDetails.dependencies}
          </p>
          <p>
            <strong className="text-slate-200">Breaking Changes:</strong>{" "}
            {changelog.technicalDetails.breakingChanges}
          </p>
          <p>
            <strong className="text-slate-200">Migrations:</strong>{" "}
            {changelog.technicalDetails.migrations}
          </p>
          <p>
            <strong className="text-slate-200">Compatibility:</strong>{" "}
            {changelog.technicalDetails.compatibility}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 border-t border-slate-700/50"></div>
    </div>
  );
}
