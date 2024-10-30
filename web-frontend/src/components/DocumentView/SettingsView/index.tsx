import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { AccountSettings } from './AccountSettings';
import { IntelligenceSettings } from './IntelligenceSettings';

const useClasses = makeStyles({
  root: {
    ...shorthands.padding(tokens.spacingVerticalS),
  },
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
});

export const SettingsView = () => {
  const classes = useClasses();

  return (
    <div className={classes.root}>
      <AccountSettings />
      <IntelligenceSettings />
    </div>
  );
};
