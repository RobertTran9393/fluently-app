@echo off
title Fluently English App - Local Server
cd /d "%~dp0"

echo ====================================================================
echo        FLUENTLY - HOC TIENG ANH CHO NGUOI MAT CAN BAN
echo ====================================================================
echo.
echo [*] Dang khoi dong may chu: http://localhost:3000 ...
echo [*] Trinh duyet se tu dong mo trong giay lat...
echo.
echo [!] Meo: Nhan Ctrl + C de tat may chu khi hoc xong.
echo ====================================================================
echo.

REM Mo trinh duyet sau 2 giay
start "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"

REM Khoi chay may chu Next.js
call npm.cmd run dev

pause
