import * as React from 'react';
import { SpaceManagementView } from './SpaceManagementView';
import { SearchDocumentView } from './SearchDocumentView';
import { PDFView, PDFViewHandle } from '~/web/components/PDFView';
import { TextView } from './TextView';
import { useTranslation } from 'react-i18next';
import { Title1 } from '@fluentui/react-components';
import { AppContext } from '~/web/app/context';

interface DocumentViewProps {
  type: string;
  name: string;
  isActive: boolean;
}

export const DocumentView = ({ type, name, isActive }: DocumentViewProps) => {
  const { t } = useTranslation();
  const documentViewRef = React.useRef<unknown>(null);
  const appContext = React.useContext(AppContext);

  React.useEffect(() => {
    if (isActive) {
      if (documentViewRef.current) {
        appContext.setActiveDocumentViewRef(documentViewRef.current);
      }
    }
  }, [isActive, appContext]);

  if (type.startsWith('@inkstain/')) {
    const inkstainType = type.replace('@inkstain/', '');
    switch (inkstainType) {
      case 'space-management':
        return <SpaceManagementView />;
      case 'search-document':
        return <SearchDocumentView />;
      default:
        throw new Error('Unknown inkstain document type: ' + inkstainType);
    }
  }

  // when rendering an actual document, there must be an active space
  if (appContext.activeSpace === null) {
    throw new Error('Active space is null');
  }

  const spaceKey = appContext.activeSpace.key;
  switch (type) {
    case 'pdf': {
      return (
        <PDFView
          spaceKey={spaceKey}
          documentPath={name}
          ref={documentViewRef as React.MutableRefObject<PDFViewHandle>}
        />
      );
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
