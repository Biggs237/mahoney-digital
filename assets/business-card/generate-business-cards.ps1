# Mahoney Digital — VistaPrint business card export (300 DPI, bleed)
# Run: powershell -ExecutionPolicy Bypass -File generate-business-cards.ps1

Add-Type -AssemblyName System.Drawing

$DPI = 300
$BleedW = [int](3.61 * $DPI)
$BleedH = [int](2.11 * $DPI)
$Margin = [int](0.125 * $DPI)

$Ink       = [System.Drawing.Color]::FromArgb(255, 11, 17, 32)
$Cream     = [System.Drawing.Color]::FromArgb(255, 248, 246, 241)
$Brand     = [System.Drawing.Color]::FromArgb(255, 13, 148, 136)
$BrandDark = [System.Drawing.Color]::FromArgb(255, 15, 118, 110)
$Muted     = [System.Drawing.Color]::FromArgb(255, 100, 116, 139)
$White     = [System.Drawing.Color]::White

function Get-CardFont([string]$name, [float]$size, [System.Drawing.FontStyle]$style) {
    $unit = [System.Drawing.GraphicsUnit]::Pixel
    return New-Object System.Drawing.Font($name, $size, $style, $unit)
}

function Draw-LogoMark([System.Drawing.Graphics]$g, [int]$cx, [int]$cy, [int]$diameter) {
    $r = [int]($diameter / 2)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $brush = New-Object System.Drawing.SolidBrush $Ink
    $g.FillEllipse($brush, ($cx - $r), ($cy - $r), $diameter, $diameter)
    $brush.Dispose()
    $fontSize = [float]($diameter * 0.44)
    $ff = Get-CardFont "Segoe UI" $fontSize ([System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("M", $ff, [System.Drawing.Brushes]::White, [single]$cx, [single]($cy + 3), $sf)
    $ff.Dispose()
    $sf.Dispose()
}

function Draw-AccentBar([System.Drawing.Graphics]$g, [int]$x, [int]$y, [int]$w, [int]$h) {
    $rect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, $BrandDark, $Brand,
        [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()
}

# --- FRONT ---
$front = New-Object System.Drawing.Bitmap $BleedW, $BleedH
$gf = [System.Drawing.Graphics]::FromImage($front)
$gf.Clear($Cream)
$gf.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gf.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

Draw-AccentBar $gf 0 ($BleedH - 8) $BleedW 8

$logoX = $Margin + 70
$logoY = [int]($BleedH / 2)
Draw-LogoMark $gf $logoX $logoY 96

$textX = $logoX + 68
$nameFont = Get-CardFont "Segoe UI" 34 ([System.Drawing.FontStyle]::Bold)
$tagFont  = Get-CardFont "Segoe UI" 13 ([System.Drawing.FontStyle]::Regular)
$subFont  = Get-CardFont "Segoe UI" 11 ([System.Drawing.FontStyle]::Italic)

$inkBrush = New-Object System.Drawing.SolidBrush $Ink
$mutedBrush = New-Object System.Drawing.SolidBrush $Muted
$brandBrush = New-Object System.Drawing.SolidBrush $BrandDark

$gf.DrawString("Mahoney Digital", $nameFont, $inkBrush, $textX, ($logoY - 48))
$gf.DrawString("Professional websites for", $tagFont, $mutedBrush, $textX, ($logoY - 6))
$gf.DrawString("small local businesses.", $tagFont, $mutedBrush, $textX, ($logoY + 14))
$gf.DrawString("Clear pricing. No hype.", $subFont, $brandBrush, $textX, ($logoY + 38))

$nameFont.Dispose(); $tagFont.Dispose(); $subFont.Dispose()
$inkBrush.Dispose(); $mutedBrush.Dispose(); $brandBrush.Dispose()
$gf.Dispose()

# --- BACK ---
$back = New-Object System.Drawing.Bitmap $BleedW, $BleedH
$gb = [System.Drawing.Graphics]::FromImage($back)
$gb.Clear($White)
$gb.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gb.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

Draw-AccentBar $gb 0 0 $BleedW 6
Draw-LogoMark $gb ($BleedW - $Margin - 44) ($Margin + 44) 68

$left = $Margin + 16
$top = $Margin + 28

$boldF = Get-CardFont "Segoe UI" 26 ([System.Drawing.FontStyle]::Bold)
$roleF = Get-CardFont "Segoe UI" 12 ([System.Drawing.FontStyle]::Regular)
$bodyF = Get-CardFont "Segoe UI" 14 ([System.Drawing.FontStyle]::Regular)
$locF  = Get-CardFont "Segoe UI" 10 ([System.Drawing.FontStyle]::Regular)

$inkBrush2 = New-Object System.Drawing.SolidBrush $Ink
$mutedBrush2 = New-Object System.Drawing.SolidBrush $Muted
$brandBrush2 = New-Object System.Drawing.SolidBrush $BrandDark

$gb.DrawString("Jeremy Mahoney", $boldF, $inkBrush2, $left, $top)
$gb.DrawString("Owner & Lead Designer", $roleF, $mutedBrush2, $left, ($top + 36))

$y = $top + 88
$gb.DrawString("hello@mahoneydigital.net", $bodyF, $brandBrush2, $left, $y)
$gb.DrawString("(740) 492-8601", $bodyF, $brandBrush2, $left, ($y + 30))
$gb.DrawString("mahoneydigital.net", $bodyF, $inkBrush2, $left, ($y + 60))
$gb.DrawString("Chillicothe, Ohio - Ross and surrounding counties", $locF, $mutedBrush2, $left, ($BleedH - $Margin - 28))

$boldF.Dispose(); $roleF.Dispose(); $bodyF.Dispose(); $locF.Dispose()
$inkBrush2.Dispose(); $mutedBrush2.Dispose(); $brandBrush2.Dispose()
$gb.Dispose()

$outDir = $PSScriptRoot
$frontPath = Join-Path $outDir "mahoney-digital-card-FRONT-bleed-300dpi.png"
$backPath  = Join-Path $outDir "mahoney-digital-card-BACK-bleed-300dpi.png"
$front.Save($frontPath, [System.Drawing.Imaging.ImageFormat]::Png)
$back.Save($backPath, [System.Drawing.Imaging.ImageFormat]::Png)
$front.Dispose()
$back.Dispose()

Write-Host "Created:"
Write-Host "  $frontPath"
Write-Host "  $backPath"
Write-Host "Size: ${BleedW}x${BleedH}px - upload to VistaPrint as Front / Back."