export type ThemeKey = "pink" | "blue" | "green" | "purple" | "orange";

export interface ThemeVars {
  "--primary": string;
  "--primary-foreground": string;
  "--ring": string;
  "--sidebar-primary": string;
  "--sidebar-primary-foreground": string;
  "--sidebar-ring": string;
  "--chart-1": string;
}

export interface Theme {
  key: ThemeKey;
  label: string;
  /** Raw OKLCH string — used only to paint the swatch circle in the UI */
  swatch: string;
  light: ThemeVars;
  dark: ThemeVars;
}

export const themes: Theme[] = [
  {
    key: "pink",
    label: "Pink",
    swatch: "oklch(0.5316 0.1409 355.1999)",
    light: {
      "--primary":                    "oklch(0.5316 0.1409 355.1999)",
      "--primary-foreground":         "oklch(1.0000 0 0)",
      "--ring":                       "oklch(0.5916 0.2180 0.5844)",
      "--sidebar-primary":            "oklch(0.5916 0.2180 0.5844)",
      "--sidebar-primary-foreground": "oklch(0.9668 0.0124 337.5228)",
      "--sidebar-ring":               "oklch(0.5916 0.2180 0.5844)",
      "--chart-1":                    "oklch(0.6038 0.2363 344.4657)",
    },
    dark: {
      "--primary":                    "oklch(0.4607 0.1853 4.0994)",
      "--primary-foreground":         "oklch(0.8560 0.0618 346.3684)",
      "--ring":                       "oklch(0.5916 0.2180 0.5844)",
      "--sidebar-primary":            "oklch(0.567 0.223 348.9)",
      "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
      "--sidebar-ring":               "oklch(0.5916 0.2180 0.5844)",
      "--chart-1":                    "oklch(0.5316 0.1409 355.1999)",
    },
  },
  {
    key: "blue",
    label: "Blue",
    swatch: "oklch(0.5500 0.1900 240.0000)",
    light: {
      "--primary":                    "oklch(0.5500 0.1900 240.0000)",
      "--primary-foreground":         "oklch(1.0000 0 0)",
      "--ring":                       "oklch(0.6000 0.2000 240.0000)",
      "--sidebar-primary":            "oklch(0.6000 0.2000 240.0000)",
      "--sidebar-primary-foreground": "oklch(0.9800 0.0100 240.0000)",
      "--sidebar-ring":               "oklch(0.6000 0.2000 240.0000)",
      "--chart-1":                    "oklch(0.6200 0.2100 240.0000)",
    },
    dark: {
      "--primary":                    "oklch(0.5000 0.1800 240.0000)",
      "--primary-foreground":         "oklch(0.9500 0.0300 240.0000)",
      "--ring":                       "oklch(0.5500 0.1900 240.0000)",
      "--sidebar-primary":            "oklch(0.5500 0.1900 240.0000)",
      "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
      "--sidebar-ring":               "oklch(0.5500 0.1900 240.0000)",
      "--chart-1":                    "oklch(0.5000 0.1800 240.0000)",
    },
  },
  {
    key: "green",
    label: "Green",
    swatch: "oklch(0.5200 0.1700 155.0000)",
    light: {
      "--primary":                    "oklch(0.5200 0.1700 155.0000)",
      "--primary-foreground":         "oklch(1.0000 0 0)",
      "--ring":                       "oklch(0.5700 0.1900 155.0000)",
      "--sidebar-primary":            "oklch(0.5700 0.1900 155.0000)",
      "--sidebar-primary-foreground": "oklch(0.9800 0.0100 155.0000)",
      "--sidebar-ring":               "oklch(0.5700 0.1900 155.0000)",
      "--chart-1":                    "oklch(0.6000 0.2000 155.0000)",
    },
    dark: {
      "--primary":                    "oklch(0.4800 0.1600 155.0000)",
      "--primary-foreground":         "oklch(0.9500 0.0300 155.0000)",
      "--ring":                       "oklch(0.5200 0.1700 155.0000)",
      "--sidebar-primary":            "oklch(0.5200 0.1700 155.0000)",
      "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
      "--sidebar-ring":               "oklch(0.5200 0.1700 155.0000)",
      "--chart-1":                    "oklch(0.4800 0.1600 155.0000)",
    },
  },
  {
    key: "purple",
    label: "Purple",
    swatch: "oklch(0.5300 0.2200 295.0000)",
    light: {
      "--primary":                    "oklch(0.5300 0.2200 295.0000)",
      "--primary-foreground":         "oklch(1.0000 0 0)",
      "--ring":                       "oklch(0.5800 0.2300 295.0000)",
      "--sidebar-primary":            "oklch(0.5800 0.2300 295.0000)",
      "--sidebar-primary-foreground": "oklch(0.9800 0.0100 295.0000)",
      "--sidebar-ring":               "oklch(0.5800 0.2300 295.0000)",
      "--chart-1":                    "oklch(0.6000 0.2400 295.0000)",
    },
    dark: {
      "--primary":                    "oklch(0.4900 0.2100 295.0000)",
      "--primary-foreground":         "oklch(0.9500 0.0300 295.0000)",
      "--ring":                       "oklch(0.5300 0.2200 295.0000)",
      "--sidebar-primary":            "oklch(0.5300 0.2200 295.0000)",
      "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
      "--sidebar-ring":               "oklch(0.5300 0.2200 295.0000)",
      "--chart-1":                    "oklch(0.4900 0.2100 295.0000)",
    },
  },
  {
    key: "orange",
    label: "Orange",
    swatch: "oklch(0.6200 0.1900 50.0000)",
    light: {
      "--primary":                    "oklch(0.6200 0.1900 50.0000)",
      "--primary-foreground":         "oklch(1.0000 0 0)",
      "--ring":                       "oklch(0.6600 0.2000 50.0000)",
      "--sidebar-primary":            "oklch(0.6600 0.2000 50.0000)",
      "--sidebar-primary-foreground": "oklch(0.9800 0.0100 50.0000)",
      "--sidebar-ring":               "oklch(0.6600 0.2000 50.0000)",
      "--chart-1":                    "oklch(0.7000 0.2100 50.0000)",
    },
    dark: {
      "--primary":                    "oklch(0.5800 0.1800 50.0000)",
      "--primary-foreground":         "oklch(0.9500 0.0300 50.0000)",
      "--ring":                       "oklch(0.6200 0.1900 50.0000)",
      "--sidebar-primary":            "oklch(0.6200 0.1900 50.0000)",
      "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
      "--sidebar-ring":               "oklch(0.6200 0.1900 50.0000)",
      "--chart-1":                    "oklch(0.5800 0.1800 50.0000)",
    },
  },
];

export const defaultTheme: ThemeKey = "pink";