import * as React from 'react';
import { useDocument } from '~/web/hooks/useDocument';
import { usePDFDocument } from './hooks';
import { PDFPageScrollView } from './PDFPageScrollView';
import { SidebarAccordionItem } from '../SidebarAccordionItem';
import { AppContext } from '~/web/app/context';
import { PDFViewHandle } from './PDFViewer';
import { useTranslation } from 'react-i18next';
import { PDFViewerContext, defaultContextValue } from './context';

export const PDFThumbnailView = ({
  width,
  documentPath,
  spaceKey,
}: {
  spaceKey: string;
  width: number;
  documentPath: string;
}) => {
  const url = useDocument(documentPath);
  const { t } = useTranslation();
  const pdfDocument = usePDFDocument({ url });
  const [desiredScale, setDesciredScale] = React.useState<number>(-1);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const appContext = React.useContext(AppContext);
  React.useEffect(() => {
    if (pdfDocument) {
      pdfDocument.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        setDesciredScale(width / viewport.width);
      });
    }
  }, [pdfDocument, width]);

  return (
    <SidebarAccordionItem
      headerText={t('pdfview.thumbnail')}
      panel={
        desiredScale === -1 || pdfDocument === null ? null : (
          <PDFViewerContext.Provider
            value={{ ...defaultContextValue, isThumbnail: true }}
          >
            <PDFPageScrollView
              spaceKey={spaceKey}
              documentPath={documentPath}
              virtualizerLength={10}
              ref={sceneRef}
              document={pdfDocument}
              scale={desiredScale}
              onPageClick={(pageNum) => {
                console.log('pageNum', pageNum);
                if (appContext.activeDocumentViewRef.current) {
                  (
                    appContext.activeDocumentViewRef.current as PDFViewHandle
                  ).goToPage(pageNum);
                }
              }}
            />
          </PDFViewerContext.Provider>
        )
      }
    />
  );
};
