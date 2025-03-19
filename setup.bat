@echo off
setlocal

REM Check if the required files and folders exist
if not exist "src\" (
    echo Error: src folder not found.
    exit /b 1
)

if not exist "src\commandHandler.js" (
    echo Error: src\commandHandler.js not found.
    exit /b 1
)

if not exist "src\syntaxHandler.js" (
    echo Error: src\syntaxHandler.js not found.
    exit /b 1
)

REM Move the folder to Program Files and rename it to diaScript
set "currentFolder=%~dp0"
set "targetFolder=%ProgramFiles%\diaScript"

if exist "%targetFolder%" (
    echo Error: diaScript folder already exists in Program Files.
    exit /b 1
)

xcopy "%currentFolder%" "%targetFolder%" /E /I /H /Y
if errorlevel 1 (
    echo Error: Failed to copy folder to Program Files.
    exit /b 1
)

REM Add the folder to the PATH
setx PATH "%PATH%;%targetFolder%"

echo diaScript has been successfully installed and added to the PATH.
pause
endlocal