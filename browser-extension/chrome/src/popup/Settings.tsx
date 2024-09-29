import * as React from 'react';
import {
  Label,
  Input,
  makeStyles,
  tokens,
  Button,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { getSettings, setSettings } from '~/chrome-extension/utils/chrome';
import { configureApiClient } from '~/chrome-extension/utils/apiClient';

const useClasses = makeStyles({
  root: {
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

export const Settings = ({
  onSaveSettings,
}: {
  onSaveSettings: () => void;
}) => {
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
    <div className={classes.root}>
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
