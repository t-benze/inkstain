import { useTranslation } from 'react-i18next';
import { Dropdown, Option, makeStyles } from '@fluentui/react-components';
import { SettingsOcrServiceEnum } from '@inkstain/client-api';
import { Section, Setting } from './components';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { ChatAssistantSetting } from './ChatAssistantSetting';
import { useClasses } from './styles';

export const IntelligenceSettings = () => {
  const { t } = useTranslation();
  const classes = useClasses();
  const { settings, updateSettings } = useAppContext();
  const options = ['remote', 'local'] as SettingsOcrServiceEnum[];
  const currentVal = settings.ocrService || 'remote';

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
      <ChatAssistantSetting />
    </Section>
  );
};
