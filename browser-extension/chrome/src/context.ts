import * as React from 'react';
import { PlatformInfo200Response } from '@inkstain/client-api';

interface AppContext {
  platformInfo: PlatformInfo200Response;
}

export const AppContext = React.createContext<AppContext>({
  platformInfo: {
    platform: '',
    homedir: '',
    pathSep: '',
    systemAttributes: [],
  },
});