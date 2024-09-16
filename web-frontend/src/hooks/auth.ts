import * as React from 'react';
import { authApi } from '~/web/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ResponseError,
  SignInRequest,
  SignUpRequest,
  ConfirmSignUpRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
} from '@inkstain/client-api';

export const useUser = () => {
  const { data: userInfo } = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      try {
        return await authApi.userInfo();
      } catch (error) {
        if (error instanceof ResponseError) {
          if (error.response.status !== 401) {
            console.error('Failed to get user info', error);
          }
        }
        return null;
      }
    },
  });

  return {
    isAuthenticated: !!userInfo,
    userInfo,
  };
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const signIn = (signInRequest: SignInRequest) => {
    return authApi
      .signIn({ signInRequest })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        return true;
      })
      .catch(async (error: ResponseError) => {
        const errorResponse = await error.response.json();
        setErrorMsg(errorResponse.message || error.response.statusText);
        return false;
      });
  };

  return { signIn, errorMsg };
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const signOut = () => {
    return authApi
      .signOut()
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      })
      .catch((error: ResponseError) => {
        if (error.response.status === 401) {
          queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        }
      });
  };

  return signOut;
};

export const useSignUp = () => {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const signUp = (signUpRequest: SignUpRequest) => {
    return authApi
      .signUp({ signUpRequest })
      .catch(async (error: ResponseError) => {
        const errorResponse = await error.response.json();
        setErrorMsg(errorResponse.message || error.response.statusText);
      });
  };

  return { signUp, errorMsg };
};

export const useConfirmSignUp = () => {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const confirmSignUp = (confirmSignUpRequest: ConfirmSignUpRequest) => {
    return authApi
      .confirmSignUp({ confirmSignUpRequest })
      .catch(async (error: ResponseError) => {
        const errorResponse = await error.response.json();
        setErrorMsg(errorResponse.message || error.response.statusText);
      });
  };

  return { confirmSignUp, errorMsg };
};

export const useForgotPassword = () => {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const forgotPassword = (forgotPasswordRequest: ForgotPasswordRequest) => {
    return authApi
      .forgotPassword({ forgotPasswordRequest })
      .catch(async (error: ResponseError) => {
        const errorResponse = await error.response.json();
        setErrorMsg(errorResponse.message || error.response.statusText);
      });
  };

  return { forgotPassword, errorMsg };
};

export const useConfirmForgotPassword = () => {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const confirmForgotPassword = (
    confirmForgotPasswordRequest: ConfirmForgotPasswordRequest
  ) => {
    return authApi
      .confirmForgotPassword({ confirmForgotPasswordRequest })
      .catch(async (error: ResponseError) => {
        const errorResponse = await error.response.json();
        setErrorMsg(errorResponse.message || error.response.statusText);
      });
  };

  return { confirmForgotPassword, errorMsg };
};
