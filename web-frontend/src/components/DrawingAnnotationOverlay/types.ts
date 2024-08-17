export type StylusOption = 'select' | 'line' | 'rect' | 'ellipse' | 'pen';

export interface ToolbarProps {
  stylus: StylusOption;
  onStylusChange: (value: StylusOption) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export type InteractionMode =
  | 'drawing'
  | 'resizingHead'
  | 'resizingTail'
  | 'resizingNorth'
  | 'resizingEast'
  | 'resizingSouth'
  | 'resizingWest'
  | 'resizingNorthEast'
  | 'resizingSouthEast'
  | 'resizingSouthWest'
  | 'resizingNorthWest'
  | 'moving';
