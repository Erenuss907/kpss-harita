$code = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public class MapProcessorFinal {
    public static void CleanAndTitle(string srcPath, string dstPath, string title, string badgeColorHex) {
        using (Bitmap srcBmp = new Bitmap(srcPath)) {
            int w = srcBmp.Width;
            int h = srcBmp.Height;

            using (Bitmap bmp = new Bitmap(w, h, PixelFormat.Format24bppRgb)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.DrawImage(srcBmp, 0, 0, w, h);
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

                    // 1. Clean corners with background colors
                    Color bgTL = srcBmp.GetPixel(4, 4);
                    Color bgBL = srcBmp.GetPixel(4, h - 4);
                    Color bgB = srcBmp.GetPixel(w / 2, h - 4);
                    Color bgBR = srcBmp.GetPixel(w - 4, h - 4);

                    using (SolidBrush bTL = new SolidBrush(bgTL))
                    using (SolidBrush bBL = new SolidBrush(bgBL))
                    using (SolidBrush bB = new SolidBrush(bgB))
                    using (SolidBrush bBR = new SolidBrush(bgBR)) {
                        // Top-left (timer)
                        g.FillRectangle(bTL, 0, 0, 160, 65);
                        // Bottom-left (menu button)
                        g.FillRectangle(bBL, 0, h - 65, 80, 65);
                        // Bottom-center (submit button)
                        g.FillRectangle(bB, 340, h - 65, 345, 65);
                        // Bottom-right (sound & fullscreen icons)
                        g.FillRectangle(bBR, w - 130, h - 65, 130, 65);
                    }

                    // 2. Draw modern Title Badge at top-left
                    int badgeW = 280;
                    int badgeH = 42;
                    int badgeX = 14;
                    int badgeY = 12;

                    Color badgeCol = ColorTranslator.FromHtml(badgeColorHex);

                    // Shadow
                    using (SolidBrush shBrush = new SolidBrush(Color.FromArgb(50, 0, 0, 0))) {
                        g.FillRectangle(shBrush, badgeX + 2, badgeY + 2, badgeW, badgeH);
                    }
                    // Background
                    using (SolidBrush bgBrush = new SolidBrush(badgeCol)) {
                        g.FillRectangle(bgBrush, badgeX, badgeY, badgeW, badgeH);
                    }
                    // Border
                    using (Pen p = new Pen(Color.White, 2f)) {
                        g.DrawRectangle(p, badgeX, badgeY, badgeW, badgeH);
                    }
                    // Text
                    using (Font f = new Font("Segoe UI", 12.5f, FontStyle.Bold))
                    using (SolidBrush tBrush = new SolidBrush(Color.White))
                    using (StringFormat sf = new StringFormat()) {
                        sf.Alignment = StringAlignment.Center;
                        sf.LineAlignment = StringAlignment.Center;
                        RectangleF rf = new RectangleF(badgeX, badgeY, badgeW, badgeH);
                        g.DrawString(title, f, tBrush, rf, sf);
                    }
                }

                // Save as JPEG 95% quality
                ImageCodecInfo jCodec = null;
                foreach (var c in ImageCodecInfo.GetImageEncoders()) {
                    if (c.MimeType == "image/jpeg") { jCodec = c; break; }
                }
                EncoderParameters ep = new EncoderParameters(1);
                ep.Param[0] = new EncoderParameter(Encoder.Quality, 95L);
                bmp.Save(dstPath, jCodec, ep);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$src = "..\..\brain\f1e56bb8-607d-45b2-b027-dcbcad126cec\.user_uploaded"
$dst = ".\images"

# 1. Volkanik Göller
$vgSrc = Join-Path $src "media_1789421075187.png"
$vgDst = Join-Path $dst "volkanik-goller.jpg"
if (Test-Path $vgSrc) {
    [MapProcessorFinal]::CleanAndTitle((Resolve-Path $vgSrc).Path, (Join-Path (Get-Location) $vgDst), "VOLKANİK GÖLLER", "#c62828")
    Write-Host "Success: volkanik-goller.jpg"
}

# 2. Dağlar
$dagSrc = Join-Path $src "media_1789421106582.jpg"
$dagDst = Join-Path $dst "daglar.jpg"
if (Test-Path $dagSrc) {
    Copy-Item -Path (Resolve-Path $dagSrc).Path -Destination (Join-Path (Get-Location) $dagDst) -Force
    Write-Host "Success: daglar.jpg"
}

Get-ChildItem $dst | Select-Object Name, Length
