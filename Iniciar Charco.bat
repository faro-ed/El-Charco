@echo off
title Charco - Salon de Eventos
echo.
echo   ====================================================
echo     CHARCO - Salon de Eventos con Piscina
echo     Iniciando vista previa local...
echo   ====================================================
echo.
echo   Abre tu navegador en:  http://localhost:3039
echo   (No cierres esta ventana mientras lo usas)
echo.
set NODE="C:\Users\rikar\AppData\Local\node-portable\node-v24.16.0-win-x64\node.exe"
start "" http://localhost:3039
%NODE% "%~dp0..\serve-charco.js"
pause
