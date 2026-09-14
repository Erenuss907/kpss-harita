Add-Type -AssemblyName System.Drawing

$src = "..\..\brain\f1e56bb8-607d-45b2-b027-dcbcad126cec\.user_uploaded"

$files = @(
    'media_1789420306982.png', # Heyelan Set
    'media_1789420306974.png', # Kiyi Set
    'media_1789420307016.png', # Aluvyon Set
    'media_1789420307021.png', # Volkanik Set
    'media_1789420307118.png'  # Buzul
)

foreach ($f in $files) {
    $p = Join-Path $src $f
    if (Test-Path $p) {
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $p).Path)
        Write-Host "$f : Width=$($img.Width), Height=$($img.Height)"
        $img.Dispose()
    } else {
        Write-Warning "Missing: $f"
    }
}
