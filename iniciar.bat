@echo off
setlocal

set "BACKEND_DIR=%~dp0"
if "%BACKEND_DIR:~-1%"=="\" set "BACKEND_DIR=%BACKEND_DIR:~0,-1%"

set "FRONTEND_DIR=%~dp0..\ct-e-automation-front"

if not exist "%FRONTEND_DIR%" (
  echo Nao encontrei a pasta do front em "%FRONTEND_DIR%".
  echo Este arquivo espera que CT-e-Automation e ct-e-automation-front
  echo estejam clonados lado a lado, dentro da mesma pasta pai.
  pause
  exit /b 1
)

if not exist "%BACKEND_DIR%\.env" (
  echo JWT_TOKEN=troque-este-valor-secreto> "%BACKEND_DIR%\.env"
  echo Criei um .env padrao no backend ^(troque o valor se quiser^).
)

if not exist "%BACKEND_DIR%\node_modules" (
  echo Instalando dependencias do backend, aguarde...
  call npm install --prefix "%BACKEND_DIR%"
)

if not exist "%FRONTEND_DIR%\node_modules" (
  echo Instalando dependencias do frontend, aguarde...
  call npm install --prefix "%FRONTEND_DIR%"
)

start "CT-e Backend" /D "%BACKEND_DIR%" cmd /k npm run dev
start "CT-e Frontend" /D "%FRONTEND_DIR%" cmd /k call "%BACKEND_DIR%\_run_frontend.bat"

echo Backend (3000) e frontend (3001) foram iniciados em janelas separadas.
echo Abra http://localhost:3001 no navegador.
