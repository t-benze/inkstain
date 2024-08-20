import * as React from 'react';
import { DocumentAttribute } from './types';

export const useNewAttributes = () => {
  const [newAttributes, setNewAttributes] = React.useState<
    Array<DocumentAttribute>
  >([]);

  const addAttribute = (attribute: DocumentAttribute) => {
    setNewAttributes([...newAttributes, attribute]);
  };

  const removeAttribute = (index: number) => {
    setNewAttributes(newAttributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, attribute: DocumentAttribute) => {
    setNewAttributes(
      newAttributes.map((attr, i) => (i === index ? attribute : attr))
    );
  };

  const clearNewAttributes = () => {
    setNewAttributes([]);
  };

  return {
    newAttributes,
    addAttribute,
    removeAttribute,
    clearNewAttributes,
    updateAttribute,
  };
};
