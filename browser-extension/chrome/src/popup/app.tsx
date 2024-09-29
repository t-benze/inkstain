// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import {
  makeStyles,
  FluentProvider,
  webLightTheme,
  tokens,
  Spinner,
  Body1,
  Button,
  Tooltip,
  Subtitle2,
} from '@fluentui/react-components';
import { SettingsRegular, DismissRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  configureApiClient,
  systemApi,
} from '~/chrome-extension/utils/apiClient';
import { SpaceSelector } from './SpaceSelector';
import { FolderExplorer } from './FolderExplorer';
import { AppContext } from '~/chrome-extension/popup/context';
import { Settings } from './Settings';
import { PlatformInfo200Response } from '@inkstain/client-api';
import { getSettings } from '~/chrome-extension/utils/chrome';

const queryClient = new QueryClient();
const useClasses = makeStyles({
  root: {
    padding: tokens.spacingHorizontalM,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  error: {
    padding: tokens.spacingHorizontalM,
    display: 'flex',
    flexDirection: 'column',
    '& > .fui-Body1': {
      display: 'block',
      marginBottom: tokens.spacingVerticalM,
    },
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalM,
  },
});

const Main = ({
  platformInfo,
  onSettingsClick,
}: {
  platformInfo: PlatformInfo200Response;
  onSettingsClick: () => void;
}) => {
  const [spaceKey, setSpaceKey] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<Array<string>>(['']);
  const classes = useClasses();
  const { t } = useTranslation();
  const handleFolderSelected = React.useCallback((folder: string[]) => {
    setCurrentFolder(folder);
  }, []);
  const [isWebPage, setIsWebPage] = useState(false);

  React.useEffect(() => {
    chrome.runtime &&
      chrome.runtime.sendMessage(
        { action: 'getSpaceKey' },
        undefined,
        (result: string) => {
          if (result) {
            setSpaceKey(result);
          }
        }
      );
  });

  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const url = tabs[0].url;
        if (url) {
          fetch(url).then((response) => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('text/html')) {
              setIsWebPage(true);
            }
          });
        }
      }
    });
  }, []);

  return (
    <AppContext.Provider value={{ platformInfo: platformInfo }}>
      <div className={classes.header}>
        <SpaceSelector spaceKey={spaceKey} onSpaceKeyChange={setSpaceKey} />
        <Button onClick={onSettingsClick} icon={<SettingsRegular />}></Button>
      </div>
      {spaceKey ? (
        <>
          <FolderExplorer
            spaceKey={spaceKey}
            currentFolder={currentFolder}
            onFolderSelected={handleFolderSelected}
          />
          <div className={classes.buttons}>
            <Button
              onClick={() => {
                chrome.tabs.query(
                  { active: true, currentWindow: true },
                  (tabs) => {
                    if (tabs && tabs[0] && tabs[0].id) {
                      const url = tabs[0].url;
                      chrome.runtime.sendMessage({
                        action: 'download',
                        url,
                        spaceKey,
                        targetFolder: currentFolder.join(platformInfo.pathSep),
                        pathSep: platformInfo.pathSep,
                      });
                    }
                  }
                );
              }}
            >
              {t('download')}
            </Button>
            <Tooltip
              content={
                isWebPage
                  ? t('clip_web_page_tooltip')
                  : t('clip_web_page_disabled_tooltip')
              }
              relationship="label"
            >
              <Button
                disabled={!isWebPage}
                appearance="primary"
                onClick={(e) => {
                  e.preventDefault();
                  getSettings().then((settings) => {
                    chrome.tabs.query(
                      { active: true, currentWindow: true },
                      function (tabs) {
                        if (tabs && tabs[0] && tabs[0].id) {
                          chrome.tabs.sendMessage(tabs[0].id, {
                            host: settings.host,
                            port: settings.port,
                            action: 'startClip',
                            spaceKey,
                            targetFolder: currentFolder.join(
                              platformInfo.pathSep
                            ),
                            pathSep: platformInfo.pathSep,
                          });
                          window.close();
                        }
                      }
                    );
                  });
                }}
              >
                {t('start_clip_page')}
              </Button>
            </Tooltip>
          </div>
        </>
      ) : null}
    </AppContext.Provider>
  );
};

const InkStain = () => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [showSettings, setShowSettings] = useState(false);
  const {
    isLoading: loadingPlatform,
    isError: errorPlatform,
    data: platformInfo,
  } = useQuery({
    queryKey: ['platformInfo'],
    retry: false,
    queryFn: async () => {
      const response = await systemApi.platformInfo();
      return response;
    },
  });

  const renderSettings = () => {
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <Subtitle2>{t('settings')}</Subtitle2>
          <Button
            onClick={() => {
              setShowSettings(false);
            }}
            icon={<DismissRegular />}
          ></Button>
        </div>
        <Settings
          onSaveSettings={() => {
            window.location.reload();
          }}
        />
      </div>
    );
  };

  const renderMain = () => {
    return (
      <div className={classes.root}>
        {loadingPlatform ? (
          <div className={classes.loading}>
            <Spinner />
          </div>
        ) : errorPlatform ? (
          <div className={classes.error}>
            <Body1>{t('not_able_to_connect_inkstain')}</Body1>
            <Button
              onClick={() => {
                setShowSettings(true);
              }}
            >
              {t('settings')}
            </Button>
          </div>
        ) : platformInfo ? (
          <Main
            platformInfo={platformInfo}
            onSettingsClick={() => setShowSettings(true)}
          />
        ) : null}
      </div>
    );
  };

  return showSettings ? renderSettings() : renderMain();
};

export function App() {
  const [isApiClientInitialized, setIsApiClientInitialized] = useState(false);
  useEffect(() => {
    configureApiClient().then(() => {
      setIsApiClientInitialized(true);
    });
  }, []);
  return (
    <FluentProvider
      style={{ width: '100%', height: '100%', display: 'flex' }}
      theme={webLightTheme}
    >
      <QueryClientProvider client={queryClient}>
        {isApiClientInitialized ? <InkStain /> : null}
      </QueryClientProvider>
    </FluentProvider>
  );
}

export default App;
