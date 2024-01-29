import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  FluentProvider,
  makeStyles,
  webLightTheme,
  TabList,
} from '@fluentui/react-components';
import MenuBar from '~/web/components/MenuBar';
import MainPage from '~/web/pages/MainPage';
import SpaceManagementPage from '~/web/pages/SpaceManagementPage';
import {
  QueryClientProvider,
  useQuery,
  QueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { platformApi } from '~/web/apiClient';
import { AppContext } from './context';
const queryClient = new QueryClient();

const InkStain = () => {
  const { data: platform } = useQuery({
    queryKey: ['platform'],
    queryFn: async () => {
      return await platformApi.platformGet();
    },
  });

  return platform ? (
    <AppContext.Provider value={{ platform }}>
      <MenuBar />

      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/space-management" element={<SpaceManagementPage />} />
          {/* Define other routes as needed */}
        </Routes>
      </Router>
    </AppContext.Provider>
  ) : null;
};

const App: React.FunctionComponent = () => {
  return (
    <FluentProvider theme={webLightTheme}>
      <QueryClientProvider client={queryClient}>
        <InkStain />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </FluentProvider>
  );
};

export default App;
