"use client";

import React from "react";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { themes, type ThemeKey } from "@/config/themes";
import {
  applyTheme,
  saveTheme,
  loadSavedTheme,
  reapplyThemeForColorScheme,
} from "@/lib/theme";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSidebar as useShadcnSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";

export function AccentColorPicker() {
  const [activeKey, setActiveKey] = React.useState<ThemeKey>(
    () => loadSavedTheme()
  );
  const [open, setOpen] = React.useState(false);

  const { open: sidebarOpen } = useShadcnSidebar();
  const { theme } = useTheme();

  // Re-apply correct light/dark vars whenever color scheme toggles
  React.useEffect(() => {
    reapplyThemeForColorScheme(activeKey);
  }, [theme, activeKey]);

  function handleSelect(key: ThemeKey) {
    setActiveKey(key);
    applyTheme(key);
    saveTheme(key);
    setOpen(false);
  }

  //const activeTheme = themes.find((t) => t.key === activeKey);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/*
          Mirrors SidebarButton exactly:
          variant="ghost" size="lg" with the same padding/layout classes.
          When sidebar is collapsed only the icon shows (same as nav items).
        */}
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "flex w-full items-center justify-start gap-2 py-2 !px-3 text-sm",
            open && "bg-accent text-accent-foreground"
          )}
          aria-label="Appearance"
        >
          {/* Swatch circle — acts as the icon slot */}
          {/* <span
            className="flex size-4 shrink-0 items-center justify-center rounded-full border border-border"
            style={{
              backgroundColor: activeTheme?.swatch ?? "var(--primary)",
            }}
            aria-hidden="true"
          /> */}

          <span
  className="flex size-4 shrink-0 items-center justify-center"
  aria-hidden="true"
>
  <Palette className="size-5" />
</span>

          {/* Label — hidden when sidebar is icon-only, same as nav items */}
          <span
            className={cn(
              "tracking-[-0.00875rem]",
              "truncate",
              "line-clamp-1",
              "font-normal",
              "text-foreground",
              "transition-opacity duration-200",
              sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            Appearance
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        avoidCollisions={false}
        className="w-52 p-3"
        // Keep popover inside the sidebar z-stack
        style={{ zIndex: 50 }}
      >
        <p className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Accent Color
        </p>

        <div className="flex flex-col gap-0.5">
          {themes.map((theme) => {
            const isActive = activeKey === theme.key;
            return (
              <button
                key={theme.key}
                onClick={() => handleSelect(theme.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground font-medium"
                )}
              >
                {/* Swatch */}
                <span
                  className="relative flex size-5 shrink-0 items-center justify-center rounded-full border border-border"
                  style={{ backgroundColor: theme.swatch }}
                  aria-hidden="true"
                >
                  {isActive && (
                    <Check
                      className="size-3 text-white drop-shadow-sm"
                      strokeWidth={3}
                    />
                  )}
                </span>
                {theme.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}