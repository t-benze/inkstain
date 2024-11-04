import * as React from 'react';
import { CodeBlock } from './types';

type ChatContextType = {
  sessionId: string;
};

export const ChatContext = React.createContext({} as ChatContextType);
