#!/usr/bin/env python3
"""Logo Ragna : mot en mono, drapeau tricolore conservé.

Part de l'original (mot blanc + drapeau en coup de pinceau sur fond sombre) et
produit deux fichiers à fond transparent :
  assets/uploads/partenaire-ragna-wordmark.png        mot craie, pour les fonds sombres
  assets/uploads/partenaire-ragna-wordmark-light.png  mot noir chaud, pour les fonds clairs (papier)
Le drapeau garde ses couleurs réelles dans les deux. Usage :
  python3 scripts/ragna-logo.py chemin/vers/original.png
"""
import sys
import numpy as np
from PIL import Image

SRC = sys.argv[1]
SCALE = 3          # on travaille en 3x pour des bords nets, sortie en 3x (affichage réduit par le CSS)
SPLIT = 166        # colonne (px d'origine) qui sépare le mot (x < 166) du drapeau (x >= 166)
CROP = (17, 14, 219, 66)   # zone utile, px d'origine

im = Image.open(SRC).convert("RGB")
bg = np.array(im.getpixel((0, 0)), dtype=float)
big = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
a = np.array(big, dtype=float)
h, w, _ = a.shape

# alpha du mot : écart de luminosité au fond, ramené sur le blanc du texte
lum = a.max(axis=2)
lum_bg = bg.max()
alpha_word = np.clip((lum - lum_bg) / (235.0 - lum_bg), 0, 1)

# alpha du drapeau : écart de couleur au fond (opaque dès 80 d'écart), couleurs dé-prémultipliées
diff = np.abs(a - bg).max(axis=2)
alpha_flag = np.clip(diff / 80.0, 0, 1)
safe = np.maximum(alpha_flag, 1e-3)[..., None]
flag_rgb = np.clip((a - (1 - alpha_flag)[..., None] * bg) / safe, 0, 255)

x = np.arange(w)[None, :] / SCALE
is_flag = x >= SPLIT

def build(word_rgb):
    out = np.zeros((h, w, 4), dtype=float)
    word = np.broadcast_to(np.array(word_rgb, dtype=float), (h, w, 3))
    out[..., :3] = np.where(is_flag[..., None], flag_rgb, word)
    out[..., 3] = np.where(is_flag, alpha_flag, alpha_word) * 255
    img = Image.fromarray(out.round().astype(np.uint8), "RGBA")
    box = tuple(v * SCALE for v in CROP)
    return img.crop(box)

build((242, 239, 232)).save("assets/uploads/partenaire-ragna-wordmark.png", optimize=True)
build((14, 14, 13)).save("assets/uploads/partenaire-ragna-wordmark-light.png", optimize=True)
print("ok")
