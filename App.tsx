import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
