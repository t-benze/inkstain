import * as React from 'react';
import { authApi } from '~/web/apiClient';
import { ResponseError } from '@inkstain/client-api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SignInRequest } from '@inkstain/client-api';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { data: userInfo } = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      try {
        return await authApi.userInfo();
      } catch (error) {
        if (error instanceof ResponseError && error.response.status === 401) {
          return null;
        }
        console.error('Failed to get user info', error);
      }
    },
  });

  const onSignInSuccess = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userInfo'] });
  }, [queryClient]);

  const signIn = React.useCallback(
    (signInRequest: SignInRequest) => {
      return authApi
        .signIn({
          signInRequest,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        })
        .catch((error: ResponseError) => {
          return false;
        });
    },
    [queryClient]
  );

  const signOut = React.useCallback(() => {
    return authApi
      .signOut()
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      })
      .catch((error: ResponseError) => {
        if (error.response.status === 401) {
          queryClient.invalidateQueries({ queryKey: ['userInfo'] });
          return true;
        }
        return false;
      });
  }, [queryClient]);

  return {
    onSignInSuccess,
    userInfo,
    signOut,
  };
};
