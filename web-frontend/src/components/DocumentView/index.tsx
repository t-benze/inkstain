import * as React from 'react';
import { SpaceManagementView } from './SpaceManagementView';
import { SearchDocumentView } from './SearchDocumentView';
import { PDFView, PDFViewHandle } from '~/web/components/PDFView';
import { TextView } from './TextView';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Button,
  Subtitle1,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { AppContext } from '~/web/app/context';
import { documentsApi } from '~/web/apiClient';

interface DocumentViewProps {
  type: string;
  name: string;
  isActive: boolean;
}
const useClasses = makeStyles({
  defaultView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    paddingTop: '100px',
  },
  defaultViewButtons: {
    marginTop: tokens.spacingVerticalXXL,
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
  },
});

export const DocumentView = ({ type, name, isActive }: DocumentViewProps) => {
  const { t } = useTranslation();
  const documentViewRef = React.useRef<unknown>(null);
  const appContext = React.useContext(AppContext);
  const classes = useClasses();

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
        <div className={classes.defaultView}>
          <Image
            width={400}
            height={400}
            src={'/static/assets/images/unsupported.svg'}
          />
          <Subtitle1>{`${t('error_unsupported_file_type', {
            type,
          })}`}</Subtitle1>
          <div className={classes.defaultViewButtons}>
            <Button
              size="large"
              onClick={() => {
                documentsApi.openDocumentWithSystemApp({
                  spaceKey,
                  path: name,
                });
              }}
            >
              {t('open_with_system_app')}
            </Button>
            <Button
              size="large"
              onClick={() => {
                appContext.closeDocument(name);
              }}
            >
              {t('close')}
            </Button>
          </div>
        </div>
      );
  }
};
