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
    # Print to a temp file first: a failed or half-written Chrome run
    # must never replace the shipped PDF (final review).
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("cv-print-" + [guid]::NewGuid().ToString("N") + ".pdf")
    $url = "file:///" + ($html -replace "\\", "/")
    Write-Host "Printing $($t.Html) -> static/$($t.Pdf)"
    $proc = Start-Process -FilePath $Chrome -Wait -NoNewWindow -PassThru -ArgumentList @(
        "--headless=new",
        "--no-pdf-header-footer",
        "--print-to-pdf=$tmp",
        $url
    )
    if ($proc.ExitCode -ne 0) {
        Remove-Item $tmp -ErrorAction SilentlyContinue
        throw "Chrome exited with code $($proc.ExitCode) printing $($t.Html); static/$($t.Pdf) left untouched"
    }
    if (-not (Test-Path $tmp)) {
        throw "Chrome did not produce a PDF for $($t.Html); static/$($t.Pdf) left untouched"
    }
    $size = (Get-Item $tmp).Length
    if ($size -le 0) {
        Remove-Item $tmp -ErrorAction SilentlyContinue
        throw "Chrome produced an empty PDF for $($t.Html); static/$($t.Pdf) left untouched"
    }
    Move-Item -Path $tmp -Destination $pdf -Force
    Write-Host "Replaced static/$($t.Pdf) ($size bytes)"
}