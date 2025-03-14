import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Select, Field, Input } from '@fluentui/react-components';
import { useClasses } from './styles';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { Setting } from './components';
import { SettingsOcrServiceEnum } from '@inkstain/client-api';
import { systemApi } from '~/web/apiClient';

const AlibabaAccessKeys = () => {
  const classes = useClasses();
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppContext();
  const [accessKeyId, setAccessKeyId] = React.useState<string>('');
  const [accessKeySecret, setAccessKeySecret] = React.useState<string>('');

  React.useEffect(() => {
    const keyId = settings.alibabaAccessKeyId;
    if (keyId) {
      setAccessKeyId(keyId);
      systemApi
        .getSecrets({
          secretKey: [keyId],
        })
        .then((data) => {
          const value = (data as Record<string, string>)[keyId];
          setAccessKeySecret(value);
        });
    }
  }, [settings.alibabaAccessKeyId]);

  const { mutate: saveAccessKey, isPending } = useMutation({
    mutationFn: async () => {
      if (accessKeyId && accessKeySecret) {
        await systemApi.saveSecret({
          saveSecretRequest: {
            secretKey: accessKeyId,
            secretValue: accessKeySecret,
          },
        });
      }
    },
    onSuccess: () => {
      updateSettings({
        alibabaAccessKeyId: accessKeyId,
      });
    },
  });

  return (
    <>
      <Field label="Access Key ID" className={classes.input}>
        <Input
          type="text"
          value={accessKeyId}
          onChange={(e, data) => {
            setAccessKeyId(data.value);
          }}
        />
      </Field>
      <Field label="Access Key Secret" className={classes.input}>
        <Input
          type="password"
          value={accessKeySecret}
          onChange={(e, data) => {
            setAccessKeySecret(data.value);
          }}
        />
      </Field>
      <Button
        disabled={!accessKeyId || !accessKeySecret || isPending}
        appearance="primary"
        onClick={() => {
          saveAccessKey();
        }}
      >
        {t('setting.save_alibaba_keys')}
      </Button>
    </>
  );
};

export const OCRSettings = () => {
  const { t } = useTranslation();
  const classes = useClasses();
  const { settings, updateSettings } = useAppContext();
  const options = ['default', 'alibaba'] as SettingsOcrServiceEnum[];
  return (
    <Setting
      name={t('setting.ocr_service')}
      description={t('setting.ocr_service_description')}
    >
      <Select
        className={classes.input}
        value={settings.ocrService}
        onChange={(e, data) => {
          updateSettings({
            ocrService: data.value as SettingsOcrServiceEnum,
          });
        }}
      >
        {options.map((option) => {
          return (
            <option key={option} value={option}>
              {t(`setting.${option}`)}
            </option>
          );
        })}
      </Select>
      {settings.ocrService === 'alibaba' && <AlibabaAccessKeys />}
    </Setting>
  );
};
