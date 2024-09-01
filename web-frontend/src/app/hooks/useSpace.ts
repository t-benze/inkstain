import * as React from 'react';
import { Space } from '~/web/types';

export const useSpace = () => {
  const [activeSpace, setActiveSpace] = React.useState<Space | null>(null);
  const openSpace = React.useCallback(
    (space: Space) => {
      if (activeSpace) {
        if (activeSpace.key === space.key) {
          return;
        } else {
          //TODO: open new at a different tab
          window.open(
            `${window.location.origin}/?space=${space.key}`,
            `inkstain-${space.key}`
          );
        }
      } else {
        setActiveSpace(space);
      }
    },
    [setActiveSpace, activeSpace]
  );

  return {
    openSpace,
    activeSpace,
  } as const;
};
