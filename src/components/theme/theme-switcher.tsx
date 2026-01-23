'use client';

import { useTheme } from '@/contexts/theme-context';
import { useLocale } from '@/components/local-lang-swither';
import { getMessages } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const { toggleThemeMode } = useTheme();
  const { locale } = useLocale();
  const t = getMessages(locale);

  return (
    <div className="flex items-center gap-2">
      {/* Dark/Light Mode Toggle */}
      <Button variant="outline" size="icon" onClick={toggleThemeMode}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">{t.theme.toggleMode}</span>
      </Button>
    </div>
  );
}
