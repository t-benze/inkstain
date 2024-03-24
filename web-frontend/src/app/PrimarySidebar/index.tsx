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
import { PDFThumbnailView, PDFOutlineView } from '~/web/components/PDFView';

const useClasses = makeStyles({
  root: {
    minWidth: '300px',
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

const NoSpaceSelected = () => {
  return <div>No space selected</div>;
};

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
    return (
      <div className={classes.root}>
        <NoSpaceSelected />
      </div>
    );
  }
  const accordions = [
    { value: 'file-explorer', view: <FileExplorer space={activeSpace} /> },
  ];
  if (document && document.type === 'pdf') {
    accordions.push({
      value: 'pdf-thumbnail',
      view: <PDFThumbnailView width={150} name={document.name} />,
    });
    accordions.push({
      value: 'pdf-outline',
      view: <PDFOutlineView name={document.name} />,
    });
    // accordions.push(
    //   <div style={{ backgroundColor: 'blue', height: '1000px' }} />
    // );
  }
  return (
    <div data-test="primarySidebar" className={classes.root}>
      <Accordion
        className={classes.accordion}
        openItems={openItems}
        onToggle={handleToggle}
      >
        {accordions.map((accordion) => {
          return (
            <AccordionItem
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
