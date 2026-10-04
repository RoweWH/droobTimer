import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { getTheme, type ThemeName } from '../assets/ui/themes/themeRegistry';

const ThemeContext = createContext<{
  themeName: ThemeName;
  theme: ReturnType<typeof getTheme>;
} | null>(null);

export function ThemeProvider({
  children,
  themeName,
}: {
  children: ReactNode;
  themeName: ThemeName;
}) {
  useEffect(() => {
    document.documentElement.dataset.theme = themeName;
  }, [themeName]);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme: getTheme(themeName),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const theme = useContext(ThemeContext);

  if (theme === null) {
    throw new Error('useTheme must be used inside ThemeProvider.');
  }

  return theme;
}
