import os
from PIL import Image, ImageDraw, ImageFont

SRC_DIR = r'C:\Users\Eren Sarıhasan\.gemini\antigravity\brain\f1e56bb8-607d-45b2-b027-dcbcad126cec\.user_uploaded'
DST_DIR = r'C:\Users\Eren Sarıhasan\.gemini\antigravity\scratch\turkiye-ezber\images'

tasks = [
    {
        'src': 'media_1789420608620.png',
        'out': 'tektonik-goller.jpg',
        'title': 'TEKTONİK GÖLLER',
        'badgeColor': '#1565c0'
    },
    {
        'src': 'media_1789421075187.png',
        'out': 'volkanik-goller.jpg',
        'title': 'VOLKANİK GÖLLER',
        'badgeColor': '#c62828'
    },
    {
        'src': 'media_1789420307021.png',
        'out': 'volkanik-set-goller.jpg',
        'title': 'VOLKANİK SET GÖLLERİ',
        'badgeColor': '#6a1b9a'
    },
    {
        'src': 'media_1789420608715.png',
        'out': 'karstik-goller.jpg',
        'title': 'KARSTİK GÖLLER',
        'badgeColor': '#e65100'
    },
    {
        'src': 'media_1789420307118.png',
        'out': 'buzul-goller.jpg',
        'title': 'BUZUL GÖLLERİ',
        'badgeColor': '#1565c0'
    },
    {
        'src': 'media_1789420307016.png',
        'out': 'aluvyon-set-goller.jpg',
        'title': 'ALÜVYON SET GÖLLERİ',
        'badgeColor': '#2e7d32'
    },
    {
        'src': 'media_1789420306982.png',
        'out': 'heyelan-set-goller.jpg',
        'title': 'HEYELAN SET GÖLLERİ',
        'badgeColor': '#795548'
    },
    {
        'src': 'media_1789420306974.png',
        'out': 'kiyi-set-goller.jpg',
        'title': 'KIYI SET GÖLLERİ',
        'badgeColor': '#00838f'
    }
]

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

font_path = 'C:/Windows/Fonts/segoeuib.ttf'
font = ImageFont.truetype(font_path, 16)

os.makedirs(DST_DIR, exist_ok=True)

for t in tasks:
    src_path = os.path.join(SRC_DIR, t['src'])
    dst_path = os.path.join(DST_DIR, t['out'])
    
    if not os.path.exists(src_path):
        print(f"Missing source: {src_path}")
        continue
        
    im = Image.open(src_path).convert('RGBA')
    w, h = im.size
    
    # Clean corners
    bgTL = im.getpixel((4, 4))
    bgBL = im.getpixel((4, h - 4))
    bgB = im.getpixel((w // 2, h - 4))
    bgBR = im.getpixel((w - 4, h - 4))
    
    draw = ImageDraw.Draw(im)
    # 1. Erase timer at top-left
    draw.rectangle([0, 0, 165, 60], fill=bgTL)
    # 2. Erase menu button at bottom-left
    draw.rectangle([0, h - 55, 75, h], fill=bgBL)
    # 3. Erase "Cevapları gönder" button at bottom-center cleanly
    draw.rectangle([300, 595, 720, h], fill=bgB)
    # 4. Erase sound & fullscreen icons at bottom-right
    draw.rectangle([w - 125, h - 55, w, h], fill=bgBR)
    
    # Draw badge
    badgeW = 280
    badgeH = 42
    badgeX = 14
    badgeY = 12
    
    # Shadow layer
    shadow = Image.new('RGBA', im.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([badgeX + 2, badgeY + 2, badgeX + badgeW + 2, badgeY + badgeH + 2], radius=6, fill=(0, 0, 0, 90))
    im = Image.alpha_composite(im, shadow)
    
    # Badge rectangle
    draw = ImageDraw.Draw(im)
    col = hex_to_rgb(t['badgeColor'])
    badge_color_rgba = (col[0], col[1], col[2], 255)
    draw.rounded_rectangle([badgeX, badgeY, badgeX + badgeW, badgeY + badgeH], radius=6, fill=badge_color_rgba, outline=(255, 255, 255, 255), width=2)
    
    # Center text
    bbox = font.getbbox(t['title'])
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = badgeX + (badgeW - tw) / 2 - bbox[0]
    ty = badgeY + (badgeH - th) / 2 - bbox[1]
    draw.text((tx, ty), t['title'], fill=(255, 255, 255, 255), font=font)
    
    # Save as high quality JPEG
    final_im = im.convert('RGB')
    final_im.save(dst_path, 'JPEG', quality=96)
    print(f"Successfully processed {t['out']}: '{t['title']}'")

print("All lake maps processed successfully!")
