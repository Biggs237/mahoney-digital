# Cut mahoneydigital.net DNS from Netlify to Vercel (Porkbun API).
# Requires env vars: PORKBUN_API_KEY, PORKBUN_SECRET_API_KEY
# Get keys: Porkbun dashboard → Account → API Access

param(
    [string]$Domain = "mahoneydigital.net"
)

$apiKey = $env:PORKBUN_API_KEY
$secretKey = $env:PORKBUN_SECRET_API_KEY

if (-not $apiKey -or -not $secretKey) {
    Write-Error "Set PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY environment variables first."
    exit 1
}

$base = "https://api.porkbun.com/api/json/v3"
$auth = @{ apikey = $apiKey; secretapikey = $secretKey }

function Invoke-Porkbun {
    param([string]$Path, [hashtable]$Extra = @{})
    $body = $auth.Clone()
    foreach ($k in $Extra.Keys) { $body[$k] = $Extra[$k] }
    Invoke-RestMethod -Uri "$base/$Path" -Method POST -Body ($body | ConvertTo-Json) -ContentType "application/json"
}

Write-Host "Fetching current DNS records for $Domain..."
$records = Invoke-Porkbun "dns/retrieve/$Domain"
if ($records.status -ne "SUCCESS") {
    Write-Error "Failed to retrieve DNS: $($records | ConvertTo-Json -Compress)"
    exit 1
}

$vercelA = "76.76.21.21"
$vercelCname = "cname.vercel-dns.com"

foreach ($rec in $records.records) {
    $id = $rec.id
    $type = $rec.type
    $name = $rec.name
    $content = $rec.content

    if ($type -eq "ALIAS" -and $content -match "netlify") {
        Write-Host "Deleting Netlify ALIAS: $content (id $id)"
        Invoke-Porkbun "dns/delete/$Domain/$id" | Out-Null
    }

    if ($type -eq "A" -and ($name -eq "" -or $name -eq $Domain) -and $content -match "^(99\.83\.231\.61|75\.2\.60\.5)$") {
        Write-Host "Deleting Netlify A record: $content (id $id)"
        Invoke-Porkbun "dns/delete/$Domain/$id" | Out-Null
    }

    if ($type -eq "CNAME" -and ($name -eq "www" -or $name -eq "www.$Domain") -and $content -match "netlify") {
        Write-Host "Deleting Netlify www CNAME: $content (id $id)"
        Invoke-Porkbun "dns/delete/$Domain/$id" | Out-Null
    }
}

Write-Host "Adding Vercel A record (@ -> $vercelA)..."
Invoke-Porkbun "dns/create/$Domain" @{
    type = "A"
    name = ""
    content = $vercelA
    ttl = "600"
} | Out-Null

Write-Host "Adding Vercel www CNAME (www -> $vercelCname)..."
Invoke-Porkbun "dns/create/$Domain" @{
    type = "CNAME"
    name = "www"
    content = $vercelCname
    ttl = "600"
} | Out-Null

Write-Host "Done. MX/TXT records were left untouched (email safe)."
Write-Host "DNS may take 5-60 minutes to propagate."