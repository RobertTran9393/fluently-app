@echo off
cd /d "%~dp0"

echo Dang tao loi tat (Shortcut) ra man hinh Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tao_Shortcut.ps1"

echo.
echo ========================================================
echo   DA TAO THANH CONG ICON TREN MAN HINH CHINH (DESKTOP)!
echo   Ten icon: "Fluently - Hoc Tieng Anh"
echo ========================================================
echo.
pause
