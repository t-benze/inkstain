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
import { Space } from '../types';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
const queryClient = new QueryClient();

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
  },
});

const useActiveSpace = () => {
  const [activeSpace, setActiveSpace] = React.useState<Space | null>(null);
  const openSpace = React.useCallback(
    (space: Space) => {
      setActiveSpace(space);
    },
    [setActiveSpace]
  );

  return {
    openSpace,
    activeSpace,
  } as const;
};

const mapDocumentTypeToName: Record<string, string> = {
  '@inkstain/space-management': 'Spaces',
};
const useActiveDocument = () => {
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
    [setDocumentsAlive]
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

  React.useEffect(() => {
    if (!activeSpace) {
      openDocument('@inkstain/space-management');
    }
  }, [activeSpace, openDocument]);

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
  const { t } = useTranslation();
  return (
    <FluentProvider theme={webLightTheme}>
      <QueryClientProvider client={queryClient}>
        <Helmet>
          <title>{t('inkstain')}</title>
        </Helmet>
        <InkStain />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </FluentProvider>
  );
};

export default App;
