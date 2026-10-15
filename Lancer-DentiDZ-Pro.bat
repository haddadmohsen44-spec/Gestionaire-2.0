@echo off
title DentiDZ Pro - Lancement Application Dentaire
color 0A
echo =======================================================
echo          DentiDZ Pro - Cabinet Dentaire Algerien
echo              Lancement en Mode Bureau Windows
echo =======================================================
echo.

:: Vérifier si dist existe déjà, sinon construire
if not exist "dist\index.html" (
    echo [INFO] Premiere execution detectee. Construction des fichiers...
    call npm run build
)

:: Obtenir le chemin absolu du fichier index.html
set "INDEX_FILE=%~dp0dist\index.html"

:: 1. Tenter d'ouvrir avec Microsoft Edge en mode Application Autonome (sans barre d'adresse)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    echo [LANCEMENT] Ouverture via Microsoft Edge App Mode...
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%INDEX_FILE%" --start-maximized
    exit /b
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    echo [LANCEMENT] Ouverture via Microsoft Edge App Mode...
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="file:///%INDEX_FILE%" --start-maximized
    exit /b
)

:: 2. Tenter avec Google Chrome en mode Application
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo [LANCEMENT] Ouverture via Google Chrome App Mode...
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%INDEX_FILE%" --start-maximized
    exit /b
)

:: 3. Repli navigateur standard
echo [LANCEMENT] Ouverture dans votre navigateur par defaut...
start "" "%INDEX_FILE%"
exit /b
