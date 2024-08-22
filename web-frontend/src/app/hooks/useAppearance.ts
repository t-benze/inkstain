import * as React from 'react';
import { Appearance } from '../types';

export const useAppearance = () => {
  const [appearance, setAppearance] = React.useState<Appearance>({
    showPrimarySidebar: true,
    showSecondarySidebar: true,
  });

  return {
    appearance,
    setAppearance,
  };
};
