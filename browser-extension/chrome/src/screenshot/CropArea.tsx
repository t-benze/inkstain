import * as React from 'react';

const RESIZE_HANDLE_SIZE = 10;

type InteractionMode =
  | 'move'
  | 'resize-nw'
  | 'resize-ne'
  | 'resize-se'
  | 'resize-sw'
  | 'resize-n '
  | 'resize- e'
  | 'resize-s '
  | 'resize- w';

export const CropArea = ({
  rect,
  onUpdate,
  fullWidth,
  fullHeight,
}: {
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  onUpdate: (rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  }) => void;
  fullWidth: number;
  fullHeight: number;
}) => {
  const interactionModeRef = React.useRef<InteractionMode | null>(null);
  const startPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    const handle = (e.target as HTMLElement).getAttribute(
      'data-handle'
    ) as InteractionMode;
    if (handle) {
      interactionModeRef.current = handle;
      startPointRef.current = { x: e.clientX, y: e.clientY };
    }
  };
  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    if (
      !startPointRef.current ||
      !interactionModeRef.current ||
      !containerRef.current
    )
      return;
    const delta = {
      x: e.clientX - startPointRef.current.x,
      y: e.clientY - startPointRef.current.y,
    };
    switch (interactionModeRef.current) {
      case 'move': {
        const newTop = Math.min(
          Math.max(0, rect.top + delta.y),
          fullHeight - rect.height
        );
        const newLeft = Math.min(
          Math.max(0, rect.left + delta.x),
          fullWidth - rect.width
        );
        containerRef.current.style.top = `${newTop}px`;
        containerRef.current.style.left = `${newLeft}px`;
        break;
      }
      case 'resize-nw':
      case 'resize-se':
      case 'resize-sw':
      case 'resize-ne':
      case 'resize-n ':
      case 'resize- e':
      case 'resize-s ':
      case 'resize- w': {
        const handle = interactionModeRef.current.split('-')[1];
        const deltaHeight =
          handle[0] === 'n' ? -delta.y : handle[0] === 's' ? delta.y : 0;
        const deltaWidth =
          handle[1] === 'w' ? -delta.x : handle[1] === 'e' ? delta.x : 0;
        const deltaTop = handle[0] === 'n' ? delta.y : 0;
        const deltaLeft = handle[1] === 'w' ? delta.x : 0;
        const maxHeight =
          handle[0] === 'n'
            ? rect.top + rect.height
            : handle[0] === 's'
            ? fullHeight - rect.top
            : rect.height;
        const maxWidth =
          handle[1] === 'w'
            ? rect.left + rect.width
            : handle[1] === 'e'
            ? fullWidth - rect.left
            : rect.width;

        const newHeight = Math.max(
          Math.min(maxHeight, rect.height + deltaHeight),
          0
        );
        const newWidth = Math.max(
          Math.min(maxWidth, rect.width + deltaWidth),
          0
        );
        const newTop = Math.min(
          Math.max(0, rect.top + deltaTop),
          fullHeight - newHeight
        );
        const newLeft = Math.min(
          Math.max(0, rect.left + deltaLeft),
          fullWidth - newWidth
        );
        containerRef.current.style.height = `${newHeight}px`;
        containerRef.current.style.width = `${newWidth}px`;
        containerRef.current.style.top = `${newTop}px`;
        containerRef.current.style.left = `${newLeft}px`;
        break;
      }
    }
  };
  const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    onUpdate({
      top: parseInt(containerRef.current.style.top.replace('px', '')),
      left: parseInt(containerRef.current.style.left.replace('px', '')),
      width: parseInt(containerRef.current.style.width.replace('px', '')),
      height: parseInt(containerRef.current.style.height.replace('px', '')),
    });
    interactionModeRef.current = null;
    startPointRef.current = null;
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        data-handle="move"
        style={{
          cursor: 'move',
          position: 'absolute',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          border: '1px dashed gray',
        }}
        ref={containerRef}
      >
        {['nw', 'n ', 'ne', ' e', 'se', 's ', 'sw', ' w'].map((handle) => (
          <div
            key={handle}
            data-handle={`resize-${handle}`}
            style={{
              position: 'absolute',
              width: `${RESIZE_HANDLE_SIZE}px`,
              height: `${RESIZE_HANDLE_SIZE}px`,
              borderRadius: '50%',
              background: 'white',
              top: `${
                handle[0] === 'n'
                  ? '-5px'
                  : handle[0] === 's'
                  ? undefined
                  : '50%'
              }`,
              left: `${
                handle[1] === 'w'
                  ? '-5px'
                  : handle[1] === 'e'
                  ? undefined
                  : '50%'
              }`,
              right: `${
                handle[1] === 'e'
                  ? '-5px'
                  : handle[1] === 'w'
                  ? undefined
                  : '50%'
              }`,
              bottom: `${
                handle[0] === 's'
                  ? '-5px'
                  : handle[0] === 'n'
                  ? undefined
                  : '50%'
              }`,
              border: `1px solid gray`,
              cursor: `${handle.trim()}-resize`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};
