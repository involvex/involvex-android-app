#!/bin/bash

# Pre-commit hook for Involvex Flutter app
# Runs code analysis and tests before allowing commits

set -e  # Exit on error

echo "🚀 Running pre-commit checks..."
echo ""

# Check if we're in the project root
if [ ! -f "pubspec.yaml" ]; then
  echo "❌ Error: Must be run from project root directory"
  exit 1
fi

# 1. Run Flutter analyzer
echo "📊 Running Flutter analyzer..."
if flutter analyze; then
  echo "✅ Flutter analyzer passed"
else
  echo "❌ Flutter analyzer found issues"
  echo "   Please fix analyzer warnings before committing"
  exit 1
fi
echo ""

# 2. Run unit tests
echo "🧪 Running unit tests..."
if flutter test; then
  echo "✅ Unit tests passed"
else
  echo "❌ Unit tests failed"
  echo "   Please fix failing tests before committing"
  exit 1
fi
echo ""

# 3. Check for generated files
echo "🔍 Checking for required generated files..."
MISSING_FILES=0

if [ ! -f "lib/providers/auth_provider.g.dart" ]; then
  echo "⚠️  Missing: lib/providers/auth_provider.g.dart"
  MISSING_FILES=1
fi

if [ ! -f "lib/providers/trending_provider.g.dart" ]; then
  echo "⚠️  Missing: lib/providers/trending_provider.g.dart"
  MISSING_FILES=1
fi

if [ $MISSING_FILES -eq 1 ]; then
  echo "❌ Missing generated files"
  echo "   Run: flutter pub run build_runner build"
  exit 1
fi
echo "✅ All required generated files present"
echo ""

# 4. Check for sensitive data in staged files
echo "🔒 Checking for sensitive data..."
SENSITIVE_PATTERNS=(
  "API_KEY"
  "SECRET_KEY"
  "PRIVATE_KEY"
  "PASSWORD"
  "DISCORD_CLIENT_SECRET"
)

FOUND_SENSITIVE=0
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  # Check staged files for sensitive patterns
  if git diff --cached --name-only | xargs grep -l "$pattern" 2>/dev/null; then
    echo "⚠️  Found potential sensitive data: $pattern"
    FOUND_SENSITIVE=1
  fi
done

if [ $FOUND_SENSITIVE -eq 1 ]; then
  echo "❌ Potential sensitive data found in staged files"
  echo "   Please review and use environment variables instead"
  exit 1
fi
echo "✅ No sensitive data detected"
echo ""

# 5. Check Dart formatting
echo "🎨 Checking Dart formatting..."
UNFORMATTED_FILES=$(dart format --set-exit-if-changed --output=none lib test 2>&1 || true)

if [ -n "$UNFORMATTED_FILES" ]; then
  echo "⚠️  Some files are not formatted"
  echo "$UNFORMATTED_FILES"
  echo ""
  echo "Would you like to format them now? (y/n)"
  read -r RESPONSE
  if [ "$RESPONSE" = "y" ] || [ "$RESPONSE" = "Y" ]; then
    dart format lib test
    echo "✅ Files formatted"
  else
    echo "❌ Please format files before committing: dart format lib test"
    exit 1
  fi
else
  echo "✅ All files properly formatted"
fi
echo ""

# 6. Check for TODO comments in modified files
echo "📝 Checking for TODO comments..."
TODO_COUNT=$(git diff --cached --name-only | xargs grep -c "TODO" 2>/dev/null || echo "0")

if [ "$TODO_COUNT" -gt 0 ]; then
  echo "⚠️  Found $TODO_COUNT TODO comments in staged files"
  echo "   Consider addressing them or creating issues"
fi
echo ""

# 7. Verify Appwrite configuration
echo "⚙️  Verifying Appwrite configuration..."
if [ ! -f "appwrite.config.json" ]; then
  echo "⚠️  Missing appwrite.config.json"
  echo "   Run: appwrite init"
else
  echo "✅ Appwrite configuration found"
fi
echo ""

# All checks passed!
echo "✨ All pre-commit checks passed!"
echo "   Safe to commit 🎉"
echo ""

exit 0
