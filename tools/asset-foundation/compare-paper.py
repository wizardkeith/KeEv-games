"""Arrange original pixels and actual normal camera frames at shop height480.
Presentation only: crops, proportional scaling and labels; no colour edits.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import os

root = Path(__file__).resolve().parents[2]
out = root / os.environ.get('QA_OUTPUT', 'docs/reviews/evidence/asset-foundation-paper-v1-r2')
items = [
    ('EXACT ORIGINAL / left shop', root / 'docs/codex-v4/reference/Approved_Visual_Target_Misaki.png', (0, 0, 1184, 1024)),
    ('ACTUAL NORMAL / new paper set at right', out / 'paper-material-normal-game.png', (105, 75, 1190, 800)),
    ('ACTUAL NORMAL / matched grayform', out / 'paper-gray-normal-game.png', (105, 75, 1190, 800)),
]
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
panels = []
for label, path, box in items:
    im = Image.open(path).convert('RGB').crop(box)
    im = im.resize((round(im.width * 480 / im.height), 480), Image.Resampling.LANCZOS)
    panels.append((label, im))
canvas = Image.new('RGB', (sum(im.width for _, im in panels) + 48, 536), '#f5f1ea')
draw = ImageDraw.Draw(canvas)
x = 12
for label, im in panels:
    draw.text((x, 12), label, fill='#302b26', font=font)
    canvas.paste(im, (x, 44))
    x += im.width + 12
canvas.save(out / 'target-paper-material-gray-shop480.png')

# Previous frozen capture versus the new hierarchy: same crop/height, raw pixels.
before = root / 'docs/reviews/evidence/asset-foundation-paper-v1'
for mode in ['material', 'gray']:
    for angle in ['normal-game', 'oblique-left', 'oblique-right']:
        pair = []
        for label, folder in [('v1 / grouped hierarchy FAIL', before), ('R2 / hierarchy candidate', out)]:
            im = Image.open(folder / ('paper-' + mode + '-' + angle + '.png')).convert('RGB').crop((105, 75, 1190, 800))
            im = im.resize((round(im.width * 480 / im.height), 480), Image.Resampling.LANCZOS)
            pair.append((label, im))
        frame = Image.new('RGB', (sum(im.width for _, im in pair) + 36, 536), '#f5f1ea')
        draw = ImageDraw.Draw(frame)
        x = 12
        for label, im in pair:
            draw.text((x, 12), label, fill='#302b26', font=font)
            frame.paste(im, (x, 44))
            x += im.width + 12
        frame.save(out / ('v1-r2-' + mode + '-' + angle + '-shop480.png'))
