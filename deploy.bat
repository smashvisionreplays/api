@echo off

REM Load environment variables from .env file
if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1"=="#" set %%a=%%b
    )
)

REM Docker Hub settings
set REPO=tomasossac/api
set SERVICE=api
if "%API_VERSION%"=="" (
    for /f "tokens=1-4 delims=:." %%a in ("%time%") do set timestamp=%%a%%b%%c
    for /f "tokens=1-3 delims=/" %%a in ("%date%") do set datestamp=%%c%%a%%b
    set VERSION=%datestamp%-%timestamp%
) else (
    set VERSION=%API_VERSION%
)

echo 🔨 Building Docker image...
docker build -t %REPO%:%SERVICE%-%VERSION% .
docker tag %REPO%:%SERVICE%-%VERSION% %REPO%:%SERVICE%-latest

echo 📤 Pushing to Docker Hub...
docker push %REPO%:%SERVICE%-%VERSION%
docker push %REPO%:%SERVICE%-latest

echo 🚀 Starting services...
set API_VERSION=%VERSION%
docker-compose pull api
docker-compose up -d

echo ✅ Deployment complete!
echo 📦 Images pushed:
echo   - %REPO%:%SERVICE%-%VERSION%
echo   - %REPO%:%SERVICE%-latest
echo 🌐 API running at: http://localhost:5000
echo ☁️ Cloudflare tunnel active