import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Option } from '@fluentui/react-components';
import { SettingsOcrServiceEnum } from '@inkstain/client-api';
import { Section, Setting } from './components';
import { useAppContext } from '~/web/app/hooks/useAppContext';

export const IntelligenceSettings = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppContext();
  const options = ['remote', 'local'] as SettingsOcrServiceEnum[];
  const currentVal = settings.ocrService;

  return (
    <Section title={t('intelligence')}>
      <Setting
        name={t('setting.ocr_service')}
        description={t('setting.ocr_service_description')}
      >
        <Dropdown
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
    </Section>
  );
};
