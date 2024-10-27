import * as React from 'react';
import { PlatformInfo200Response } from '@inkstain/client-api';

interface AppContext {
  platformInfo: PlatformInfo200Response;
  data: {
    url?: string;
    title?: string;
  };
  behavior: 'download' | 'clip';
}

export const PopupContext = React.createContext<AppContext>({
  platformInfo: {
    platform: '',
    homedir: '',
    pathSep: '',
    attributes: {
      attributesWithIndex: [],
      attributes: [],
    },
  },
  data: {
    url: '',
    title: '',
  },
  behavior: 'download',
});
