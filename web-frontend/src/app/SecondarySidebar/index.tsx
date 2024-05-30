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

const useClasses = makeStyles({
  root: {
    width: '300px',
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

export const SecondarySidebar = () => {
  const classes = useClasses();
  const { activeDocument, documentsAlive } = React.useContext(AppContext);

  const document = activeDocument
    ? documentsAlive.find((doc) => doc.name === activeDocument) ?? null
    : null;
  const [openItems, setOpenItems] = React.useState(['file-explorer']);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const accordions = [] as { value: string; view: React.ReactNode }[];
  if (document) {
    accordions.push(
      {
        value: 'document-tag-view',
        view: <DocumentTagView document={document} />,
      },
      {
        value: 'document-attributes-view',
        view: <DocumentAttributesView document={document} />,
      }
    );
  }
  return (
    <div data-test="secondarySidebar" className={classes.root}>
      <Accordion
        collapsible={true}
        className={classes.accordion}
        openItems={openItems}
        onToggle={handleToggle}
      >
        {accordions.map((accordion) => {
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
