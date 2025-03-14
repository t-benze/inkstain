import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Input,
  Button,
  useToastController,
  Toast,
  ToastTitle,
  Field,
} from '@fluentui/react-components';
import { useMutation } from '@tanstack/react-query';
import { ResponseError } from '@inkstain/client-api';
import { systemApi } from '~/web/apiClient';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { Setting } from './components';
import { useClasses } from './styles';

export const ChatAssistantSetting = () => {
  const { t } = useTranslation();
  const classes = useClasses();
  const { toasterId } = useAppContext();
  const { dispatchToast } = useToastController(toasterId);
  const { settings, updateSettings } = useAppContext();
  const [model, setModel] = React.useState<string>('');
  const [baseUrl, setBaseUrl] = React.useState<string>('');
  const [apiKey, setApiKey] = React.useState<string>('');
  const [apiKeyError, setApiKeyError] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (settings.chatService) {
      setModel(settings.chatService.model || '');
      setBaseUrl(settings.chatService.baseUrl || '');
      const secretKey = settings.chatService.apiKeySecretKey;
      if (secretKey) {
        systemApi
          .getSecrets({
            secretKey: [secretKey],
          })
          .then((data) => {
            const value = (data as Record<string, string>)[secretKey];
            setApiKey(value);
          });
      }
    }
  }, [settings.chatService]);

  const showErrorToast = React.useCallback(
    (message: string) => {
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

  const { mutate: updateChatSettings } = useMutation({
    mutationFn: async (data: {
      apiKey: string;
      model?: string;
      baseUrl?: string;
    }) => {
      return systemApi.verifyChatAPISettings({
        verifyChatAPISettingsRequest: data,
      });
    },
    onError: async (error) => {
      if (error instanceof ResponseError) {
        const errorResponse = await error.response.json();
        if (errorResponse.error === 'InvalidAPIKey') {
          showErrorToast(t('setting.chat_api_key_invalid'));
        }
      } else {
        showErrorToast(t('unknown_error'));
      }
      setApiKey('');
    },
    onSuccess: async (data) => {
      updateSettings({
        chatService: data,
      });
    },
  });

  return (
    <Setting
      name={t('setting.chat_assistant_setting')}
      description={t('setting.chat_assistant_setting_description')}
    >
      <Field label={t('setting.chat_api_base_url')}>
        <Input
          className={classes.input}
          type="text"
          placeholder={t('setting.chat_api_base_url_placeholder')}
          value={baseUrl}
          onChange={(e) => {
            setBaseUrl(e.target.value);
          }}
        ></Input>
      </Field>

      <Field label={t('setting.chat_model')}>
        <Input
          className={classes.input}
          type="text"
          placeholder={t('setting.chat_model_placeholder')}
          onChange={(e) => {
            setModel(e.target.value);
          }}
          value={model}
        ></Input>
      </Field>
      <Field label={t('setting.chat_api_key')} validationMessage={apiKeyError}>
        <Input
          className={classes.input}
          type="password"
          onChange={(e) => {
            setApiKey(e.target.value);
          }}
          value={apiKey}
        ></Input>
      </Field>
      <Button
        appearance="primary"
        onClick={(e) => {
          if (!apiKey) {
            setApiKeyError(t('setting.chat_api_key_required'));
            return;
          }
          updateChatSettings({
            apiKey,
            baseUrl,
            model,
          });
        }}
      >
        {t('setting.save_chat_settings')}
      </Button>
    </Setting>
  );
};
