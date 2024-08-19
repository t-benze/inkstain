import * as React from 'react';

const scales = [
  0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5,
  3.75, 4, 4.5, 5,
];
export const useZoomScale = (
  sceneDimension: { width: number; height: number } | null,
  contentDimension: { width: number; height: number } | null
) => {
  const [scale, setScale] = React.useState(1);
  const handleZoomIn = React.useCallback(() => {
    setScale(
      (prevScale) =>
        scales.find((s) => s > prevScale) || scales[scales.length - 1]
    );
  }, []);
  const handleZoomOut = React.useCallback(() => {
    setScale(
      (prevScale) =>
        scales
          .slice()
          .reverse()
          .find((s) => s < prevScale) || scales[0]
    );
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
      setScale((prevScale) => Math.min(prevScale * 1.1, 5));
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
