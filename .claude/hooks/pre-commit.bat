@echo off
REM Pre-commit hook for Involvex Flutter app (Windows)
REM Runs code analysis and tests before allowing commits

echo 🚀 Running pre-commit checks...
echo.

REM Check if we're in the project root
if not exist "pubspec.yaml" (
  echo ❌ Error: Must be run from project root directory
  exit /b 1
)

REM 1. Run Flutter analyzer
echo 📊 Running Flutter analyzer...
flutter analyze
if errorlevel 1 (
  echo ❌ Flutter analyzer found issues
  echo    Please fix analyzer warnings before committing
  exit /b 1
)
echo ✅ Flutter analyzer passed
echo.

REM 2. Run unit tests
echo 🧪 Running unit tests...
flutter test
if errorlevel 1 (
  echo ❌ Unit tests failed
  echo    Please fix failing tests before committing
  exit /b 1
)
echo ✅ Unit tests passed
echo.

REM 3. Check for generated files
echo 🔍 Checking for required generated files...
set MISSING_FILES=0

if not exist "lib\providers\auth_provider.g.dart" (
  echo ⚠️  Missing: lib\providers\auth_provider.g.dart
  set MISSING_FILES=1
)

if not exist "lib\providers\trending_provider.g.dart" (
  echo ⚠️  Missing: lib\providers\trending_provider.g.dart
  set MISSING_FILES=1
)

if %MISSING_FILES%==1 (
  echo ❌ Missing generated files
  echo    Run: flutter pub run build_runner build
  exit /b 1
)
echo ✅ All required generated files present
echo.

REM 4. Check Dart formatting
echo 🎨 Checking Dart formatting...
dart format --set-exit-if-changed --output=none lib test
if errorlevel 1 (
  echo ⚠️  Some files are not formatted
  echo    Would you like to format them now? (y/n)
  set /p RESPONSE=
  if /i "%RESPONSE%"=="y" (
    dart format lib test
    echo ✅ Files formatted
  ) else (
    echo ❌ Please format files before committing: dart format lib test
    exit /b 1
  )
) else (
  echo ✅ All files properly formatted
)
echo.

REM 5. Verify Appwrite configuration
echo ⚙️  Verifying Appwrite configuration...
if not exist "appwrite.config.json" (
  echo ⚠️  Missing appwrite.config.json
  echo    Run: appwrite init
) else (
  echo ✅ Appwrite configuration found
)
echo.

REM All checks passed!
echo ✨ All pre-commit checks passed!
echo    Safe to commit 🎉
echo.

exit /b 0
