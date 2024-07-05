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
import { FileExplorer } from '~/web/components/FileExplorer';
import {
  PDFThumbnailView,
  PDFOutlineView,
  PDFAnnotatedThumbnails,
} from '~/web/components/PDFView';

const useClasses = makeStyles({
  root: {
    minWidth: '250px',
    maxWidth: '250px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRight(
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

export const PrimarySidebar = () => {
  const classes = useClasses();
  const { activeSpace, activeDocument, documentsAlive } =
    React.useContext(AppContext);

  const document = activeDocument
    ? documentsAlive.find((doc) => doc.name === activeDocument)
    : null;
  const [openItems, setOpenItems] = React.useState(['file-explorer']);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };

  if (!activeSpace) {
    return <div className={classes.root}></div>;
  }
  const accordions = [
    { value: 'file-explorer', view: <FileExplorer space={activeSpace} /> },
  ];

  if (document && document.type === 'pdf') {
    accordions.push({
      value: 'pdf-thumbnail',
      view: (
        <PDFThumbnailView
          width={150}
          spaceKey={activeSpace.key}
          documentPath={document.name}
        />
      ),
    });
    accordions.push({
      value: 'pdf-outline',
      view: (
        <PDFOutlineView
          spaceKey={activeSpace.key}
          documentPath={document.name}
        />
      ),
    });
    accordions.push({
      value: 'pdf-annotations',
      view: (
        <PDFAnnotatedThumbnails
          width={150}
          spaceKey={activeSpace.key}
          documentPath={document.name}
        />
      ),
    });
  }
  return (
    <div data-test="primarySidebar" className={classes.root}>
      <Accordion
        className={classes.accordion}
        collapsible={true}
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
