import { useState, useEffect } from 'react';
import {
  Spinner,
  Body1,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { configureApiClient } from '~/chrome-extension/utils/apiClient';
import { Settings } from './Settings';
import { Home } from './Home';
import { PopupContext } from './context';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '~/chrome-extension/utils/apiClient';

const useClasses = makeStyles({
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
});

interface SpacePopupProps {
  data: {
    url?: string;
    title?: string;
  };
  behavior: 'download' | 'clip';
  onSave: (spaceKey: string, documentPath: string) => void;
}

const Main = ({ data, onSave, behavior }: SpacePopupProps) => {
  const classes = useClasses();
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useTranslation();
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

  return loadingPlatform ? (
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
    <PopupContext.Provider value={{ platformInfo, data, behavior }}>
      {showSettings ? (
        <Settings setShowSettings={setShowSettings} />
      ) : (
        <Home setShowSettings={setShowSettings} onSave={onSave} />
      )}
    </PopupContext.Provider>
  ) : null;
};

export function SpacePopup({ data, onSave, behavior }: SpacePopupProps) {
  const [isApiClientInitialized, setIsApiClientInitialized] = useState(false);
  useEffect(() => {
    configureApiClient().then(() => {
      setIsApiClientInitialized(true);
    });
  }, []);

  return isApiClientInitialized ? (
    <Main data={data} onSave={onSave} behavior={behavior} />
  ) : null;
}

export default SpacePopup;
