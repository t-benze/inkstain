import * as React from 'react';
import { useState } from 'react';

import {
  makeStyles,
  Text,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  Button,
  Field,
  Input,
  Link,
  tokens,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { authApi } from '~/web/apiClient';

type Mode =
  | 'signIn'
  | 'signUp'
  | 'confirmSignUp'
  | 'forgotPassword'
  | 'confirmForgotPassword';

interface AuthenticationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInSuccess: () => void;
}

const useClasses = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
});

const SignInForm = ({
  onModeChange,
  onSignInSuccess,
}: {
  onModeChange: (mode: Mode) => void;
  onSignInSuccess: () => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await authApi.signIn({
        signInRequest: {
          username,
          password,
        },
      });
      onSignInSuccess();
    } catch (error) {
      throw new Error(`sign in failed: ${error}`);
    }
  };

  return (
    <div className={classes.form}>
      <Field label={t('username')}>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field>
      <Field label={t('password')}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Link onClick={() => onModeChange('forgotPassword')}>
        {t('forgot_password')}
      </Link>
      <Button appearance="primary" onClick={handleSignIn}>
        {t('sign_in')}
      </Button>
      <div>
        {t('dont_have_account') + ` `}
        <Link onClick={() => onModeChange('signUp')}>{t('sign_up')}</Link>
      </div>
    </div>
  );
};

