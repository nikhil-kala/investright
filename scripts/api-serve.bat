@echo off
REM Fallback: start Laravel built-in server (use XAMPP Apache + investright-api.local when possible)
cd /d "C:\xampp\htdocs\investright-api"
"C:\xampp\php\php.exe" artisan serve --host=127.0.0.1 --port=8000
