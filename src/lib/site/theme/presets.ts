import type { Theme } from "../schema";

/**
 * Curated color presets (ADR-0009 / ADR-0010). A preset is a named {@link Theme} — an
 * 8-key palette + font pair — applied on `.site-root` as CSS variables by `SiteRoot` (#7).
 * The user picks one in the "pick a look" step; the AI never chooses colors or fonts.
 *
 * Fonts are restricted to the families loaded via next/font in `src/app/layout.tsx`
 * (Fraunces, Work Sans, Mulish). Adding a font here means loading it there too.
 *
 * Note (ADR-0009): only these 8 tokens vary per preset; the unmapped tokens
 * (`--page-bg`, `--accent-dark`, `--warm-text`, `--border-soft`) ship as fixed defaults in
 * `site.css`, so presets differ in surface/accent/text rather than every shade.
 */
export type Preset = {
  id: string;
  /** Human label shown in the picker. */
  label: string;
  /** Short descriptor of the mood. */
  description: string;
  theme: Theme;
};

export const PRESETS: Preset[] = [
  {
    id: "sage",
    label: "Sage & Stone",
    description: "Calm, warm and grounded — soft sage and natural stone.",
    theme: {
      palette: {
        accent: "oklch(0.276 0.008 59.33)",
        accentSoft: "oklch(0.913 0.014 74.418)",
        surface: "oklch(0.956 0.01 81.795)",
        surfaceMuted: "oklch(0.943 0.011 136.56)",
        text: "oklch(0.276 0.008 59.33)",
        textMuted: "oklch(0.512 0.015 141.761)",
        border: "oklch(0.866 0.017 79.343)",
        warm: "oklch(0.671 0.075 60.455)",
      },
      fonts: { body: "Work Sans", display: "Fraunces" },
    },
  },
  {
    id: "harbor",
    label: "Harbor Blue",
    description: "Cool and reassuring — soft slate blues and clear light.",
    theme: {
      palette: {
        accent: "oklch(0.42 0.06 245)",
        accentSoft: "oklch(0.9 0.04 240)",
        surface: "oklch(0.965 0.012 235)",
        surfaceMuted: "oklch(0.93 0.018 235)",
        text: "oklch(0.29 0.03 250)",
        textMuted: "oklch(0.52 0.03 245)",
        border: "oklch(0.86 0.02 235)",
        warm: "oklch(0.66 0.08 235)",
      },
      fonts: { body: "Work Sans", display: "Fraunces" },
    },
  },
  {
    id: "clay",
    label: "Warm Clay",
    description: "Earthy and welcoming — terracotta and warm cream.",
    theme: {
      palette: {
        accent: "oklch(0.46 0.09 47)",
        accentSoft: "oklch(0.9 0.05 60)",
        surface: "oklch(0.967 0.014 75)",
        surfaceMuted: "oklch(0.93 0.022 65)",
        text: "oklch(0.31 0.03 45)",
        textMuted: "oklch(0.54 0.04 50)",
        border: "oklch(0.86 0.03 65)",
        warm: "oklch(0.66 0.1 52)",
      },
      fonts: { body: "Mulish", display: "Fraunces" },
    },
  },
  {
    id: "forest",
    label: "Forest",
    description: "Quietly confident — deep greens and soft moss.",
    theme: {
      palette: {
        accent: "oklch(0.4 0.06 155)",
        accentSoft: "oklch(0.9 0.04 150)",
        surface: "oklch(0.962 0.012 150)",
        surfaceMuted: "oklch(0.928 0.02 150)",
        text: "oklch(0.28 0.03 158)",
        textMuted: "oklch(0.5 0.03 152)",
        border: "oklch(0.85 0.022 150)",
        warm: "oklch(0.64 0.08 130)",
      },
      fonts: { body: "Mulish", display: "Fraunces" },
    },
  },
  {
    id: "plum",
    label: "Soft Plum",
    description: "Gentle and contemplative — muted mauve and warm grey.",
    theme: {
      palette: {
        accent: "oklch(0.42 0.07 330)",
        accentSoft: "oklch(0.9 0.04 330)",
        surface: "oklch(0.965 0.01 330)",
        surfaceMuted: "oklch(0.93 0.016 330)",
        text: "oklch(0.3 0.03 335)",
        textMuted: "oklch(0.52 0.03 330)",
        border: "oklch(0.86 0.018 330)",
        warm: "oklch(0.65 0.08 350)",
      },
      fonts: { body: "Work Sans", display: "Fraunces" },
    },
  },
];

export const DEFAULT_PRESET_ID = PRESETS[0].id;

/** Look up a preset by id, falling back to the default. */
export function getPreset(id: string | undefined): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
