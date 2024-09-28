import * as React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionToggleEventHandler,
  makeStyles,
  tokens,
  shorthands,
  mergeClasses,
} from '@fluentui/react-components';
import { AppContext } from '~/web/app/context';
import { DocumentTagView } from '~/web/components/DocumentTagView';
import { DocumentAttributesView } from '~/web/components/DocumentAttributesView';
import { SearchDocumentSidebar } from '~/web/components/DocumentView/SearchDocumentView';
import { Document } from '~/web/types';

const useClasses = makeStyles({
  root: {
    minWidth: '250px',
    maxWidth: '250px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderLeft(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
    height: '100%',
  },
  accordion: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  accordionItem: {
    flexBasis: '32px',
    height: '32px',
    flexShrink: 0,
    flexGrow: 0,
  },
  accordionItemOpen: {
    flexGrow: 1,
  },
});

const getAccordionItems = (document: Document | null) => {
  if (!document) {
    return [];
  }
  if (!document.type.startsWith('@inkstain')) {
    return [
      {
        value: 'document-tag-view',
        view: <DocumentTagView document={document} />,
      },
      {
        value: 'document-attributes-view',
        view: <DocumentAttributesView document={document} />,
      },
    ];
  } else {
    if (document.type === '@inkstain/search-document') {
      return [
        {
          value: 'search-document-view',
          view: <SearchDocumentSidebar />,
        },
      ];
    }
    return [];
  }
};
export const SecondarySidebar = ({ display }: { display: boolean }) => {
  const classes = useClasses();
  const { activeDocument, documentsAlive } = React.useContext(AppContext);

  const document = activeDocument
    ? documentsAlive.find((doc) => doc.name === activeDocument) ?? null
    : null;
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };

  const accordionItems = React.useMemo(
    () => getAccordionItems(document),
    [document]
  );
  const [openItems, setOpenItems] = React.useState<string[]>(
    accordionItems.length > 0 ? [accordionItems[0].value] : []
  );
  React.useEffect(() => {
    if (accordionItems.length > 0) {
      setOpenItems([accordionItems[0].value]);
    }
  }, [accordionItems]);

  return (
    <div
      data-test="secondarySidebar"
      className={classes.root}
      style={{ display: display ? 'block' : 'none' }}
    >
      <Accordion
        collapsible={true}
        className={classes.accordion}
        openItems={openItems}
        onToggle={handleToggle}
      >
        {accordionItems.map((accordion) => {
          return (
            <AccordionItem
              key={accordion.value}
              value={accordion.value}
              className={mergeClasses(
                classes.accordionItem,
                openItems.includes(accordion.value)
                  ? classes.accordionItemOpen
                  : undefined
              )}
            >
              {accordion.view}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
