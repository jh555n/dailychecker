"""Render the existing d. brand as an opaque 1024px App Store icon (Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
scale = 4
image = Image.new('RGB', (1024 * scale, 1024 * scale), '#2F654D')
draw = ImageDraw.Draw(image)
def ellipse(cx, cy, radius, fill):
    draw.ellipse(tuple(int(v * scale) for v in (cx-radius, cy-radius, cx+radius, cy+radius)), fill=fill)
ellipse(422, 574, 216, 'white')
ellipse(422, 574, 128, '#2F654D')
draw.rounded_rectangle(tuple(v * scale for v in (550, 214, 638, 790)), radius=44 * scale, fill='white')
ellipse(768, 746, 48, 'white')
image.resize((1024, 1024), Image.Resampling.LANCZOS).save(root / 'assets' / 'icon.png')
print('assets/icon.png: 1024×1024, RGB, opaque')
