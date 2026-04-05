import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      {authenticated ? (
        <DashboardPage />
      ) : (
        <LoginPage onLogin={() => setAuthenticated(true)} />
      )}
    </QueryClientProvider>
  );
}

export default App;
