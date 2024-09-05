import * as React from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  Toaster,
  useId,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import {
  QueryClientProvider,
  useQuery,
  QueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { MenuBar } from './MenuBar';
import { MainArea } from './MainArea';
import { AuthenticationDialog } from '~/web/components/AuthenticationDialog';

import { spacesApi, systemApi } from '~/web/apiClient';
import { AppContext } from './context';
import { PrimarySidebar } from './PrimarySidebar';
import { SecondarySidebar } from './SecondarySidebar';
import { useAppearance } from './hooks/useAppearance';
import { useDocuments } from './hooks/useDocuments';
import { useSpace } from './hooks/useSpace';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();
const useClasses = makeStyles({
  root: {
    height: '100vh',
    overflowY: 'hidden',
  },
  body: {
    height: `calc(100vh - 30px)`,
    display: 'flex',
    flexDirection: 'row',
  },
});

const InkStain = () => {
  const classes = useClasses();
  const { data: platform } = useQuery({
    queryKey: ['platform'],
    queryFn: async () => {
      return await systemApi.platformInfo();
    },
  });
  const { data: spaces } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      return await spacesApi.getSpaces();
    },
  });

  const { openSpace, activeSpace } = useSpace();
  const {
    closeDocument,
    openSystemDocument,
    openDocument,
    documentsAlive,
    activeDocument,
    setActiveDocument,
    activeDocumentViewRef,
    setActiveDocumentViewRef,
  } = useDocuments();

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
    } else {
      openSystemDocument('@inkstain/search-document');
    }
  }, [spaces, openSpace, activeSpace, openSystemDocument]);

  const toasterId = useId('toaster');
  const { appearance, setAppearance } = useAppearance();
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

  return platform ? (
    <AppContext.Provider
      value={{
        platform,
        activeDocument,
        openSystemDocument,
        openDocument,
        closeDocument,
        activeSpace,
        openSpace,
        documentsAlive,
        setActiveDocumentViewRef,
        activeDocumentViewRef,
        toasterId,
        appearance,
        setAppearance,
        showAuthDialog: (show = true) => setShowAuthDialog(show),
      }}
    >
      <div className={classes.root}>
        <Toaster toasterId={toasterId} />
        <MenuBar />
        <div className={classes.body}>
          <PrimarySidebar display={appearance.showPrimarySidebar} />
          <MainArea onActiveDocumentChange={setActiveDocument} />
          <SecondarySidebar display={appearance.showSecondarySidebar} />
        </div>
        <AuthenticationDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
        />
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
