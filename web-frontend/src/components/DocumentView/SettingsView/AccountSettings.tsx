import * as React from 'react';
import { useUser, useSignOut } from '~/web/hooks/auth';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { useTranslation } from 'react-i18next';
import { Body2, Button } from '@fluentui/react-components';
import { Section } from './components';

export const AccountSettings = () => {
  const { showAuthDialog } = useAppContext();
  const { userInfo } = useUser();
  const signOut = useSignOut();
  const { t } = useTranslation();
  return (
    <Section title={t('account')}>
      {!userInfo && (
        <Button
          data-test="settingsView-signInBtn"
          onClick={() => {
            showAuthDialog();
          }}
        >
          {t('sign_in')}
        </Button>
      )}
      {userInfo && (
        <Body2 data-test="settingsView-userInfo">
          {t('sing_in_as', { username: userInfo.username })}
        </Body2>
      )}
      {userInfo && (
        <Button
          data-test="settingsView-signOutBtn"
          onClick={() => {
            signOut();
          }}
        >
          {t('sign_out')}
        </Button>
      )}
    </Section>
  );
};
