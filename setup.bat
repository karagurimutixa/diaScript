@echo off
setlocal

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Downloading and installing Node.js...
    powershell -Command "Start-Process 'https://nodejs.org/dist/v16.13.0/node-v16.13.0-x64.msi' -Wait"
    echo Please install Node.js and run this script again.
    pause
    exit /b 1
)

REM Check if curl is installed
curl --version >nul 2>&1
if errorlevel 1 (
    echo curl is not installed. Downloading and installing curl...
    powershell -Command "Invoke-WebRequest -Uri 'https://curl.se/windows/dl-7.79.1_2/curl-7.79.1_2-win64-mingw.zip' -OutFile 'curl.zip'"
    powershell -Command "Expand-Archive -Path 'curl.zip' -DestinationPath '.' -Force"
    set "curlPath=%cd%\curl-7.79.1_2-win64-mingw\bin"
    setx PATH "%PATH%;%curlPath%"
)

REM Define the GitHub repository and API URL
set "REPO_OWNER=karagurimutixa"
set "REPO_NAME=diaScript"
set "API_URL=https://api.github.com/repos/%REPO_OWNER%/%REPO_NAME%/releases"

REM Define the target folder in Program Files
set "TARGET_FOLDER=%ProgramFiles%\diaScript"

REM Get the latest release or pre-release download URL
echo Fetching the latest release or pre-release from GitHub...
for /f "tokens=*" %%i in ('curl -s %API_URL% ^| findstr /r /c:"\"browser_download_url\": \"https://.*\.zip\""') do (
    set "DOWNLOAD_URL=%%i"
    goto :found
)
:found
set "DOWNLOAD_URL=%DOWNLOAD_URL:~23,-2%"

REM Download the latest release or pre-release
echo Downloading the latest release or pre-release from GitHub...
curl -L -o diaScript.zip %DOWNLOAD_URL%
if errorlevel 1 (
    echo Error: Failed to download the latest release or pre-release from GitHub.
    pause
    exit /b 1
)

REM Extract the downloaded zip file
echo Extracting diaScript.zip...
powershell -Command "Expand-Archive -Path diaScript.zip -DestinationPath . -Force"
if errorlevel 1 (
    echo Error: Failed to extract diaScript.zip.
    pause
    exit /b 1
)

REM Move the folder to Program Files and rename it to diaScript
echo Moving diaScript to Program Files...
if exist "%TARGET_FOLDER%" (
    echo Error: diaScript folder already exists in Program Files.
    pause
    exit /b 1
)
move /Y "diaScript-main" "%TARGET_FOLDER%"
if errorlevel 1 (
    echo Error: Failed to move diaScript to Program Files.
    pause
    exit /b 1
)

REM Add the folder to the PATH
echo Adding diaScript to the PATH...
setx PATH "%PATH%;%TARGET_FOLDER%"
if errorlevel 1 (
    echo Error: Failed to add diaScript to the PATH.
    pause
    exit /b 1
)

echo diaScript has been successfully installed and added to the PATH.
pause
endlocal