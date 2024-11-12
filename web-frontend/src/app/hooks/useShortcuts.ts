import { useCallback, useEffect, useState } from 'react';

const shortcuts = [{ keys: ['ctrl', 's'], action: () => console.log('save') }];

export const useShortcuts = () => {
  const [showHelp, setShowHelp] = useState(false);
  // Keep track of pressed keys for combo shortcuts
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Helper to check if an input/textarea is focused
  const isEditableElement = useCallback(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element) return false;
    return (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.isContentEditable
    );
  }, []);

  // Main keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input elements
      if (!event.key || isEditableElement()) return;

      // Add key to pressed keys set
      setPressedKeys((prev) => new Set([...prev, event.key.toLowerCase()]));

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map((k) => k.toLowerCase());
        const allKeysPressed = keys.every(
          (k) => pressedKeys.has(k) || event.key.toLowerCase() === k
        );

        if (allKeysPressed) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [pressedKeys, isEditableElement]
  );

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    // Remove released key from pressed keys set
    if (!event.key || isEditableElement()) return;
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(event.key.toLowerCase());
      return next;
    });
  }, []);

  // Show help dialog when "?" is pressed
  //   const toggleHelp = useCallback(
  //     (event: KeyboardEvent) => {
  //       if (event.key === '?' && !isEditableElement()) {
  //         event.preventDefault();
  //         setShowHelp((prev) => !prev);
  //       }
  //     },
  //     [isEditableElement]
  //   );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // window.addEventListener('keydown', toggleHelp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      //   window.removeEventListener('keydown', toggleHelp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    pressedKeys,
  };
};
