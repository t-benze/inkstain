import { useContext } from 'react';
import { AppContext } from '~/web/app/context';

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within a AppContext');
  }
  return context;
};
