import { useTranslation } from 'react-i18next';
import { Section } from './components';
import { ChatAssistantSetting } from './ChatAssistantSetting';
import { OCRSettings } from './OCRSettings';

export const IntelligenceSettings = () => {
  const { t } = useTranslation();

  return (
    <Section title={t('intelligence')}>
      <OCRSettings />
      <ChatAssistantSetting />
    </Section>
  );
};
