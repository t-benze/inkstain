import * as React from 'react';
import { OnTreeItemClicked } from '../types';

export const useSelection = () => {
  const [lastSelect, setLastSelect] = React.useState<{
    value: string;
    itemType: string;
  } | null>(null);
  const [selection, setSelection] = React.useState<
    Array<{
      value: string;
      itemType: string;
    }>
  >([]);

  // TODO: support multi-select properly
  const handleSelected = React.useCallback<OnTreeItemClicked>(
    (data) => {
      const value = data.value.toString();
      if (data.event.shiftKey) {
        // Shift is held: Select the range from the last selected item to the clicked item
        // setSelection(new Set([...selection, ...range]));
      } else if (data.event.ctrlKey || data.event.metaKey) {
        // Use metaKey to support Command key on macOS
        // Ctrl or Command is held: Toggle selection of the clicked item
        if (selection.some((item) => item.value === value)) {
          setSelection(selection.filter((item) => item.value !== value));
        } else {
          setSelection([...selection, { value, itemType: data.itemType }]);
        }
      } else {
        // No modifier keys: Select only the clicked item (and deselect others)
        setSelection([{ value, itemType: data.itemType }]);
      }
      setLastSelect({
        value,
        itemType: data.itemType,
      });
    },
    [selection, setSelection, setLastSelect]
  );

  const clearSelection = React.useCallback(() => {
    setSelection([]);
    setLastSelect(null);
  }, [setSelection, setLastSelect]);

  return {
    lastSelect,
    clearSelection,
    selection,
    handleSelected,
  };
};
