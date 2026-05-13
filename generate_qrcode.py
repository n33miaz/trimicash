#!/usr/bin/env python3
"""
generate_qrcode.py — TrimiCash
Gera um QR Code PNG apontando para a versão limpa (blank) do app.

Dependências:
  pip install qrcode[pil]

Saída:
  trimicash_qrcode.png — QR Code na raiz do projeto
"""

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask

# ── URL com seed=blank: limpa toda a storage e inicia cenário em branco ──
URL = "https://trimicash.vercel.app/?seed=blank"

OUTPUT_FILE = "trimicash_qrcode.png"

def main() -> None:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(URL)
    qr.make(fit=True)

    # Estilo premium: módulos arredondados com cor escura (#1a1a2e) sobre branco
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        color_mask=SolidFillColorMask(
            back_color=(255, 255, 255),
            front_color=(26, 26, 46),    # #1a1a2e — dark navy
        ),
    )

    img.save(OUTPUT_FILE)
    print(f"[OK] QR Code gerado: {OUTPUT_FILE}")
    print(f"     URL: {URL}")

if __name__ == "__main__":
    main()
