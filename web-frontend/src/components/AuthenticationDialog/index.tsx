import * as React from 'react';
import { useState } from 'react';
import { AppContext } from '~/web/app/context';
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
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import {
  useSignIn,
  useSignUp,
  useConfirmSignUp,
  useForgotPassword,
  useConfirmForgotPassword,
} from '~/web/hooks/auth';

type Mode =
  | 'signIn'
  | 'signUp'
  | 'confirmSignUp'
  | 'forgotPassword'
  | 'confirmForgotPassword';

interface AuthenticationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const FormBody = ({
  children,
  errorMsg,
}: {
  children: React.ReactNode;
  errorMsg?: string | null;
}) => {
  const classes = useClasses();
  return (
    <div className={classes.form}>
      {errorMsg && (
        <MessageBar intent="error" data-test="authDialog-errorMsg">
          <MessageBarBody>{errorMsg}</MessageBarBody>
        </MessageBar>
      )}
      {children}
    </div>
  );
};

const SignInForm = ({
  onModeChange,
}: {
  onModeChange: (mode: Mode) => void;
}) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, errorMsg } = useSignIn();
  const [errorState, setErrorState] = useState<
    Record<'username' | 'password', string | null>
  >({
    username: null,
    password: null,
  });
  const { showAuthDialog } = React.useContext(AppContext);
  const validate = () => {
    const errorState = {
      username: !username ? t('username_is_required') : null,
      password: !password ? t('password_is_required') : null,
    };
    setErrorState(errorState);
    return Object.values(errorState).every((error) => error === null);
  };

  return (
    <FormBody errorMsg={errorMsg}>
      <Field
        label={t('username')}
        validationState={errorState.username ? 'error' : undefined}
        validationMessage={errorState.username}
      >
        <Input
          data-test="authDialog-usernameInput"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field>
      <Field
        label={t('password')}
        validationState={errorState.password ? 'error' : undefined}
        validationMessage={errorState.password}
      >
        <Input
          data-test="authDialog-passwordInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Link
        data-test="authDialog-forgotPasswordLink"
        onClick={() => onModeChange('forgotPassword')}
      >
        {t('forgot_password')}
      </Link>
      <Button
        data-test="authDialog-signInBtn"
        appearance="primary"
        onClick={() => {
          if (validate()) {
            signIn({ username, password }).then((success) => {
              if (success) {
                showAuthDialog(false);
              }
            });
          }
        }}
      >
        {t('sign_in')}
      </Button>
      <div>
        {t('dont_have_account') + ` `}
        <Link
          data-test="authDialog-signUpLink"
          onClick={() => onModeChange('signUp')}
        >
          {t('sign_up')}
        </Link>
      </div>
    </FormBody>
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
  const { signUp, errorMsg } = useSignUp();
  const validate = () => {
    const errorState = {
      username: !username ? t('username_is_required') : null,
      email:
        !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? t('invalid_email_format')
          : null,
      password: !password ? t('password_is_required') : null,
      confirmPassword:
        password !== confirmPassword ? t('passwords_do_not_match') : null,
    };
    setErrorState(errorState);
    return Object.values(errorState).every((error) => error === null);
  };

  const handleSignUp = async () => {
    if (validate()) {
      signUp({ username, email, password }).then(() => {
        onModeChange('confirmSignUp', { username, password });
      });
    }
  };

  return (
    <FormBody errorMsg={errorMsg}>
      <Field label={t('username')}>
        <Input
          data-test="authDialog-usernameInput"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field>
      <Field
        label={t('email')}
        validationState={errorState.email ? 'error' : undefined}
        validationMessage={errorState.email}
      >
        <Input
          data-test="authDialog-emailInput"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label={t('password')}>
        <Input
          data-test="authDialog-passwordInput"
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
          data-test="authDialog-confirmPasswordInput"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Field>
      <div>
        {t('already_have_account') + ` `}
        <Link
          data-test="authDialog-signInLink"
          onClick={() => onModeChange('signIn')}
        >
          {t('sign_in')}
        </Link>
      </div>
      <Button
        data-test="authDialog-signUpBtn"
        appearance="primary"
        onClick={handleSignUp}
      >
        {t('sign_up')}
      </Button>
    </FormBody>
  );
};

