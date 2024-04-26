import * as React from 'react';
import {
  makeStyles,
  AccordionHeader,
  AccordionPanel,
  Text,
  shorthands,
  tokens,
} from '@fluentui/react-components';

const useClasses = makeStyles({
  accordionHeader: {
    height: '32px',
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
  },
  accordionHeaderContent: {
    flexGrow: 1,
    width: '0px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionPanel: {
    height: 'calc(100% - 32px)',
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
  },
});
export const SidebarAccordionItem = ({
  headerText,
  headerButtons,
  panel,
}: {
  headerText: string;
  headerButtons?: React.ReactNode;
  panel: React.ReactNode;
}) => {
  const classes = useClasses();
  return (
    <>
      <AccordionHeader size="small" className={classes.accordionHeader}>
        <div className={classes.accordionHeaderContent}>
          <Text wrap={false} truncate={true}>
            {headerText}
          </Text>
          <div>{headerButtons}</div>
        </div>
      </AccordionHeader>
      <AccordionPanel className={classes.accordionPanel}>
        {panel}
      </AccordionPanel>
    </>
  );
};
