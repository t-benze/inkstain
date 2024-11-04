import * as React from 'react';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';
import { documentsApi } from '~/web/apiClient';
import { DocumentViewProps } from '~/web/types';
import { ContentView } from './ContentView';
import { WebclipToolbar } from './Toolbar';
import { useZoomScale } from '~/web/components/ZoomToolbar';
import { useStylus } from '~/web/components/DrawingAnnotationOverlay/hooks/useStylus';
import { DrawingAnnotationOverlayContext } from '~/web/components/DrawingAnnotationOverlay';
import { ChatView } from '~/web/components/DocumentChatView';

const useClasses = makeStyles({
  root: {
    position: 'relative',
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

  chatOverlayMask: {
    position: 'absolute',
    top: `32px`,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  chatOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: `20%`,
    backgroundColor: tokens.colorNeutralBackground1,
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

  const [showChatOverlay, setShowChatOverlay] = React.useState(false);

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
          showChatOverlay={showChatOverlay}
          onShowChatOverlayChange={(show) => setShowChatOverlay(show)}
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
            />
          ) : (
            <Spinner />
          )}
        </div>
        {showChatOverlay && (
          <>
            <div
              className={classes.chatOverlayMask}
              onClick={() => {
                setShowChatOverlay(false);
              }}
            ></div>
            <div className={classes.chatOverlay}>
              <ChatView spaceKey={spaceKey} documentPath={documentPath} />
            </div>
          </>
        )}
      </div>
    </DrawingAnnotationOverlayContext.Provider>
  );
}
