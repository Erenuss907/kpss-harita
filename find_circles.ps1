$code = @"
using System;
using System.Collections.Generic;
using System.Drawing;

public class CircleDetector {
    public static void DetectCircles(string imgPath) {
        using (Bitmap bmp = new Bitmap(imgPath)) {
            int w = bmp.Width;
            int h = bmp.Height;

            List<Point> candidates = new List<Point>();

            for (int y = 160; y < 520; y++) {
                for (int x = 160; x < 850; x++) {
                    Color c = bmp.GetPixel(x, y);
                    if (c.R > 220 && c.G > 220 && c.B > 220) {
                        int blackCount = 0;
                        int r = 8;
                        int samples = 16;
                        for (int i = 0; i < samples; i++) {
                            double angle = i * 2 * Math.PI / samples;
                            int px = (int)(x + r * Math.Cos(angle));
                            int py = (int)(y + r * Math.Sin(angle));
                            if (px >= 0 && px < w && py >= 0 && py < h) {
                                Color pc = bmp.GetPixel(px, py);
                                if (pc.R < 80 && pc.G < 80 && pc.B < 80) {
                                    blackCount++;
                                }
                            }
                        }
                        if (blackCount >= 10) {
                            candidates.Add(new Point(x, y));
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
                    if (dx * dx + dy * dy < 20 * 20) {
                        centers[i] = new Point((centers[i].X + pt.X) / 2, (centers[i].Y + pt.Y) / 2);
                        merged = true;
                        break;
                    }
                }
                if (!merged) {
                    centers.Add(pt);
                }
            }

            Console.WriteLine(string.Format("Found {0} circle points in {1}:", centers.Count, System.IO.Path.GetFileName(imgPath)));
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

$files = @(
    '.\images\heyelan-set-goller.jpg',
    '.\images\kiyi-set-goller.jpg',
    '.\images\aluvyon-set-goller.jpg',
    '.\images\volkanik-set-goller.jpg',
    '.\images\buzul-goller.jpg',
    '.\images\tektonik-goller.jpg',
    '.\images\karstik-goller.jpg',
    '.\images\volkanik-goller.jpg'
)

foreach ($f in $files) {
    if (Test-Path $f) {
        [CircleDetector]::DetectCircles((Resolve-Path $f).Path)
    }
}
