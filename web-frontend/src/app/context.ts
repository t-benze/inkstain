import * as React from 'react';
import { PlatformGet200Response as PlatformData } from '@inkstain/client-api';

export type ContextType = { platform: PlatformData };
export const AppContext = React.createContext<ContextType>({} as ContextType);
