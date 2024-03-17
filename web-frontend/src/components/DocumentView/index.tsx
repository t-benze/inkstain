import { SpaceManagementView } from './SpaceManagementView';
import { PDFView } from '~/web/components/PDFView';
import { TextView } from './TextView';
import { useTranslation } from 'react-i18next';
import { Title1 } from '@fluentui/react-components';

interface DocumentViewProps {
  type: string;
  name: string;
}

export const DocumentView = ({ type, name }: DocumentViewProps) => {
  const { t } = useTranslation();
  if (type.startsWith('@inkstain/')) {
    const inkstainType = type.replace('@inkstain/', '');
    switch (inkstainType) {
      case 'space-management':
        return <SpaceManagementView />;
      default:
        throw new Error('Unknown inkstain document type: ' + inkstainType);
    }
  }

  switch (type) {
    case 'pdf': {
      // return <PDFViewer name={name} />;
      return <PDFView name={name} />;
    }
    case 'txt': {
      return <TextView name={name} />;
    }
    default:
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Title1>{`${t('error_unsupported_file_type', { type })}`}</Title1>
        </div>
      );
  }
};
