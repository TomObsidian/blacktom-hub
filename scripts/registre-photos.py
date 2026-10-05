#!/usr/bin/env python3
"""
Développe les photos du site « Registre » : noir et blanc, noir calé sur
Fonte (#0E0E0D), blanc calé sur Craie (#F2EFE8), grain cuit dans le fichier.

Usage :  python3 scripts/registre-photos.py [nom ...]   (sans argument : tout)

Sources : les originaux JPEG de Tom (assets/uploads/aNNNNNNN.jpg, 4672 x 7008,
et les dossiers « Shooting On Air » / « Shooting photo » à côté du dépôt).
Sortie  : assets/registre/<nom>.jpg  et  <nom>-sm.jpg (versions mobiles).
Les recadrages sont exprimés en fractions de l'image source (x0, y0, x1, y1).
Rien n'est inventé : aucune retouche de contenu, seulement cadrage, courbe et grain.
"""
import os, sys, random
from PIL import Image, ImageOps, ImageChops, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
ROOT = os.path.dirname(REPO)                      # dossier BLACK BOAR
UP = os.path.join(REPO, "assets", "uploads")
OUT = os.path.join(REPO, "assets", "registre")

FONTE = (14, 14, 13)
CRAIE = (242, 239, 232)

# nom: (source, (x0,y0,x1,y1), largeur principale, largeur mobile)
ASSETS = {
    # Couverture : portrait plein cadre (2:3), recadré en 4:5 par le CSS
    "cover":        (UP + "/a7401674.jpg", (0.00, 0.00, 1.00, 1.00), 1500, 800),
    # Dossier : bande 21:9 sur la barre de traction, de dos
    "band-barre":   (UP + "/a7401667.jpg", (0.00, 0.19, 1.00, 0.476), 2200, 1000),
    # Couverture Black Boar : la nuque tatouée, portrait 2:3
    "bb-cover":     (ROOT + "/Shooting On Air/DSC06468.jpg", (0.00, 0.00, 1.00, 1.00), 1500, 800),
    # Image de partage (Open Graph), 1200 x 630
    "og-home":      (UP + "/a7401674.jpg", (0.00, 0.13, 1.00, 0.48), 1200, 1200),
    # Portrait de la page À propos (2:3, recadré par le CSS)
    "about":        (UP + "/a7401679.jpg", (0.00, 0.00, 1.00, 1.00), 1500, 800),
    # Bandes 21:9 en tête d'article
    "band-dc40":    (UP + "/a7401572.jpg", (0.00, 0.22, 1.00, 0.506), 2200, 1000),
    "band-prog":    (UP + "/a7401763.jpg", (0.00, 0.17, 1.00, 0.456), 2200, 1000),
    "band-creatine":(UP + "/a7401533.jpg", (0.00, 0.285, 1.00, 0.571), 1365, 800),
    "band-recup":   (UP + "/a7401708.jpg", (0.00, 0.19, 1.00, 0.476), 2200, 1000),
    # Entrées de journal : détails 1:1
    "j-pilier":     (UP + "/a7401726.jpg", (0.00, 0.17, 1.00, 0.837), 900, 480),
    "j-bench":      (UP + "/a7401572.jpg", (0.00, 0.08, 1.00, 0.747), 900, 480),
    "j-creatine":   (UP + "/a7401533.jpg", (0.00, 0.15, 1.00, 0.817), 900, 480),
    "j-recup":      (UP + "/a7401708.jpg", (0.00, 0.12, 1.00, 0.787), 900, 480),
    # Univers
    "u-fullblack":  (UP + "/a7401713.jpg", (0.00, 0.20, 1.00, 0.867), 1000, 560),
    "u-blackboar":  (ROOT + "/Shooting On Air/DSC06468.jpg", (0.00, 0.10, 1.00, 0.767), 1000, 560),
    # Planche contact : 4:5
    "pc-01":        (UP + "/a7401564.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
    "pc-02":        (UP + "/a7401679.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
    "pc-03":        (UP + "/a7401684.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
    "pc-04":        (UP + "/a7401704.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
    "pc-05":        (UP + "/a7401760.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
    "pc-06":        (UP + "/a7401763.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
    "pc-07":        (UP + "/a7401667.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
    "pc-08":        (UP + "/a7401676.jpg", (0.00, 0.06, 1.00, 0.89), 640, 400),
}


def build_lut(black, white):
    """Niveaux (black..white -> 0..255) puis courbe en S douce."""
    lut = []
    span = max(white - black, 1)
    for i in range(256):
        t = min(max((i - black) / span, 0.0), 1.0)
        s = t * t * (3 - 2 * t)                   # smoothstep
        t = 0.55 * t + 0.45 * s                   # S-curve partielle
        t = t ** 0.96
        lut.append(int(round(t * 255)))
    return lut


def percentile(hist, total, p):
    acc, target = 0, total * p
    for i, n in enumerate(hist):
        acc += n
        if acc >= target:
            return i
    return 255


def develop(name, spec):
    src, (x0, y0, x1, y1), w_main, w_sm = spec
    if not os.path.exists(src):
        print("MANQUE", name, src)
        return
    im = Image.open(src)
    W0, H0 = im.size
    # décodage réduit : inutile de lire 33 Mpx pour une sortie de 1500 px
    want_w = max(w_main, 400) / max(x1 - x0, 0.01)
    im.draft("RGB", (int(want_w), int(want_w * H0 / W0)))
    im = im.convert("RGB")
    W, H = im.size
    box = (round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H))
    im = im.crop(box)
    # mélange des canaux : un peu plus de rouge pour garder la peau lumineuse
    r, g, b = im.split()
    lum = Image.merge("RGB", (r, g, b)).convert("L", matrix=(0.40, 0.50, 0.10, 0))
    for w, suffix in ((w_main, ""), (w_sm, "-sm")):
        h = round(lum.height * w / lum.width)
        L = lum.resize((w, h), Image.LANCZOS)
        hist = L.histogram()
        n = L.width * L.height
        black = percentile(hist, n, 0.004)
        white = percentile(hist, n, 0.9985)
        white = max(white, black + 60)
        L = L.point(build_lut(black, white))
        # grain monochrome cuit après le redimensionnement
        random.seed(hash(name) & 0xFFFF)
        noise = Image.effect_noise((w, h), 7.0)    # gaussien centré sur 128
        L = ImageChops.add(L, noise, scale=1.0, offset=-128)
        L = ImageOps.colorize(L, black=FONTE, white=CRAIE)
        os.makedirs(OUT, exist_ok=True)
        path = os.path.join(OUT, name + suffix + ".jpg")
        L.save(path, "JPEG", quality=80, optimize=True, progressive=True, subsampling="4:2:0")
        print(f"{name}{suffix}: {w}x{h} {os.path.getsize(path)//1024} Ko")


if __name__ == "__main__":
    only = set(sys.argv[1:])
    for k, v in ASSETS.items():
        if not only or k in only:
            develop(k, v)
