import * as React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Subtitle1,
  Subtitle2,
  Caption1,
} from '@fluentui/react-components';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const useClasses = makeStyles({
  section: {
    ...shorthands.padding(tokens.spacingVerticalS),
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalS,
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: tokens.spacingVerticalS,
  },
  setting: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
});

export const Section = ({ title, children }: SectionProps) => {
  const classes = useClasses();
  return (
    <div className={classes.section}>
      <div className={classes.sectionHeader}>
        <Subtitle1>{title}</Subtitle1>
      </div>
      <div className={classes.sectionContent}>{children}</div>
    </div>
  );
};

export const Setting = ({
  name,
  description,
  children,
}: {
  name: string;
  description: string;
  children: React.ReactNode;
}) => {
  const classes = useClasses();
  return (
    <div className={classes.setting}>
      <Subtitle2>{name}</Subtitle2>
      <Caption1>{description}</Caption1>
      {children}
    </div>
  );
};
