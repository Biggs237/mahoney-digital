<#
OpenClaw — Mahoney Digital

Usage:
    .\openclaw.ps1                  # Coordinator (default)
    .\openclaw.ps1 telegram         # Telegram bot (persistent)
    .\openclaw.ps1 leads            # LeadGenerator one-shot
    .\openclaw.ps1 sales            # Sales — review follow-up queue
    .\openclaw.ps1 build "brief"    # WebsiteBuilder one-shot
#>

param(
    [string]$Command = "",
    [string]$Prompt = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

function Get-PythonExe {
    foreach ($name in @("python", "py", "python3")) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
    }
    $candidates = @(
        "$env:LOCALAPPDATA\Python\bin\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
    )
    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }
    return $null
}

function Start-Coordinator {
    Write-Host "OpenClaw Coordinator (Mahoney Digital)..." -ForegroundColor Cyan
    & grok --agent coordinator --cwd $ProjectRoot
}

function Start-TelegramBot {
    $python = Get-PythonExe
    if (-not $python) {
        Write-Host "Python is not installed (or not on PATH)." -ForegroundColor Red
        Write-Host ""
        Write-Host "Install:" -ForegroundColor Yellow
        Write-Host "  1. https://www.python.org/downloads/  -> Download Python 3.12+"
        Write-Host "  2. Run installer -> check 'Add python.exe to PATH'"
        Write-Host "  3. Close and reopen PowerShell, then:"
        Write-Host "       pip install -r tools/requirements.txt"
        Write-Host "       .\openclaw.ps1 telegram"
        exit 1
    }
    Write-Host "Starting Telegram bot ($python)..." -ForegroundColor Green
    & $python tools/openclaw_telegram_bot.py
}

function Run-LeadGenerator {
    Write-Host "LeadGenerator..." -ForegroundColor Yellow
    $p = "Find 5-8 Lane A trades prospects in Ross County OH not already in Outreach/. " +
         "Check dead/missing sites. Save to Outreach/Leads/ with today's date. Summary when done."
    & grok --agent leadgenerator -p $p --cwd $ProjectRoot --always-approve
}

function Run-Sales {
    Write-Host "Sales — follow-up queue..." -ForegroundColor Yellow
    $p = "Read Outreach/Activity_Log.md. Draft or refresh follow-up emails for the follow-up queue. " +
         "Save in each prospect folder. Do not send — list what's ready for owner review."
    & grok --agent sales -p $p --cwd $ProjectRoot --always-approve
}

function Run-WebsiteBuilder {
    if (-not $Prompt) {
        Write-Host 'Usage: .\openclaw.ps1 build "Essential site for [business] — [details]"' -ForegroundColor Red
        return
    }
    Write-Host "WebsiteBuilder..." -ForegroundColor Yellow
    & grok --agent websitebuilder -p $Prompt --cwd $ProjectRoot --always-approve
}

switch ($Command.ToLower()) {
    "" { Start-Coordinator }
    "coordinator" { Start-Coordinator }
    "telegram" { Start-TelegramBot }
    "leads" { Run-LeadGenerator }
    "lead" { Run-LeadGenerator }
    "sales" { Run-Sales }
    "build" { Run-WebsiteBuilder }
    default {
        Write-Host "Unknown: $Command" -ForegroundColor Red
        Write-Host 'Valid: (empty), coordinator, telegram, leads, sales, build "prompt"' -ForegroundColor Red
    }
}