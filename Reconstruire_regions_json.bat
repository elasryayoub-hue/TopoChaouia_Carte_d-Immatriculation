@echo off
title TopoChaouia — Reconstruction de regions.json
cd /d "%~dp0"

REM Ce script n'a besoin d'aucun module special (pas de GDAL) : n'importe
REM quel Python 3 suffit. On essaie d'abord un Python "normal" sur le
REM PATH, puis en dernier recours celui de l'environnement conda "cadgis"
REM s'il existe.

where python >nul 2>nul
if %errorlevel%==0 (
    python rebuild_regions_json.py
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    py rebuild_regions_json.py
    goto :eof
)

if exist "%USERPROFILE%\miniconda3\envs\cadgis\python.exe" (
    "%USERPROFILE%\miniconda3\envs\cadgis\python.exe" rebuild_regions_json.py
    goto :eof
)
if exist "%USERPROFILE%\Miniconda3\envs\cadgis\python.exe" (
    "%USERPROFILE%\Miniconda3\envs\cadgis\python.exe" rebuild_regions_json.py
    goto :eof
)

echo Aucun Python trouve. Installez Python ou utilisez l'environnement
echo conda "cadgis" deja cree pour l'outil de traitement des zones.
pause
