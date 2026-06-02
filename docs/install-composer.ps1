# PowerShell script to install PHP and Composer on Windows
# Run this in PowerShell as Administrator if possible.

Write-Host "Installing PHP and Composer for Windows..."

# Create install directory
$installDir = "C:\php"
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir | Out-Null
}

# Download latest PHP (8.3 VC15 x64 Thread Safe - common choice)
# Note: Check https://windows.php.net/download/ for latest
$phpUrl = "https://windows.php.net/downloads/releases/php-8.3.11-Win32-vs16-x64.zip"
$phpZip = "$env:TEMP\php.zip"

Write-Host "Downloading PHP from $phpUrl ..."
try {
    Invoke-WebRequest -Uri $phpUrl -OutFile $phpZip -ErrorAction Stop
} catch {
    Write-Host "Download failed. Please download manually from https://windows.php.net/download/"
    exit 1
}

Write-Host "Extracting PHP to $installDir ..."
Expand-Archive -Path $phpZip -DestinationPath $installDir -Force

# Copy php.ini-development to php.ini
$phpIni = "$installDir\php.ini"
if (-not (Test-Path $phpIni)) {
    Copy-Item "$installDir\php.ini-development" $phpIni
}

# Enable common extensions (edit php.ini)
$iniContent = Get-Content $phpIni
$iniContent = $iniContent -replace ';extension=openssl', 'extension=openssl'
$iniContent = $iniContent -replace ';extension=mbstring', 'extension=mbstring'
$iniContent = $iniContent -replace ';extension=fileinfo', 'extension=fileinfo'
$iniContent = $iniContent -replace ';extension=gd', 'extension=gd'  # for images if needed
Set-Content -Path $phpIni -Value $iniContent

# Add to PATH (current session and user)
$env:Path = "$installDir;" + $env:Path
[Environment]::SetEnvironmentVariable("Path", $env:Path, "User")

Write-Host "PHP installed. Verifying..."
& "$installDir\php.exe" --version

# Download Composer
$composerUrl = "https://getcomposer.org/download/latest-stable/composer.phar"
$composerPhar = "$installDir\composer.phar"

Write-Host "Downloading Composer..."
Invoke-WebRequest -Uri $composerUrl -OutFile $composerPhar

# Create composer.bat wrapper
$composerBat = "$installDir\composer.bat"
@"
@echo off
php "%~dp0composer.phar" %*
"@ | Out-File -FilePath $composerBat -Encoding ASCII

# Add to PATH again
$env:Path = "$installDir;" + $env:Path
[Environment]::SetEnvironmentVariable("Path", $env:Path, "User")

Write-Host "Composer installed. Verifying..."
composer --version

Write-Host "Done! Restart your PowerShell or terminal for PATH to update fully."
Write-Host "To use: cd to your project and run 'composer init' or 'composer require ...'"
Write-Host "Note: This project (MahoneyDigital) is static HTML and doesn't use Composer. If you want PHP backend, let me know."