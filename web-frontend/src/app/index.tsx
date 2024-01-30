import * as React from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
} from '@fluentui/react-components';

import { MenuBar } from './MenuBar';
import { MainArea } from './MainArea';

import {
  QueryClientProvider,
  useQuery,
  QueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { platformApi } from '~/web/apiClient';
import { AppContext } from './context';
import { Document } from '../types';
import { PrimarySidebar } from './PrimarySidebar';
const queryClient = new QueryClient();

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
  },
});

const useActiveSpace = () => {
  const [activeSpace, setActiveSpace] = React.useState<{
    name: string;
    path: string;
  } | null>(null);
  const openSpace = React.useCallback(
    (spaceName: string, spacePath: string) => {
      setActiveSpace({
        name: spaceName,
        path: spacePath,
      });
    },
    [activeSpace, setActiveSpace]
  );

  return {
    openSpace,
    activeSpace,
  } as const;
};
const useActiveDocument = () => {
  const mapDocumentTypeToName: Record<string, string> = {
    '@inkstain/space-management': 'Spaces',
  };
  const [documentsAlive, setDocumentsAlive] = React.useState<Document[]>([]);
  const openDocument = React.useCallback(
    (type: string, name?: string) => {
      setDocumentsAlive((documentsAlive) => {
        if (name === undefined) {
          name = mapDocumentTypeToName[type] ?? type;
        }
        if (documentsAlive.find((document) => document.name === name))
          return documentsAlive;
        const newDocumentsAlive = [...documentsAlive];
        newDocumentsAlive.push({ type, name });
        return newDocumentsAlive;
      });
    },
    [documentsAlive, setDocumentsAlive]
  );

  return {
    openDocument,
    documentsAlive,
  } as const;
};

const InkStain = () => {
  const styles = useStyles();
  const { data: platform } = useQuery({
    queryKey: ['platform'],
    queryFn: async () => {
      return await platformApi.platformGet();
    },
  });

  const { openSpace, activeSpace } = useActiveSpace();
  const { openDocument, documentsAlive } = useActiveDocument();

  return platform ? (
    <AppContext.Provider
      value={{ platform, openDocument, activeSpace, openSpace, documentsAlive }}
    >
      <MenuBar />
      <div className={styles.body}>
        <PrimarySidebar />
        <MainArea />
      </div>
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
