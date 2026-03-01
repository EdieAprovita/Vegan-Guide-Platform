"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

const THEME_ICONS: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const THEME_LABELS: Record<Theme, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // Avoid hydration mismatch: render only after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render an inert placeholder with the same dimensions to avoid layout shift
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        aria-label="Cambiar tema"
        disabled
      >
        <Monitor className="h-4 w-4 opacity-0" aria-hidden="true" />
      </Button>
    );
  }

  // Show resolved icon so the button always reflects the actual applied theme
  const activeTheme = (theme as Theme) ?? "system";
  const ResolvedIcon =
    resolvedTheme === "dark"
      ? Moon
      : resolvedTheme === "light"
        ? Sun
        : THEME_ICONS[activeTheme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground/70 hover:text-foreground focus-visible:ring-ring/50 h-9 w-9 p-0 transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
          aria-label="Cambiar tema"
        >
          <ResolvedIcon
            className="h-4 w-4 transition-transform duration-300"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {(["light", "dark", "system"] as Theme[]).map((t) => {
          const Icon = THEME_ICONS[t];
          const isActive = theme === t;
          return (
            <DropdownMenuItem
              key={t}
              onClick={() => setTheme(t)}
              className={`flex cursor-pointer items-center gap-2 ${
                isActive ? "text-primary font-medium" : ""
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {THEME_LABELS[t]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