const SignUpForm = ({
  onModeChange,
}: {
  onModeChange: (
    mode: Mode,
    extraData?: { username: string; password: string }
  ) => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorState, setErrorState] = useState<
    Record<'username' | 'email' | 'password' | 'confirmPassword', string | null>
  >({
    username: null,
    email: null,
    password: null,
    confirmPassword: null,
  });

  const validate = () => {
    const errorState = {
      username: null,
      email:
        !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? t('invalid_email_format')
          : null,
      password: null,
      confirmPassword:
        password !== confirmPassword ? t('passwords_do_not_match') : null,
    };
    setErrorState(errorState);
    return Object.values(errorState).every((error) => error === null);
  };

  const handleSignUp = async () => {
    if (validate()) {
      try {
        await authApi.signUp({
          signUpRequest: {
            username,
            email,
            password,
          },
        });
        onModeChange('confirmSignUp', {
          username,
          password,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className={classes.form}>
      <Field label={t('username')}>
        <Input type="text" onChange={(e) => setUsername(e.target.value)} />
      </Field>
      <Field
        label={t('email')}
        validationState={errorState.email ? 'error' : undefined}
        validationMessage={errorState.email}
      >
        <Input type="email" onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label={t('password')}>
        <Input type="password" onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field
        label={t('confirm_password')}
        validationState={errorState.confirmPassword ? 'error' : undefined}
        validationMessage={errorState.confirmPassword}
      >
        <Input
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Field>
      <div>
        {t('already_have_account') + ` `}
        <Link onClick={() => onModeChange('signIn')}>{t('sign_in')}</Link>
      </div>
      <Button appearance="primary" onClick={handleSignUp}>
        {t('sign_up')}
      </Button>
    </div>
  );
};

const ConfirmSignUpForm = ({
  onSignInSuccess,
  extraData,
}: {
  onSignInSuccess: () => void;
  extraData: { username: string; password: string } | null;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [code, setCode] = useState('');

  const handleConfirmSignUp = async () => {
    if (!extraData) {
      throw new Error('extraData with username and password is required');
    }
    try {
      await authApi.confirmSignUp({
        confirmSignUpRequest: {
          username: extraData.username,
          code,
        },
      });
      await authApi.signIn({
        signInRequest: {
          username: extraData.username,
          password: extraData.password,
        },
      });
      onSignInSuccess();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={classes.form}>
      <Field label={t('confirmation_code')}>
        <Input type="text" onChange={(e) => setCode(e.target.value)} />
      </Field>
      <Button appearance="primary" onClick={handleConfirmSignUp}>
        {t('confirm')}
      </Button>
    </div>
  );
};

const ForgotPasswordForm = ({
  onModeChange,
}: {
  onModeChange: (mode: Mode, extraData?: { username: string }) => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [username, setUsername] = useState('');

  const handleResetPassword = async () => {
    try {
      await authApi.forgotPassword({
        forgotPasswordRequest: {
          username,
        },
      });
      onModeChange('confirmForgotPassword', {
        username,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={classes.form}>
      <Text>{t('reset_password_description')}</Text>
      <Field label={t('username')}>
        <Input type="text" onChange={(e) => setUsername(e.target.value)} />
      </Field>
      <Button appearance="primary" onClick={handleResetPassword}>
        {t('reset_password')}
      </Button>
    </div>
  );
};

const ResetPasswordConfirmation = ({
  extraData,
  onModeChange,
}: {
  extraData: { username: string } | null;
  onModeChange: (mode: Mode) => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorState, setErrorState] = useState<
    Record<'password' | 'confirmPassword', string | null>
  >({
    password: null,
    confirmPassword: null,
  });
  const [successState, setSuccessState] = useState(false);

  const validate = () => {
    const errorState = {
      password: null,
      confirmPassword:
        password !== confirmPassword ? t('passwords_do_not_match') : null,
    };
    setErrorState(errorState);
    return Object.values(errorState).every((error) => error === null);
  };

  const handleConfirmResetPassword = async () => {
    if (!extraData) {
      throw new Error('extraData with username is required');
    }
    if (validate()) {
      try {
        await authApi.confirmForgotPassword({
          confirmForgotPasswordRequest: {
            username: extraData.username,
            code: code,
            newPassword: password,
          },
        });
        setSuccessState(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className={classes.form}>
      {successState ? (
        <Text>
          {t('reset_password_confirmation_success') + ` `}
          <Link onClick={() => onModeChange('signIn')}>{t('sign_in')}</Link>
        </Text>
      ) : (
        <>
          <Text>{t('reset_password_confirmation_description')}</Text>
          <Field label={t('confirmation_code')}>
            <Input type="text" onChange={(e) => setCode(e.target.value)} />
          </Field>
          <Field label={t('new_password')}>
            <Input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field
            label={t('confirm_password')}
            validationState={errorState.confirmPassword ? 'error' : undefined}
            validationMessage={errorState.confirmPassword}
          >
            <Input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
          <Button appearance="primary" onClick={handleConfirmResetPassword}>
            {t('confirm')}
          </Button>
        </>
      )}
    </div>
  );
};

export const AuthenticationDialog: React.FC<AuthenticationDialogProps> = ({
  open,
  onOpenChange,
  onSignInSuccess,
}) => {
  const [mode, setMode] = useState<Mode>('signIn');
  const [extraData, setExtraData] = useState<object | null>(null);
  const classes = useClasses();
  const { t } = useTranslation();
  const handleModeChange = React.useCallback(
    (mode: Mode, extraData?: object) => {
      setMode(mode);
      if (extraData) {
        setExtraData(extraData);
      } else {
        setExtraData(null);
      }
    },
    []
  );

  const renderContent = () => {
    switch (mode) {
      case 'signIn':
        return (
          <SignInForm
            onSignInSuccess={onSignInSuccess}
            onModeChange={handleModeChange}
          />
        );
      case 'signUp':
        return <SignUpForm onModeChange={handleModeChange} />;
      case 'confirmSignUp':
        return (
          <ConfirmSignUpForm
            onSignInSuccess={onSignInSuccess}
            extraData={
              extraData as { username: string; password: string } | null
            }
          />
        );
      case 'forgotPassword':
        return <ForgotPasswordForm onModeChange={handleModeChange} />;
      case 'confirmForgotPassword':
        return (
          <ResetPasswordConfirmation
            onModeChange={handleModeChange}
            extraData={extraData as { username: string } | null}
          />
        );
    }
  };

  const titleMessage: Record<Mode, string> = {
    confirmSignUp: t('confirm_sign_up'),
    signIn: t('sign_in'),
    signUp: t('sign_up'),
    forgotPassword: t('forgot_password'),
    confirmForgotPassword: t('confirm_forgot_password_code'),
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(event, data) => {
        if (!data.open) {
          setMode('signIn');
        }
        onOpenChange(data.open);
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{titleMessage[mode]}</DialogTitle>
          <DialogContent className={classes.content}>
            {renderContent()}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
