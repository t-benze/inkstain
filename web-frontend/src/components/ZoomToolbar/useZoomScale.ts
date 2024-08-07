import * as React from 'react';

const scales = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
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

  return {
    setScale,
    scale,
    handleZoomIn,
    handleZoomOut,
    handleZoomFitHeight,
    handleZoomFitWidth,
  };
};
