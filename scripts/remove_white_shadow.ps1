Add-Type -AssemblyName System.Drawing

function Remove-ShadowAndWhite($inFile, $outFile) {
    $fullIn = (Get-Item $inFile).FullName
    $img = [System.Drawing.Image]::FromFile($fullIn)
    $bmp = New-Object System.Drawing.Bitmap($img)
    $img.Dispose()

    $w = $bmp.Width
    $h = $bmp.Height
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            
            # If pixel is already transparent, keep it transparent
            if ($c.A -lt 10) {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                continue
            }

            # Check for white / grayish ground shadow (high RGB brightness or low saturation white glow)
            $brightness = ($c.R + $c.G + $c.B) / 3
            $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.G - $c.B), [Math]::Abs($c.R - $c.B)))

            # If pixel is bright white/gray shadow at bottom region (y > h * 0.65) or generally light gray/white background glow
            if ($brightness -gt 160 -and $diff -lt 30) {
                # Fade out ground shadow to complete transparency
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                $outBmp.SetPixel($x, $y, $c)
            }
        }
    }

    $bmp.Dispose()
    $tempFile = $fullIn + ".tmp.png"
    $outBmp.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()

    Remove-Item $fullIn -Force
    Move-Item $tempFile $fullIn -Force
    Write-Host "Cleaned white shadow from $inFile"
}

Remove-ShadowAndWhite "public/images/heart.png"
Remove-ShadowAndWhite "public/images/lungs.png"
Remove-ShadowAndWhite "public/images/kidney.png"
Remove-ShadowAndWhite "public/images/brain.png"
Remove-ShadowAndWhite "public/images/stomach.png"
