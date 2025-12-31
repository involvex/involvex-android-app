#!/bin/bash

# Project State Checker for Involvex Flutter App
# Verifies that all components are properly configured

set -e  # Exit on error

echo "🔍 Checking Involvex Flutter App Project State"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print success
print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
  echo -e "${RED}✗${NC} $1"
  ((ERRORS++))
}

# Function to print warning
print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

# 1. Check Flutter SDK
echo "📱 Flutter SDK"
echo "-------------"
if command -v flutter &> /dev/null; then
  FLUTTER_VERSION=$(flutter --version | head -n 1)
  print_success "Flutter SDK found: $FLUTTER_VERSION"
else
  print_error "Flutter SDK not found"
fi
echo ""

# 2. Check Appwrite CLI
echo "☁️  Appwrite CLI"
echo "-------------"
if command -v appwrite &> /dev/null; then
  APPWRITE_VERSION=$(appwrite --version 2>&1 || echo "Unknown")
  print_success "Appwrite CLI found: $APPWRITE_VERSION"

  # Check Appwrite login status
  if appwrite health version &> /dev/null; then
    print_success "Appwrite CLI is authenticated"
  else
    print_error "Appwrite CLI not authenticated - run: appwrite login"
  fi
else
  print_error "Appwrite CLI not found - run: npm install -g appwrite"
fi
echo ""

# 3. Check Appwrite Configuration
echo "⚙️  Appwrite Configuration"
echo "------------------------"
if [ -f "appwrite.config.json" ]; then
  print_success "appwrite.config.json found"

  # Check for required collections
  COLLECTIONS=("user_settings" "subscriptions" "notifications" "release_history")

  for COLLECTION in "${COLLECTIONS[@]}"; do
    if grep -q "\"\\$id\": \"$COLLECTION\"" appwrite.config.json; then
      print_success "Collection '$COLLECTION' configured"
    else
      print_warning "Collection '$COLLECTION' not found in config"
    fi
  done

  # Check for functions
  if grep -q "\"check-releases\"" appwrite.config.json; then
    print_success "Cloud function 'check-releases' configured"
  else
    print_warning "Cloud function 'check-releases' not found"
  fi
else
  print_error "appwrite.config.json not found - run: appwrite init"
fi
echo ""

# 4. Check Environment Configuration
echo "🔐 Environment Configuration"
echo "--------------------------"
if [ -f "lib/config/environment.dart" ]; then
  print_success "environment.dart found"

  # Check for Discord OAuth configuration
  if grep -q "YOUR_DISCORD_CLIENT_ID" lib/config/environment.dart; then
    print_error "Discord OAuth not configured - update lib/config/environment.dart"
  else
    print_success "Discord OAuth credentials configured"
  fi

  # Check for GitHub token
  if grep -q "YOUR_GITHUB_TOKEN" lib/config/environment.dart; then
    print_warning "GitHub token not configured (optional but recommended)"
  else
    print_success "GitHub token configured"
  fi
else
  print_error "lib/config/environment.dart not found"
fi
echo ""

# 5. Check Code Generation
echo "🔨 Code Generation"
echo "----------------"
GENERATED_FILES=(
  "lib/providers/auth_provider.g.dart"
  "lib/providers/trending_provider.g.dart"
)

ALL_GENERATED=true
for FILE in "${GENERATED_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    print_success "Generated file found: $FILE"
  else
    print_error "Generated file missing: $FILE"
    ALL_GENERATED=false
  fi
done

if [ "$ALL_GENERATED" = false ]; then
  echo ""
  echo "  Run: flutter pub run build_runner build"
fi
echo ""

# 6. Check Dependencies
echo "📦 Dependencies"
echo "-------------"
if [ -f "pubspec.yaml" ]; then
  print_success "pubspec.yaml found"

  # Check if pub get has been run
  if [ -f "pubspec.lock" ]; then
    print_success "Dependencies installed (pubspec.lock exists)"
  else
    print_warning "Dependencies not installed - run: flutter pub get"
  fi

  # Check for critical dependencies
  DEPENDENCIES=("appwrite" "riverpod" "dio" "hive")
  for DEP in "${DEPENDENCIES[@]}"; do
    if grep -q "$DEP:" pubspec.yaml; then
      print_success "Dependency '$DEP' found in pubspec.yaml"
    else
      print_error "Missing dependency: $DEP"
    fi
  done
else
  print_error "pubspec.yaml not found"
fi
echo ""

# 7. Check Project Structure
echo "📁 Project Structure"
echo "------------------"
REQUIRED_DIRS=(
  "lib/data/services"
  "lib/data/models"
  "lib/data/cache"
  "lib/providers"
  "lib/ui/pages"
  "lib/ui/components"
  "lib/utils"
  "functions/check-releases"
  "test"
  "integration_test"
)

for DIR in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$DIR" ]; then
    print_success "Directory exists: $DIR"
  else
    print_warning "Directory missing: $DIR"
  fi
done
echo ""

# 8. Check Critical Files
echo "📄 Critical Files"
echo "---------------"
CRITICAL_FILES=(
  "lib/main.dart"
  "lib/app.dart"
  "lib/data/services/github_service.dart"
  "lib/data/services/npm_service.dart"
  "lib/data/services/auth_service.dart"
  "lib/data/services/settings_service.dart"
  "lib/data/cache/cache_manager.dart"
  "lib/utils/error_handler.dart"
  "functions/check-releases/lib/main.dart"
)

for FILE in "${CRITICAL_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    print_success "File exists: $FILE"
  else
    print_error "Critical file missing: $FILE"
  fi
done
echo ""

# 9. Check Git Status
echo "🔀 Git Status"
echo "-----------"
if [ -d ".git" ]; then
  print_success "Git repository initialized"

  # Check for uncommitted changes
  if git diff-index --quiet HEAD -- 2>/dev/null; then
    print_success "No uncommitted changes"
  else
    print_warning "Uncommitted changes present"
  fi

  # Check current branch
  CURRENT_BRANCH=$(git branch --show-current)
  print_success "Current branch: $CURRENT_BRANCH"
else
  print_warning "Not a git repository"
fi
echo ""

# 10. Check Android Configuration
echo "🤖 Android Configuration"
echo "----------------------"
if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
  print_success "AndroidManifest.xml found"

  # Check for deep linking
  if grep -q "android:scheme=\"involvex\"" android/app/src/main/AndroidManifest.xml; then
    print_success "Deep linking configured for OAuth callback"
  else
    print_warning "Deep linking not configured"
  fi
else
  print_error "AndroidManifest.xml not found"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 Summary"
echo "=============================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo "  Your project is fully configured and ready."
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Checks completed with $WARNINGS warning(s)${NC}"
  echo "  Your project is mostly configured, but some optional items need attention."
else
  echo -e "${RED}✗ Checks completed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  echo "  Please fix the errors before proceeding."
  exit 1
fi
echo ""

exit 0
