"""
Visual DSA app assets from logo 5b (the line-art tree). Colours are the app's tokens.

To remake the PNGs in assets/images (macOS):
    python3 assets/brand/source/make_icons.py assets/brand/source
    cd assets/brand/source && for f in *.svg; do sips -s format png "$f" --out "../../images/${f%.svg}.png"; done
    swift flatten.swift ../../images/icon.png ../../images/icon-dark.png ../../images/icon-tinted.png
The last line removes the alpha channel from the iOS icons, which the App Store requires.
"""
import math, os, sys
OUT = sys.argv[1]

# Tokens (src/theme/tokens.css).
SURFACE, BACKGROUND, INK, SIGNAL = '#f0ece4', '#faf8f4', '#22201c', '#e8611f'
D_BACKGROUND, D_SURFACE, D_INK, D_SIGNAL = '#1a1917', '#24221f', '#eee9e0', '#ff8044'

# The mark: a binary tree, root in focus. Node centre (x, y) and radius, in mark units.
NODES = {'root': (90, 52, 17), 'l': (54, 100, 14), 'r': (126, 100, 14), 'll': (34, 146, 11), 'lr': (74, 146, 11)}
EDGES = [('root', 'l'), ('root', 'r'), ('l', 'll'), ('l', 'lr')]
STROKE = 3.6
# Bounding box (with the stroke) and centre of the mark.
X0, X1 = 34 - 11 - STROKE / 2, 126 + 14 + STROKE / 2
Y0, Y1 = 52 - 17, 146 + 11 + STROKE / 2
CX, CY, MARK_H = (X0 + X1) / 2, (Y0 + Y1) / 2, Y1 - Y0
# The farthest any part of the mark reaches from its centre, for Android's safe circle.
REACH = max(math.hypot(x - CX, y - CY) + r + STROKE / 2 for x, y, r in NODES.values())

def mark(line, root, size, scale):
    """The tree centred in a size × size canvas. Edges stop at the circles, so nodes are hollow."""
    parts = []
    for a, b in EDGES:
        (x1, y1, r1), (x2, y2, r2) = NODES[a], NODES[b]
        d = math.hypot(x2 - x1, y2 - y1); ux, uy = (x2 - x1) / d, (y2 - y1) / d
        parts.append(f'<line x1="{x1+ux*r1:.2f}" y1="{y1+uy*r1:.2f}" x2="{x2-ux*r2:.2f}" y2="{y2-uy*r2:.2f}" '
                     f'stroke="{line}" stroke-width="{STROKE}" stroke-linecap="round"/>')
    for key, (x, y, r) in NODES.items():
        if key == 'root':
            parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{root}"/>')
        else:
            parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{line}" stroke-width="{STROKE}"/>')
    return (f'<g transform="translate({size/2} {size/2}) scale({scale:.4f}) translate({-CX:.2f} {-CY:.2f})">'
            + ''.join(parts) + '</g>')

def svg(size, body, background=None):
    bg = f'<rect width="{size}" height="{size}" fill="{background}"/>' if background else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{bg}{body}</svg>'

S = 1024
icon_scale = 0.62 * S / MARK_H            # the tree fills 62% of the icon's height
safe_scale = (S * 0.66 / 2) / REACH * 0.94  # Android: inside the 66% safe circle, with a little air
splash_scale = 0.9 * S / MARK_H           # the splash image is scaled down by imageWidth anyway

ASSETS = {
    # iOS and the default icon: opaque, full bleed; iOS rounds the corners.
    'icon': svg(S, mark(INK, SIGNAL, S, icon_scale), SURFACE),
    'icon-dark': svg(S, mark(D_INK, D_SIGNAL, S, icon_scale), D_SURFACE),
    'icon-tinted': svg(S, mark('#ffffff', '#ffffff', S, icon_scale), '#000000'),
    # Android adaptive icon: the mark on a transparent layer; the background is a colour.
    'android-icon-foreground': svg(S, mark(INK, SIGNAL, S, safe_scale)),
    'android-icon-monochrome': svg(S, mark('#ffffff', '#ffffff', S, safe_scale)),
    # Splash: transparent, on the page background (light and dark).
    'splash-icon': svg(S, mark(INK, SIGNAL, S, splash_scale)),
    'splash-icon-dark': svg(S, mark(D_INK, D_SIGNAL, S, splash_scale)),
}
os.makedirs(OUT, exist_ok=True)
for name, content in ASSETS.items():
    open(os.path.join(OUT, f'{name}.svg'), 'w').write(content)
print(f'reach {REACH:.1f}, safe scale {safe_scale:.2f}, icon scale {icon_scale:.2f}')
