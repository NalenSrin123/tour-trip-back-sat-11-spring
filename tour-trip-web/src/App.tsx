import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeProvider';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const preload = (loader: () => Promise<unknown>) => {
  loader().catch(() => undefined);
};

function preloadPublicRoutes() {
  preload(() => import('./features/tours/TourListPage'));
  preload(() => import('./features/tours/TourDetailPage'));
  preload(() => import('./features/tours/DestinationsPage'));
  preload(() => import('./features/tours/DestinationDetailPage'));
  preload(() => import('./features/company/AboutPage'));
  preload(() => import('./features/company/ContactPage'));
}

function App() {
  useEffect(() => {
    const run = () => preloadPublicRoutes();
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(run);
    } else {
      setTimeout(run, 1200);
    }
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