const ConfirmSignUpForm = ({
  extraData,
}: {
  extraData: { username: string; password: string } | null;
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [errorState, setErrorState] = useState<Record<'code', string | null>>({
    code: null,
  });
  const { confirmSignUp, errorMsg } = useConfirmSignUp();
  const { signIn } = useSignIn();
  const validate = () => {
    const errorState = {
      code: !code ? t('confirmation_code_is_required') : null,
    };
    setErrorState(errorState);
    return Object.values(errorState).every((error) => error === null);
  };

  const { showAuthDialog } = React.useContext(AppContext);
  const handleConfirmSignUp = async () => {
    if (!extraData) {
      throw new Error('extraData with username and password is required');
    }
    if (validate()) {
      confirmSignUp({ username: extraData.username, code }).then(() => {
        signIn({
          username: extraData.username,
          password: extraData.password,
        }).then(() => {
          showAuthDialog(false);
        });
      });
    }
  };

  return (
    <FormBody errorMsg={errorMsg}>
      <Field
        label={t('confirmation_code')}
        validationState={errorState.code ? 'error' : undefined}
        validationMessage={errorState.code}
      >
        <Input
          data-test="authDialog-confirmationCodeInput"
          type="text"
          onChange={(e) => setCode(e.target.value)}
        />
      </Field>
      <Button
        data-test="authDialog-confirmSignUpBtn"
        appearance="primary"
        onClick={handleConfirmSignUp}
      >
        {t('confirm')}
      </Button>
    </FormBody>
  );
};

const ForgotPasswordForm = ({
  onModeChange,
}: {
  onModeChange: (mode: Mode, extraData?: { username: string }) => void;
}) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const { forgotPassword, errorMsg } = useForgotPassword();
  const [errorState, setErrorState] = useState<
    Record<'username', string | null>
  >({
    username: null,
  });

  const validate = () => {
    const errorState = {
      username: !username ? t('username_is_required') : null,
    };
    setErrorState(errorState);
    return Object.values(errorState).every((error) => error === null);
  };

  const handleResetPassword = async () => {
    if (validate()) {
      forgotPassword({ username }).then(() => {
        onModeChange('confirmForgotPassword', { username });
      });
    }
  };

  return (
    <FormBody errorMsg={errorMsg}>
      <Text>{t('reset_password_description')}</Text>
      <Field
        label={t('username')}
        validationState={errorState.username ? 'error' : undefined}
        validationMessage={errorState.username}
      >
        <Input
          data-test="authDialog-usernameInput"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field>
      <Button
        data-test="authDialog-forgotPasswordBtn"
        appearance="primary"
        onClick={handleResetPassword}
      >
        {t('reset_password')}
      </Button>
    </FormBody>
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
  const { confirmForgotPassword, errorMsg } = useConfirmForgotPassword();
  const { showAuthDialog } = React.useContext(AppContext);
  const validate = () => {
    const errorState = {
      password: !password ? t('password_is_required') : null,
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
      confirmForgotPassword({
        username: extraData.username,
        code,
        newPassword: password,
      }).then(() => {
        setSuccessState(true);
        showAuthDialog(false);
      });
    }
  };

  return (
    <FormBody errorMsg={errorMsg}>
      {successState ? (
        <Text>
          {t('reset_password_confirmation_success') + ` `}
          <Link
            data-test="authDialog-signInLink"
            onClick={() => onModeChange('signIn')}
          >
            {t('sign_in')}
          </Link>
        </Text>
      ) : (
        <>
          <Text>{t('reset_password_confirmation_description')}</Text>
          <Field label={t('confirmation_code')}>
            <Input
              data-test="authDialog-confirmationCodeInput"
              type="text"
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>
          <Field label={t('new_password')}>
            <Input
              data-test="authDialog-newPasswordInput"
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
              data-test="authDialog-confirmNewPasswordInput"
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
          <Button
            data-test="authDialog-confirmForgotPasswordBtn"
            appearance="primary"
            onClick={handleConfirmResetPassword}
          >
            {t('confirm')}
          </Button>
        </>
      )}
    </FormBody>
  );
};

export const AuthenticationDialog: React.FC<AuthenticationDialogProps> = ({
  open,
  onOpenChange,
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
        return <SignInForm onModeChange={handleModeChange} />;
      case 'signUp':
        return <SignUpForm onModeChange={handleModeChange} />;
      case 'confirmSignUp':
        return (
          <ConfirmSignUpForm
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
