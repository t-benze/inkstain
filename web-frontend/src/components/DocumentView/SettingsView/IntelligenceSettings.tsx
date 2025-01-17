import * as React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  Dropdown,
  Option,
  Input,
  Link,
  Button,
  makeStyles,
  useToastController,
  Toast,
  ToastTitle,
} from '@fluentui/react-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import { systemApi } from '~/web/apiClient';
import { ResponseError, SettingsOcrServiceEnum } from '@inkstain/client-api';
import { Section, Setting } from './components';
import { useAppContext } from '~/web/app/hooks/useAppContext';

const useClasses = makeStyles({
  input: {
    minWidth: '600px',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
  },
});

export const IntelligenceSettings = () => {
  const { t } = useTranslation();
  const classes = useClasses();
  const { settings, updateSettings } = useAppContext();
  const { toasterId } = useAppContext();
  const { dispatchToast } = useToastController(toasterId);
  const options = ['remote', 'local'] as SettingsOcrServiceEnum[];
  const currentVal = settings.ocrService;
  const [openaiApiKey, setOpenaiApiKey] = React.useState('');

  const showErrorToast = React.useCallback(
    (message: string) => {
      console.log('showErrorToast', message);
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        {
          intent: 'error',
          position: 'top',
          timeout: 2000,
        }
      );
    },
    [dispatchToast]
  );
  const { data: secrets } = useQuery({
    queryKey: ['settings', 'secrets'],
    queryFn: async () => {
      return (await systemApi.getSecrets({
        secretKey: ['openai'],
      })) as Record<string, string>;
    },
  });
  React.useEffect(() => {
    if (secrets && secrets['openai'] && !openaiApiKey) {
      setOpenaiApiKey(secrets['openai']);
    }
  }, [secrets, openaiApiKey]);

  const { mutate: setSecrets } = useMutation({
    mutationFn: async (data: { secretKey: string; secretValue: string }) => {
      return systemApi.setSecret({
        setSecretRequest: {
          secretKey: data.secretKey,
          secretValue: data.secretValue,
        },
      });
    },
    onError: async (error) => {
      if (error instanceof ResponseError) {
        const errorResponse = await error.response.json();
        console.log('error', error, errorResponse);
        if (errorResponse.error === 'InvalidAPIKey') {
          showErrorToast(t('setting.openai_api_key_invalid'));
        }
      } else {
        showErrorToast(t('unknown_error'));
      }
      setOpenaiApiKey('');
    },
  });

  return (
    <Section title={t('intelligence')}>
      <Setting
        name={t('setting.ocr_service')}
        description={t('setting.ocr_service_description')}
      >
        <Dropdown
          className={classes.input}
          value={t(`setting.${currentVal}`)}
          selectedOptions={[currentVal]}
          onOptionSelect={(e, data) => {
            console.log('data', data);
            updateSettings({
              ocrService: data.optionValue as SettingsOcrServiceEnum,
            });
          }}
        >
          {options.map((option) => {
            return (
              <Option key={option} value={option}>
                {t(`setting.${option}`)}
              </Option>
            );
          })}
        </Dropdown>
      </Setting>
      <Setting
        name={t('setting.openai_api_key')}
        description={
          <Trans i18nKey="openai_api_key_description">
            Please input your{' '}
            <Link href="https://platform.openai.com/api-keys" target="_blank">
              OpenAI API Key
            </Link>{' '}
            for the chat feature.
          </Trans>
        }
      >
        <div className={classes.row}>
          <Input
            className={classes.input}
            type="password"
            onChange={(e) => {
              setOpenaiApiKey(e.target.value);
            }}
            value={openaiApiKey}
          ></Input>
          <Button
            appearance="primary"
            onClick={(e) => {
              setSecrets({ secretKey: 'openai', secretValue: openaiApiKey });
            }}
          >
            {t('save')}
          </Button>
        </div>
      </Setting>
    </Section>
  );
};
