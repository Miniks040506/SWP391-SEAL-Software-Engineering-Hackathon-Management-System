import { useMemo, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { AssistantWidget } from '@/features/assistant';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { createAppTheme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const hasAuthenticatedSession = useAuthStore((state) =>
    Boolean(state.user && state.accessToken),
  );
  const colorMode = useThemeStore((state) => state.theme);
  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
          {children}
          {hasAuthenticatedSession && <AssistantWidget />}
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
