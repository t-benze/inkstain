import { DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { useRef, useCallback } from 'react';

export const useMove = (
  openItem: (item: string) => void,
  handleMove: (params: {
    target: string;
    newFolder: string;
    isFolder: boolean;
  }) => void
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const overItemRef = useRef<string | null>(null);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (event.over && event.over.data.current) {
        if (event.over.data.current.type === 'folder') {
          const currentPath = event.over.data.current.path;

          if (overItemRef.current !== currentPath) {
            overItemRef.current = currentPath;

            if (timerRef.current) {
              clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
              openItem(currentPath);
            }, 300);
          }
        }
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        overItemRef.current = null;
      }
    },
    [openItem]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      overItemRef.current = null;
      if (event.active.data.current && event.over?.data.current) {
        handleMove({
          target: event.active.data.current.path,
          newFolder: event.over.data.current.path,
          isFolder: event.active.data.current.type === 'folder',
        });
      }
    },
    [handleMove]
  );

  return { handleDragOver, handleDragEnd };
};
