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
import { useDocuments } from './hooks/useDocuments';
import { useSpace } from './hooks/useSpace';
import { useShortcuts } from './hooks/useShortcuts';
import { useUser } from '~/web/hooks/auth';
import { useSettings } from './hooks/useSettings';

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
    renameDocumentPath,
    activeDocumentViewRef,
    setActiveDocumentViewRef,
  } = useDocuments(platform);
  const { settings, updateSettings } = useSettings();

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
  // const { appearance, setAppearance } = useAppearance();
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const { pressedKeys } = useShortcuts();
  const { userInfo } = useUser();

  return platform && settings ? (
    <AppContext.Provider
      value={{
        toasterId,
        showAuthDialog: (show = true) => setShowAuthDialog(show),
        userInfo: userInfo,
        platform,
        pressedKeys,
        setActiveDocumentViewRef,
        activeDocumentViewRef,
        activeDocument,
        openSystemDocument,
        openDocument,
        closeDocument,
        renameDocumentPath,
        activeSpace,
        openSpace,
        documentsAlive,
        settings,
        updateSettings,
      }}
    >
      <div className={classes.root}>
        <Toaster toasterId={toasterId} />
        <MenuBar />
        <div className={classes.body}>
          <PrimarySidebar display={settings.layout.primarySidebar} />
          <MainArea onActiveDocumentChange={setActiveDocument} />
          <SecondarySidebar display={settings.layout.secondarySidebar} />
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
