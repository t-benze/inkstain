import * as React from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
} from '@fluentui/react-components';

import { MenuBar } from './MenuBar';
import { MainArea } from './MainArea';
import { SystemDocumentType, Document } from '~/web/types';

import {
  QueryClientProvider,
  useQuery,
  QueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { platformApi, spacesApi } from '~/web/apiClient';
import { AppContext } from './context';
import { PrimarySidebar } from './PrimarySidebar';
import { Space } from '../types';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
const queryClient = new QueryClient();
const useStyles = makeStyles({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
  },
});

const useSpace = () => {
  const [activeSpace, setActiveSpace] = React.useState<Space | null>(null);
  const openSpace = React.useCallback(
    (space: Space) => {
      if (activeSpace) {
        if (activeSpace.key === space.key) {
          return;
        } else {
          //TODO: open new at a different tab
          window.open(
            `${window.location.origin}/?space=${space.key}`,
            `inkstain-${space.key}`
          );
        }
      } else {
        setActiveSpace(space);
      }
    },
    [setActiveSpace, activeSpace]
  );

  return {
    openSpace,
    activeSpace,
  } as const;
};

const useDocuments = () => {
  const [documentsAlive, setDocumentsAlive] = React.useState<Document[]>([]);
  const openSystemDocument = React.useCallback(
    (type: SystemDocumentType) => {
      setDocumentsAlive((documentsAlive) => {
        // const name = mapDocumentTypeToName[type] ?? type;
        if (documentsAlive.find((document) => document.name === type))
          return documentsAlive;
        const newDocumentsAlive = [...documentsAlive];
        newDocumentsAlive.push({ type, name: type });
        // if (mainAreaRef.current) {
        //   mainAreaRef.current.setActiveDocument({ type, name: type });
        // }
        return newDocumentsAlive;
      });
    },
    [setDocumentsAlive]
  );
  const openDocument = React.useCallback(
    (name: string) => {
      setDocumentsAlive((documentsAlive) => {
        const documentType = name.split('.').pop();
        if (!documentType)
          throw new Error('Document type not recognized: ' + name);
        if (documentsAlive.find((document) => document.name === name))
          return documentsAlive;
        const newDocumentsAlive = [...documentsAlive];
        newDocumentsAlive.push({ type: documentType, name });
        return newDocumentsAlive;
      });
    },
    [setDocumentsAlive]
  );

  return {
    openSystemDocument,
    openDocument,
    documentsAlive,
  } as const;
};

const InkStain = () => {
  const styles = useStyles();
  const { data: platform } = useQuery({
    queryKey: ['platform'],
    queryFn: async () => {
      return await platformApi.platformInfo();
    },
  });
  const { data: spaces } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      return await spacesApi.getSpaces();
    },
  });

  const { openSpace, activeSpace } = useSpace();
  const { openSystemDocument, openDocument, documentsAlive } = useDocuments();
  const [activeDocument, setActiveDocument] = React.useState<string | null>(
    documentsAlive[0] ? documentsAlive[0].name : null
  );

  React.useEffect(() => {
    if (!activeSpace) {
      if (window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        const spaceKey = searchParams.get('space');
        if (spaceKey && spaces) {
          const space = spaces.find((space) => space.key === spaceKey);
          if (space) {
            openSpace(space);
          }
        }
      } else {
        openSystemDocument('@inkstain/space-management');
      }
    }
  }, [spaces, openSpace, activeSpace, openSystemDocument]);

  React.useEffect(() => {
    if (activeDocument === null && documentsAlive.length > 0) {
      setActiveDocument(documentsAlive[0].name);
    }
  }, [documentsAlive, activeDocument]);

  const handleOpenDocument = React.useCallback(
    (name: string) => {
      openDocument(name);
      setActiveDocument(name);
    },
    [openDocument, setActiveDocument]
  );

  return platform ? (
    <AppContext.Provider
      value={{
        platform,
        openSystemDocument,
        openDocument: handleOpenDocument,
        activeSpace,
        openSpace,
        documentsAlive,
        activeDocument,
        setActiveDocument,
      }}
    >
      <div className={styles.root}>
        <MenuBar />
        <div className={styles.body}>
          <PrimarySidebar />
          <MainArea />
        </div>
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
