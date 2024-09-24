import * as React from 'react';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';
import { documentsApi } from '~/web/apiClient';
import { DocumentViewProps } from '~/web/types';
import { ContentView } from './ContentView';
import { WebclipToolbar } from './Toolbar';
import { useZoomScale } from '~/web/components/ZoomToolbar';
import { useStylus } from '~/web/components/DrawingAnnotationOverlay/hooks/useStylus';
import { DrawingAnnotationOverlayContext } from '../DrawingAnnotationOverlay';

const useClasses = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground4,
  },
  scene: {
    width: '100%',
    height: '0px',
    display: 'flex',
    flexGrow: 1,
    overflow: 'scroll scroll',
  },
});

export function WebclipView({ documentPath, spaceKey }: DocumentViewProps) {
  const [imageDataUrl, setImageDataUrl] = React.useState<string | null>(null);
  const classes = useClasses();
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const [sceneDimension, setSceneDimension] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [imageDimension, setImageDimension] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  React.useEffect(() => {
    documentsApi
      .getDocumentContent({
        spaceKey,
        path: documentPath,
      })
      .then((response) => response.text())
      .then((response) => {
        const webclipData = JSON.parse(response) as {
          imageData: string;
          dimension: { width: number; height: number };
        };
        setImageDataUrl(webclipData.imageData);
        setImageDimension(webclipData.dimension);

        // reader.onloadend = () => {
        //   console.log('reader.result', reader.result);
        //   setImageDataUrl(reader.result as string);
        // };
        // reader.readAsDataURL(response);
      });
  }, [documentPath, spaceKey]);

  // const handleImageLoaded = React.useCallback((image: HTMLImageElement) => {
  //   const { naturalWidth, naturalHeight } = image;
  //   setImageDimension({
  //     width: naturalWidth,
  //     height: naturalHeight,
  //   });
  // }, []);

  React.useLayoutEffect(() => {
    if (sceneRef.current) {
      setSceneDimension({
        width: sceneRef.current.clientWidth,
        height: sceneRef.current.clientHeight,
      });
    }
    const windowResizeHandler = () => {
      if (sceneRef.current) {
        setSceneDimension({
          width: sceneRef.current.clientWidth,
          height: sceneRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', windowResizeHandler);
    return () => {
      window.removeEventListener('resize', windowResizeHandler);
    };
  }, [sceneRef]);

  const {
    scale,
    handleZoomIn,
    handleZoomOut,
    handleZoomFitHeight,
    handleZoomFitWidth,
    handleZoomGesture,
  } = useZoomScale(sceneDimension, imageDimension);
  const {
    strokeColor,
    strokeWidth,
    stylus,
    handleStrokeColorChange,
    handleStrokeWidthChange,
    handleStylusChange,
  } = useStylus();

  return (
    <DrawingAnnotationOverlayContext.Provider
      value={{
        selectedStylus: stylus,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        enable: true,
        handleStrokeColorChange,
        handleStrokeWidthChange,
        handleStylusChange,
      }}
    >
      <div className={classes.root}>
        <WebclipToolbar
          onZoomFitWidth={handleZoomFitWidth}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFitHeight={handleZoomFitHeight}
        />
        <div
          className={classes.scene}
          ref={sceneRef}
          onWheel={handleZoomGesture}
        >
          {imageDataUrl && sceneDimension ? (
            <ContentView
              spaceKey={spaceKey}
              documentPath={documentPath}
              scale={scale}
              dimension={
                imageDimension
                  ? {
                      width: imageDimension.width * scale,
                      height: imageDimension.height * scale,
                    }
                  : null
              }
              imageDataUrl={imageDataUrl}
              // onImageLoad={handleImageLoaded}
            />
          ) : (
            <Spinner />
          )}
        </div>
      </div>
    </DrawingAnnotationOverlayContext.Provider>
  );
}
