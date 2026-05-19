"""
Exporta os slides do LinkedIn (HTML -> PNG) usando Playwright headless.

Pre-requisitos:
    pip install playwright
    python -m playwright install chromium

Uso:
    python export_slides.py
    python export_slides.py --scale 2          # imagem retina (2400x1260)
    python export_slides.py --slide 1          # exporta apenas slide_phase_1
    python export_slides.py --out ./build      # diretório de saída customizado
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.stderr.write(
        "[erro] Playwright não está instalado.\n"
        "       pip install playwright && python -m playwright install chromium\n"
    )
    sys.exit(1)


SLIDE_WIDTH = 1200
SLIDE_HEIGHT = 630
BANNER_SELECTOR = ".linkedin-banner"
SCRIPT_DIR = Path(__file__).resolve().parent


def export_slide(html_path: Path, out_path: Path, scale: int = 1) -> None:
    """Renderiza o HTML e captura o elemento .linkedin-banner como PNG."""
    if not html_path.is_file():
        raise FileNotFoundError(f"HTML não encontrado: {html_path}")

    url = html_path.as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": SLIDE_WIDTH, "height": SLIDE_HEIGHT},
            device_scale_factor=scale,
        )
        page = context.new_page()
        page.goto(url, wait_until="networkidle")

        # Garante que as fontes do Google sejam carregadas antes do snapshot
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(400)

        banner = page.locator(BANNER_SELECTOR)
        banner.wait_for(state="visible", timeout=5_000)
        banner.screenshot(path=str(out_path), omit_background=False)

        browser.close()

    print(f"[ok] {html_path.name} -> {out_path.name} ({scale}x)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Exporta os slides do TrimiCash para PNG.")
    parser.add_argument(
        "--slide",
        type=int,
        choices=[1, 2],
        help="Exporta apenas o slide especificado (1 ou 2). Sem flag, exporta ambos.",
    )
    parser.add_argument(
        "--scale",
        type=int,
        default=1,
        help="Device scale factor (1 = 1200x630, 2 = 2400x1260). Default: 1.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=SCRIPT_DIR,
        help="Diretório de saída. Default: mesmo diretório dos HTMLs.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    slides = [1, 2] if args.slide is None else [args.slide]
    for n in slides:
        html_path = SCRIPT_DIR / f"slide_phase_{n}.html"
        out_path = args.out / f"slide_phase_{n}.png"
        try:
            export_slide(html_path, out_path, scale=args.scale)
        except Exception as exc:
            sys.stderr.write(f"[erro] slide {n}: {exc}\n")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
