@echo off
REM Run artisan in Laravel backend (repo backend/ folder)
cd /d "%~dp0..\backend"
"C:\xampp\php\php.exe" artisan %*
