import * as React from 'react';
import { AppContext } from '~/web/app/context';
import { API_PREFIX } from '~/web/apiClient';

export const useDocument = (name: string) => {
  const appContext = React.useContext(AppContext);
  if (!appContext.activeSpace) {
    throw new Error('No active space');
  }
  return `${API_PREFIX}/documents/${
    appContext.activeSpace.key
  }/content?path=${encodeURIComponent(name)}`;
};
