import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';

// Use HashRouter for static hosting compatibility (e.g. Mule Pages)
// BrowserRouter requires server-side fallback for SPA routes
const useHash = window.location.hostname.includes('.mule.page') || window.location.hash.startsWith('#');
const Router = useHash ? HashRouter : BrowserRouter;
import BlogRoutes from './blog-routes';
import Index from './pages/Index';
import Game from './pages/Game';
import Garden from './pages/Garden';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
// MODULE_IMPORTS_START
// MODULE_IMPORTS_END

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/game" element={<Game />} />
    <Route path="/garden" element={<Garden />} />
    {/* <Route path="/blog/*" element={<BlogRoutes />} /> */}
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
    {/* MODULE_ROUTES_START */}
    {/* MODULE_ROUTES_END */}
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* MODULE_PROVIDERS_START */}
    {/* MODULE_PROVIDERS_END */}
    <TooltipProvider>
      <Toaster />
      <Router>
        <AppRoutes />
      </Router>
    </TooltipProvider>
    {/* MODULE_PROVIDERS_CLOSE */}
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
