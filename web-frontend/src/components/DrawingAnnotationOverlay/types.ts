export type StylusOption = 'select' | 'line' | 'rect' | 'ellipse';

export interface ToolbarProps {
  stylus: StylusOption;
  onStylusChange: (value: StylusOption) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}
