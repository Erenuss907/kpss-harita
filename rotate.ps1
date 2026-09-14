Add-Type -AssemblyName System.Drawing

$src = "..\..\brain\f1e56bb8-607d-45b2-b027-dcbcad126cec\.user_uploaded"
$dst = ".\images"

if (-not (Test-Path $dst)) {
    New-Item -ItemType Directory -Path $dst -Force | Out-Null
}

$list = @(
    @{ out = 'daglar.jpg'; src = 'media_1789413909197.jpg'; rot = 0 },
    @{ out = 'tektonik-goller.jpg'; src = 'media_1789413909118.jpg'; rot = 90 },
    @{ out = 'volkanik-goller.jpg'; src = 'media_1789413909089.jpg'; rot = 90 },
    @{ out = 'volkanik-set-goller.jpg'; src = 'media_1789413909083.jpg'; rot = 90 },
    @{ out = 'kiyi-set-goller.jpg'; src = 'media_1789413909130.jpg'; rot = 90 },
    @{ out = 'heyelan-set-goller.jpg'; src = 'media_1789414517015.jpg'; rot = 90 },
    @{ out = 'buzul-goller.jpg'; src = 'media_1789417175571.jpg'; rot = 90 },
    @{ out = 'aluvyon-set-goller.jpg'; src = 'media_1789417175576.jpg'; rot = 90 },
    @{ out = 'karstik-goller.jpg'; src = 'media_1789417175588.jpg'; rot = 90 }
)

foreach ($item in $list) {
    $sFile = Join-Path $src $item.src
    $dFile = Join-Path $dst $item.out

    if (Test-Path $sFile) {
        $bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $sFile).Path)
        if ($item.rot -eq 90) {
            $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
        }
        $bmp.Save((Join-Path (Get-Location) $dFile), [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $bmp.Dispose()
        Write-Host "Processed $($item.out)"
    } else {
        Write-Warning "Source missing: $sFile"
    }
}

Get-ChildItem $dst | Select-Object Name, Length
