Add-Type -AssemblyName System.Drawing

function Remove-WhiteBackground($inFile, $outFile, $threshold = 230) {
    $fullIn = Resolve-Path $inFile
    $img = [System.Drawing.Image]::FromFile($fullIn)
    $bmp = New-Object System.Drawing.Bitmap($img)
    $img.Dispose()

    $w = $bmp.Width
    $h = $bmp.Height
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -gt $threshold -and $c.G -gt $threshold -and $c.B -gt $threshold) {
                $minVal = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
                if ($minVal -gt 245) {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                } else {
                    $alpha = [int](((255 - $minVal) / (255 - $threshold)) * 255)
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
                }
            } else {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }
    $bmp.Dispose()
    $fullOut = Join-Path (Get-Location) $outFile
    $outBmp.Save($fullOut, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "Created transparent PNG: $outFile"
}

Remove-WhiteBackground "public/images/brain.png" "public/images/brain.png" 230
Remove-WhiteBackground "public/images/lungs.png" "public/images/lungs.png" 230
Remove-WhiteBackground "public/images/heart.png" "public/images/heart.png" 230
Remove-WhiteBackground "public/images/kidney.png" "public/images/kidney.png" 230
Remove-WhiteBackground "public/images/stomach.png" "public/images/stomach.png" 230
