@echo off
cd /d "%~dp0\agent"
echo Starting PCCONTROL Agent...
node index.js
pause
