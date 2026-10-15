@echo off
title DentiDZ Pro - Compilation Executable Windows (.EXE)
color 0B
echo ========================================================
echo        DentiDZ Pro - Generation de l'Application .EXE
echo ========================================================
echo.
echo [1/3] Verification de Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe sur ce PC.
    echo Veuillez installer Node.js depuis https://nodejs.org/ pour compiler le .exe localement.
    echo OU utilisez simplement le fichier 'Lancer-DentiDZ-Pro.bat' pour executer directement.
    pause
    exit /b
)

echo [2/3] Compilation de l'interface et du bundle Vite...
call npm run build
if %errorlevel% neq 0 (
    echo [ERREUR] La compilation Vite a echoue.
    pause
    exit /b
)

echo.
echo [3/3] Emballage de l'executable Windows (.exe NSIS + Portable)...
call npx electron-builder --win nsis portable

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCES ! L'executable Windows .EXE a ete genere !
    echo   Les fichiers se trouvent dans le dossier 'release\':
    echo   - DentiDZ Pro Setup.exe (Installateur complet)
    echo   - DentiDZ Pro.exe (Version portable sans installation)
    echo ========================================================
    explorer release
) else (
    echo.
    echo [ERREUR] Erreur lors de la generation de l'executable.
)

pause
