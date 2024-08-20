import * as React from 'react';

export const useZoomScale = (
  sceneDimension: { width: number; height: number } | null,
  contentDimension: { width: number; height: number } | null
) => {
  const [scale, setScale] = React.useState(1);
  const handleZoomIn = React.useCallback(() => {
    setScale((prevScale) => Math.min(prevScale * 1.1, 2.5));
  }, []);
  const handleZoomOut = React.useCallback(() => {
    setScale((prevScale) => Math.max(prevScale / 1.1, 0.1));
  }, []);
  const handleZoomFitWidth = React.useCallback(() => {
    if (!contentDimension || !sceneDimension) {
      return;
    }
    const targetScale = sceneDimension.width / contentDimension.width;
    setScale(targetScale);
  }, [sceneDimension, contentDimension]);

  const handleZoomFitHeight = React.useCallback(() => {
    if (!contentDimension || !sceneDimension) {
      return;
    }
    const targetScale = sceneDimension.height / contentDimension.height;
    setScale(targetScale);
  }, [sceneDimension, contentDimension]);

  const handleZoomGesture = React.useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    console.log(e.deltaX, e.deltaY);
    if (e.deltaY > 0) {
      setScale((prevScale) => Math.max(prevScale / 1.1, 0.1));
    } else {
      setScale((prevScale) => Math.min(prevScale * 1.1, 2.5));
    }
  }, []);

  return {
    setScale,
    scale,
    handleZoomIn,
    handleZoomOut,
    handleZoomFitHeight,
    handleZoomFitWidth,
    handleZoomGesture,
  };
};
