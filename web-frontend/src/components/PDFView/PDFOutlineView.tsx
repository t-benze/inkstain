import * as React from 'react';
import { useDocument } from '~/web/hooks/useDocument';
import { usePDFDocument } from './hooks';
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';
import {
  Button,
  Tree,
  TreeItem,
  TreeItemLayout,
  makeStyles,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { AppContext } from '~/web/app/context';
import { PDFViewHandle } from './PDFViewer';

interface OutlineNode {
  title: string;
  dest: string | unknown[] | null;
  items: OutlineNode[];
}

const useClasses = makeStyles({
  outlineItemLayout: {
    overflowX: 'hidden',
    width: '100%',
    '& .fui-TreeItemLayout__main': {
      maxWidth: 'calc(100% - var(--spacingHorizontalXXS))',
    },
  },
  outlineButton: {
    textWrap: 'nowrap',
    textAlign: 'left',
    width: '100%',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    display: 'block',
  },
});

const OutlineTree = ({
  outline,
  pdfDocument,
}: {
  outline: OutlineNode[];
  pdfDocument: PDFDocumentProxy;
}) => {
  const classes = useClasses();
  const appContext = React.useContext(AppContext);
  const goToPage = (dest: object[]) => {
    pdfDocument
      .getPageIndex(dest[0] as { num: number; gen: number })
      .then((pageIndex) => {
        if (appContext.activeDocumentViewRef.current) {
          (appContext.activeDocumentViewRef.current as PDFViewHandle).goToPage(
            pageIndex + 1
          );
        }
      });
  };
  return (
    <Tree aria-label="pdf-outline-tree">
      {outline.map((node) => {
        const itemType = node.items.length > 0 ? 'branch' : 'leaf';
        return (
          <TreeItem key={node.title} itemType={itemType}>
            <TreeItemLayout className={classes.outlineItemLayout}>
              <Button
                className={classes.outlineButton}
                appearance="transparent"
                onClick={() => {
                  if (!node.dest) return;
                  if (typeof node.dest === 'string') {
                    pdfDocument
                      .getDestination(node.dest)
                      .then((dest: null | object[]) => {
                        if (dest) {
                          goToPage(dest);
                        }
                      });
                  } else if (
                    typeof node.dest === 'object' &&
                    node.dest.length > 0
                  ) {
                    goToPage(node.dest as object[]);
                  }
                }}
              >
                {node.title}
              </Button>
            </TreeItemLayout>
            {itemType === 'branch' && (
              <OutlineTree pdfDocument={pdfDocument} outline={node.items} />
            )}
          </TreeItem>
        );
      })}
    </Tree>
  );
};

export const PDFOutlineView = ({
  spaceKey,
  documentPath,
}: {
  spaceKey: string;
  documentPath: string;
}) => {
  const url = useDocument(documentPath);
  const { t } = useTranslation();
  const pdfDocument = usePDFDocument({ url });
  const [outline, setOutline] = React.useState<OutlineNode[]>([]);
  React.useEffect(() => {
    if (pdfDocument) {
      pdfDocument.getOutline().then((outline: OutlineNode[]) => {
        setOutline(outline);
      });
    }
  }, [pdfDocument]);

  return (
    <SidebarAccordionItem
      headerButtons={null}
      headerText={t('pdfview.outline')}
      panel={
        pdfDocument && outline ? (
          <OutlineTree pdfDocument={pdfDocument} outline={outline} />
        ) : (
          <div>{t('pdfview.no_outline_available')}</div>
        )
      }
    />
  );
};
