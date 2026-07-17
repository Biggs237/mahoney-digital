# Mahoney Digital — Business cards for VistaPrint

**Status:** Cards ordered (user confirmed) with prior number **(740) 530-8790**. Business line is now **(740) 530-8790** (Marblism receptionist). Regenerate PNGs and reorder when ready, or hand-write the new number on cards until then.

## Files (upload these)

| Side | File | Size |
|------|------|------|
| **Front** | `mahoney-digital-card-FRONT-bleed-300dpi.png` | 1083 × 633 px (300 DPI, includes bleed) |
| **Back** | `mahoney-digital-card-BACK-bleed-300dpi.png` | 1083 × 633 px |

**Regenerate PNGs** (after any edit):

```powershell
cd "C:\Users\Jeremy Mahoney\MahoneyDigital\Projects\mdsite\assets\business-card"
powershell -ExecutionPolicy Bypass -File .\generate-business-cards.ps1
```

**Vector sources** (for designers or PDF export): `mahoney-digital-card-front.svg`, `mahoney-digital-card-back.svg`

---

## VistaPrint steps

1. Go to [VistaPrint Business Cards](https://www.vistaprint.com/business-cards) → **Upload your design** (or “Create your own”).
2. Choose **Standard** size: **3.5" × 2"** — our files include **bleed** (3.61" × 2.11").
3. Upload **FRONT** PNG to the front side, **BACK** PNG to the back side.
4. Select **Matte** or **Glossy** — matte reads more “premium local business”; glossy pops the teal bar.
5. Review proof: confirm the **circled M** and text are not clipped (safe zone is ~⅛" inside trim).
6. Order quantity (250 is a common starter for networking + leaving cards with prospects).

---

## Design notes (matches mahoneydigital.net)

| Element | Color |
|---------|--------|
| Background (front) | Cream `#f8f6f1` |
| Background (back) | White |
| Logo mark + ink text | `#0b1120` (primary mark is rounded square per assets/brand/logo-mark.svg; current printed cards use circle variant) |
| Accent bar + contact lines | Teal gradient `#0f766e` → `#0d9488` |
| Tagline | Slate `#64748b` |

**Front:** **M** mark (rounded square primary) + Mahoney Digital + tagline + “Clear pricing. No hype.”  
**Back:** Jeremy Mahoney, title, email, phone, site, service area line.

**Note:** June 2026 — Official primary logo mark standardized to rounded square (see assets/brand/). The VistaPrint cards were produced with the earlier circle variant. Future reprints or digital uses should prefer the rounded square from brand assets.

---

## Optional tweaks

Edit `generate-business-cards.ps1` or the SVG files, then re-run the script. Common changes:

- Add QR code linking to `https://mahoneydigital.net/plans/`
- Swap “Owner & Lead Designer” for “Founder”
- Remove location line if you prefer minimal back

---

## PDF alternative

1. Open `print-to-pdf.html` in **Chrome**.
2. Print → **Save as PDF** → Paper size custom 3.61" × 2.11" (or “Fit to page”).
3. Upload PDF to VistaPrint if PNG is rejected (quality check preview first).