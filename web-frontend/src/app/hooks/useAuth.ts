import * as React from 'react';
import { authApi } from '~/web/apiClient';
import { ResponseError } from '@inkstain/client-api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
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

  const startAuth = React.useCallback(() => {
    setShowAuthDialog(true);
  }, []);

  const onSignInSuccess = React.useCallback(() => {
    setShowAuthDialog(false);
    queryClient.invalidateQueries({ queryKey: ['userInfo'] });
  }, [queryClient]);

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
    showAuthDialog,
    onSignInSuccess,
    setShowAuthDialog,
    startAuth,
    userInfo,
    signOut,
  };
};
