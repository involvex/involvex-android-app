@echo off
REM Project State Checker for Involvex Flutter App (Windows)
REM Verifies that all components are properly configured

setlocal enabledelayedexpansion

echo 🔍 Checking Involvex Flutter App Project State
echo ==============================================
echo.

set ERRORS=0
set WARNINGS=0

REM 1. Check Flutter SDK
echo 📱 Flutter SDK
echo -------------
flutter --version >nul 2>&1
if %errorlevel% equ 0 (
  echo ✓ Flutter SDK found
) else (
  echo ✗ Flutter SDK not found
  set /a ERRORS+=1
)
echo.

REM 2. Check Appwrite CLI
echo ☁️  Appwrite CLI
echo -------------
appwrite --version >nul 2>&1
if %errorlevel% equ 0 (
  echo ✓ Appwrite CLI found

  REM Check Appwrite authentication
  appwrite health version >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✓ Appwrite CLI is authenticated
  ) else (
    echo ✗ Appwrite CLI not authenticated - run: appwrite login
    set /a ERRORS+=1
  )
) else (
  echo ✗ Appwrite CLI not found - run: npm install -g appwrite
  set /a ERRORS+=1
)
echo.

REM 3. Check Appwrite Configuration
echo ⚙️  Appwrite Configuration
echo ------------------------
if exist "appwrite.config.json" (
  echo ✓ appwrite.config.json found

  REM Check for collections
  findstr /C:"\"$id\": \"user_settings\"" appwrite.config.json >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✓ Collection 'user_settings' configured
  ) else (
    echo ⚠ Collection 'user_settings' not found
    set /a WARNINGS+=1
  )

  findstr /C:"\"$id\": \"subscriptions\"" appwrite.config.json >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✓ Collection 'subscriptions' configured
  ) else (
    echo ⚠ Collection 'subscriptions' not found
    set /a WARNINGS+=1
  )

  findstr /C:"\"check-releases\"" appwrite.config.json >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✓ Cloud function 'check-releases' configured
  ) else (
    echo ⚠ Cloud function 'check-releases' not found
    set /a WARNINGS+=1
  )
) else (
  echo ✗ appwrite.config.json not found - run: appwrite init
  set /a ERRORS+=1
)
echo.

REM 4. Check Environment Configuration
echo 🔐 Environment Configuration
echo --------------------------
if exist "lib\config\environment.dart" (
  echo ✓ environment.dart found

  findstr /C:"YOUR_DISCORD_CLIENT_ID" lib\config\environment.dart >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✗ Discord OAuth not configured
    set /a ERRORS+=1
  ) else (
    echo ✓ Discord OAuth credentials configured
  )

  findstr /C:"YOUR_GITHUB_TOKEN" lib\config\environment.dart >nul 2>&1
  if %errorlevel% equ 0 (
    echo ⚠ GitHub token not configured (optional)
    set /a WARNINGS+=1
  ) else (
    echo ✓ GitHub token configured
  )
) else (
  echo ✗ lib\config\environment.dart not found
  set /a ERRORS+=1
)
echo.

REM 5. Check Code Generation
echo 🔨 Code Generation
echo ----------------
set ALL_GENERATED=1

if exist "lib\providers\auth_provider.g.dart" (
  echo ✓ Generated file: auth_provider.g.dart
) else (
  echo ✗ Missing: auth_provider.g.dart
  set ALL_GENERATED=0
  set /a ERRORS+=1
)

if exist "lib\providers\trending_provider.g.dart" (
  echo ✓ Generated file: trending_provider.g.dart
) else (
  echo ✗ Missing: trending_provider.g.dart
  set ALL_GENERATED=0
  set /a ERRORS+=1
)

if %ALL_GENERATED%==0 (
  echo.
  echo   Run: flutter pub run build_runner build
)
echo.

REM 6. Check Dependencies
echo 📦 Dependencies
echo -------------
if exist "pubspec.yaml" (
  echo ✓ pubspec.yaml found

  if exist "pubspec.lock" (
    echo ✓ Dependencies installed
  ) else (
    echo ⚠ Dependencies not installed - run: flutter pub get
    set /a WARNINGS+=1
  )

  findstr /C:"appwrite:" pubspec.yaml >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✓ Dependency 'appwrite' found
  ) else (
    echo ✗ Missing dependency: appwrite
    set /a ERRORS+=1
  )

  findstr /C:"riverpod:" pubspec.yaml >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✓ Dependency 'riverpod' found
  ) else (
    echo ✗ Missing dependency: riverpod
    set /a ERRORS+=1
  )
) else (
  echo ✗ pubspec.yaml not found
  set /a ERRORS+=1
)
echo.

REM 7. Check Project Structure
echo 📁 Project Structure
echo ------------------
if exist "lib\data\services" (echo ✓ Directory: lib\data\services) else (echo ⚠ Missing: lib\data\services && set /a WARNINGS+=1)
if exist "lib\data\models" (echo ✓ Directory: lib\data\models) else (echo ⚠ Missing: lib\data\models && set /a WARNINGS+=1)
if exist "lib\providers" (echo ✓ Directory: lib\providers) else (echo ⚠ Missing: lib\providers && set /a WARNINGS+=1)
if exist "functions\check-releases" (echo ✓ Directory: functions\check-releases) else (echo ⚠ Missing: functions\check-releases && set /a WARNINGS+=1)
if exist "test" (echo ✓ Directory: test) else (echo ⚠ Missing: test && set /a WARNINGS+=1)
echo.

REM 8. Check Critical Files
echo 📄 Critical Files
echo ---------------
if exist "lib\main.dart" (echo ✓ File: lib\main.dart) else (echo ✗ Missing: lib\main.dart && set /a ERRORS+=1)
if exist "lib\data\services\github_service.dart" (echo ✓ File: github_service.dart) else (echo ✗ Missing: github_service.dart && set /a ERRORS+=1)
if exist "lib\data\cache\cache_manager.dart" (echo ✓ File: cache_manager.dart) else (echo ✗ Missing: cache_manager.dart && set /a ERRORS+=1)
if exist "lib\utils\error_handler.dart" (echo ✓ File: error_handler.dart) else (echo ✗ Missing: error_handler.dart && set /a ERRORS+=1)
echo.

REM 9. Check Android Configuration
echo 🤖 Android Configuration
echo ----------------------
if exist "android\app\src\main\AndroidManifest.xml" (
  echo ✓ AndroidManifest.xml found

  findstr /C:"android:scheme=\"involvex\"" android\app\src\main\AndroidManifest.xml >nul 2>&1
  if %errorlevel% equ 0 (
    echo ✓ Deep linking configured
  ) else (
    echo ⚠ Deep linking not configured
    set /a WARNINGS+=1
  )
) else (
  echo ✗ AndroidManifest.xml not found
  set /a ERRORS+=1
)
echo.

REM Summary
echo ==============================================
echo 📊 Summary
echo ==============================================
if %ERRORS%==0 (
  if %WARNINGS%==0 (
    echo ✓ All checks passed!
    echo   Your project is fully configured and ready.
  ) else (
    echo ⚠ Checks completed with %WARNINGS% warning(s)
    echo   Your project is mostly configured.
  )
) else (
  echo ✗ Checks completed with %ERRORS% error(s) and %WARNINGS% warning(s)
  echo   Please fix the errors before proceeding.
  exit /b 1
)
echo.

exit /b 0
