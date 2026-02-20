@echo off
echo ===================================
echo    Auto-Sync RDO v3.0
echo ===================================
echo.
echo Iniciando monitoramento automatico...
echo Repositorio: https://github.com/Reifonas/TS_RDO.git
echo Intervalo: 15 segundos
echo.
echo Pressione Ctrl+C para parar
echo.

node auto-sync.js

echo.
echo Auto-sync finalizado.
pause