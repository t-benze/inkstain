import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Body2,
  makeStyles,
  shorthands,
  tokens,
  Button,
  Title2,
} from '@fluentui/react-components';
import { AppContext } from '~/web/app/context';
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

const AccountSettings = () => {
  const { userInfo, startAuth, signOut } = React.useContext(AppContext);
  const classes = useClasses();
  const { t } = useTranslation();
  return (
    <div className={classes.section}>
      <div className={classes.sectionHeader}>
        <Title2>{t('account')}</Title2>
      </div>
      <div className={classes.sectionContent}>
        {!userInfo && (
          <Button
            onClick={() => {
              startAuth();
            }}
          >
            {t('sign_in')}
          </Button>
        )}
        {userInfo && (
          <Body2>{t('sing_in_as', { username: userInfo.username })}</Body2>
        )}
        {userInfo && (
          <Button
            onClick={() => {
              signOut();
            }}
          >
            {t('sign_out')}
          </Button>
        )}
      </div>
    </div>
  );
};

export const SettingsView = () => {
  const classes = useClasses();
  return (
    <div className={classes.root}>
      <AccountSettings />
    </div>
  );
};
