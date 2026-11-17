# Task 11: print the bilingual CV templates to static/resume*.pdf.
#
#   powershell -File scripts/cv/print.ps1
#
# Headless Chrome renders each A4 template (scripts/cv/cv-*.html) with
# --print-to-pdf and no header/footer. The templates are build-time
# sources: only the PDFs ship. Re-run this after editing a template,
# then rebuild the site so dist/ picks the new PDFs up.
param(
    [string]$Chrome = "C:\Users\xht\AppData\Local\ms-playwright\chromium-1254\chrome-win64\chrome.exe"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $Chrome)) {
    throw "Chrome not found at $Chrome (pass -Chrome <path> to override)"
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$targets = @(
    @{ Html = "cv-en.html"; Pdf = "resume.pdf" },
    @{ Html = "cv-es.html"; Pdf = "resume-es.pdf" }
)

foreach ($t in $targets) {
    $html = Join-Path $PSScriptRoot $t.Html
    $pdf = Join-Path $repoRoot ("static/" + $t.Pdf)
    if (-not (Test-Path $html)) {
        throw "Missing template: $html"
    }
    $url = "file:///" + ($html -replace "\\", "/")
    Write-Host "Printing $($t.Html) -> static/$($t.Pdf)"
    Start-Process -FilePath $Chrome -Wait -NoNewWindow -ArgumentList @(
        "--headless=new",
        "--no-pdf-header-footer",
        "--print-to-pdf=$pdf",
        $url
    )
    if (-not (Test-Path $pdf)) {
        throw "Chrome did not produce $pdf"
    }
}