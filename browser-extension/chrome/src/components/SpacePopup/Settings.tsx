import * as React from 'react';
import {
  Label,
  Input,
  Subtitle2,
  makeStyles,
  tokens,
  Button,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { getSettings, setSettings } from '~/chrome-extension/utils/chrome';
import { configureApiClient } from '~/chrome-extension/utils/apiClient';
import { DismissRegular } from '@fluentui/react-icons';

const useClasses = makeStyles({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rootInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingHorizontalM,
  },
  heading: {
    marginBottom: tokens.spacingVerticalM,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: tokens.spacingVerticalM,
    alignItems: 'center',
    '& > .fui-Label': {
      width: '80px',
    },
    '& > .fui-Input': {
      flexGrow: 1,
    },
  },
});

const SettingsInner = ({ onSaveSettings }: { onSaveSettings: () => void }) => {
  const classes = useClasses();
  const { t } = useTranslation();
  const [host, setHost] = React.useState<string>('');
  const [port, setPort] = React.useState<string>('');
  React.useEffect(() => {
    getSettings()
      .then((settings) => {
        setHost(settings.host);
        setPort(settings.port);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <div className={classes.rootInner}>
      <div className={classes.row}>
        <Label>{`${t('settings_host_label')}:`}</Label>
        <Input
          type="text"
          value={host}
          onChange={(e, data) => setHost(data.value)}
        />
      </div>
      <div className={classes.row}>
        <Label>{`${t('settings_port_label')}:`}</Label>
        <Input
          type="text"
          value={port}
          onChange={(e, data) => setPort(data.value)}
        />
      </div>
      <div>
        <Button
          appearance="primary"
          onClick={() => {
            setSettings({
              host,
              port,
            }).then(() => {
              configureApiClient();
              onSaveSettings();
            });
          }}
        >
          {t('save_settings')}
        </Button>
      </div>
    </div>
  );
};

export const Settings = ({
  setShowSettings,
}: {
  setShowSettings: (show: boolean) => void;
}) => {
  const classes = useClasses();
  const { t } = useTranslation();
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
      <SettingsInner
        onSaveSettings={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};
