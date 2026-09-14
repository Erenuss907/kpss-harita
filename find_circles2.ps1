$code = @"
using System;
using System.Collections.Generic;
using System.Drawing;

public class FlexibleCircleDetector {
    public static void Detect(string imgPath, int minR, int maxR, int darkThreshold, int lightThreshold, int yStart, int yEnd) {
        using (Bitmap bmp = new Bitmap(imgPath)) {
            int w = bmp.Width;
            int h = bmp.Height;

            List<Point> candidates = new List<Point>();

            for (int y = yStart; y < yEnd; y += 2) {
                for (int x = 160; x < 860; x += 2) {
                    Color c = bmp.GetPixel(x, y);
                    // Light center
                    if (c.R > lightThreshold && c.G > lightThreshold && c.B > lightThreshold) {
                        for (int r = minR; r <= maxR; r++) {
                            int darkHits = 0;
                            int samples = 16;
                            for (int i = 0; i < samples; i++) {
                                double angle = i * 2 * Math.PI / samples;
                                int px = (int)(x + r * Math.Cos(angle));
                                int py = (int)(y + r * Math.Sin(angle));
                                if (px >= 0 && px < w && py >= 0 && py < h) {
                                    Color pc = bmp.GetPixel(px, py);
                                    if (pc.R < darkThreshold && pc.G < darkThreshold && pc.B < darkThreshold) {
                                        darkHits++;
                                    }
                                }
                            }
                            if (darkHits >= 9) {
                                candidates.Add(new Point(x, y));
                                break;
                            }
                        }
                    }
                }
            }

            List<Point> centers = new List<Point>();
            foreach (var pt in candidates) {
                bool merged = false;
                for (int i = 0; i < centers.Count; i++) {
                    int dx = centers[i].X - pt.X;
                    int dy = centers[i].Y - pt.Y;
                    if (dx * dx + dy * dy < 16 * 16) {
                        centers[i] = new Point((centers[i].X + pt.X) / 2, (centers[i].Y + pt.Y) / 2);
                        merged = true;
                        break;
                    }
                }
                if (!merged) {
                    centers.Add(pt);
                }
            }

            Console.WriteLine(string.Format("Found {0} points in {1}:", centers.Count, System.IO.Path.GetFileName(imgPath)));
            centers.Sort((a, b) => a.X.CompareTo(b.X));
            for (int i = 0; i < centers.Count; i++) {
                double xPct = Math.Round(centers[i].X * 100.0 / w, 2);
                double yPct = Math.Round(centers[i].Y * 100.0 / h, 2);
                Console.WriteLine(string.Format("[{0}] px=({1}, {2}) -> x={3}, y={4}", i+1, centers[i].X, centers[i].Y, xPct, yPct));
            }
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

Write-Host "--- TEKTONIK ---"
[FlexibleCircleDetector]::Detect((Resolve-Path ".\images\tektonik-goller.jpg").Path, 4, 10, 100, 180, 200, 500)

Write-Host "--- KARSTIK ---"
[FlexibleCircleDetector]::Detect((Resolve-Path ".\images\karstik-goller.jpg").Path, 4, 10, 100, 180, 250, 520)

Write-Host "--- KIYI SET ---"
[FlexibleCircleDetector]::Detect((Resolve-Path ".\images\kiyi-set-goller.jpg").Path, 4, 10, 100, 180, 240, 480)
