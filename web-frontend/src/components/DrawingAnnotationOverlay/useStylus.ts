import * as React from 'react';
import { StylusOption } from './types';
export const useStylus = () => {
  const [stylus, setStylus] = React.useState<StylusOption>('select');
  const handleStylusChange = React.useCallback((tool: StylusOption) => {
    setStylus(tool);
  }, []);
  const [strokeColor, setStrokeColor] = React.useState<string>('#000000');
  const handleStrokeColorChange = React.useCallback((color: string) => {
    setStrokeColor(color);
  }, []);
  const [strokeWidth, setStrokeWidth] = React.useState<number>(1);
  const handleStrokeWidthChange = React.useCallback((width: number) => {
    setStrokeWidth(width);
  }, []);
  return {
    strokeWidth,
    stylus,
    strokeColor,
    handleStrokeColorChange,
    handleStylusChange,
    handleStrokeWidthChange,
  };
};
