import * as React from 'react';
import { StylusOption } from './types';
type DrawingAnnotationOverlayContextType = {
  selectedStylus: StylusOption;
  strokeColor: string;
  strokeWidth: number;
  enable: boolean;

  handleStrokeColorChange: (color: string) => void;
  handleStrokeWidthChange: (color: number) => void;
  handleStylusChange: (value: StylusOption) => void;
};
export const DrawingAnnotationOverlayContext =
  React.createContext<DrawingAnnotationOverlayContextType>({
    selectedStylus: 'select',
    strokeColor: '#000000',
    strokeWidth: 1,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleStrokeColorChange: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleStrokeWidthChange: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleStylusChange: () => {},
    enable: false,
  });
