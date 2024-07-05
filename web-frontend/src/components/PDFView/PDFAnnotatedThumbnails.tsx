import * as React from 'react';
import { useDocument } from '~/web/hooks/useDocument';
import { usePDFDocument } from './hooks';
import { PDFPageScrollView } from './PDFPageScrollView';
import { SidebarAccordionItem } from '../SidebarAccordionItem';
import { AppContext } from '~/web/app/context';
import { PDFViewHandle } from './PDFViewer';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import { Annotation } from '@inkstain/client-api';
import { PDFViewerContext, defaultContextValue } from './context';

export const PDFAnnotatedThumbnails = ({
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

  const { data: annotations } = useQuery({
    queryKey: ['document-annotations', spaceKey, documentPath],
    queryFn: async () => {
      const data = await documentsApi.getDocumentAnnotations({
        spaceKey,
        path: documentPath,
      });
      return data.reduce((acc, annotation) => {
        if (!acc[annotation.page]) acc[annotation.page] = [];
        acc[annotation.page].push(annotation);
        return acc;
      }, {} as Record<number, Annotation[]>);
    },
  });
  const shortListedPages = React.useMemo(() => {
    return Object.keys(annotations || {}).map(Number);
  }, [annotations]);

  return (
    <SidebarAccordionItem
      headerText={t('pdfview.annotatedThumbnail')}
      panel={
        desiredScale === -1 || pdfDocument === null ? null : (
          <PDFViewerContext.Provider
            value={{
              ...defaultContextValue,
              annotations: annotations || {},
              isThumbnail: true,
            }}
          >
            <PDFPageScrollView
              spaceKey={spaceKey}
              documentPath={documentPath}
              enableTextLayer={false}
              virtualizerLength={10}
              ref={sceneRef}
              document={pdfDocument}
              scale={desiredScale}
              onPageClick={(pageNum) => {
                if (appContext.activeDocumentViewRef.current) {
                  (
                    appContext.activeDocumentViewRef.current as PDFViewHandle
                  ).goToPage(pageNum);
                }
              }}
              shortListedPages={shortListedPages}
            />
          </PDFViewerContext.Provider>
        )
      }
    />
  );
};
