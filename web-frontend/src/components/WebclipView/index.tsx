import * as React from 'react';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';
import { extractWebclipData } from '@inkstain/webclip';
import { documentsApi } from '~/web/apiClient';

import { DocumentViewProps } from '~/web/types';
import { ContentView } from './ContentView';
import { WebclipToolbar } from './Toolbar';
import { useZoomScale } from '~/web/components/ZoomToolbar';
import { useStylus } from '~/web/components/DrawingAnnotationOverlay/hooks/useStylus';
import { DrawingAnnotationOverlayContext } from '~/web/components/DrawingAnnotationOverlay';
import { ChatOverlay, useChatOverlay } from '~/web/components/DocumentChatView';
import {
  useDocumentTextOverlay,
  DocumentTextViewOverlay,
} from '~/web/components/DocumentTextView';

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
    height: 'calc(100% - 32px)',
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
  textOverlayMask: {
    position: 'absolute',
    top: `32px`,
    left: 0,
    width: '20%',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: 0,
    top: '32px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

export function WebclipView({ documentPath, spaceKey }: DocumentViewProps) {
  const [imageData, setImageData] = React.useState<Array<{
    imageDataUrl: string;
    width: number;
    height: number;
  }> | null>(null);
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
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        const { slices, width, height } = extractWebclipData(arrayBuffer);
        setImageData(slices);
        setImageDimension({
          width,
          height,
        });
      });
  }, [documentPath, spaceKey]);

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

  const { showChat, openChatOverlay, closeChatOverlay, chatQuote } =
    useChatOverlay();
  const { showTextOverlay, openTextOverlay, initBlockId, closeTextOverlay } =
    useDocumentTextOverlay();

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
          onShowChatOverlayChange={openChatOverlay}
          onShowTextView={openTextOverlay}
        />
        <div
          className={classes.scene}
          ref={sceneRef}
          onWheel={handleZoomGesture}
        >
          {imageData && sceneDimension ? (
            <ContentView
              spaceKey={spaceKey}
              documentPath={documentPath}
              scale={scale}
              dimension={imageDimension}
              imageData={imageData}
              onTextBlockSelected={openTextOverlay}
            />
          ) : (
            <Spinner />
          )}
        </div>
        <DocumentTextViewOverlay
          show={showTextOverlay}
          initBlockId={initBlockId}
          openChatView={openChatOverlay}
          closeTextOverlay={closeTextOverlay}
        />

        <ChatOverlay
          show={showChat}
          closeChatOverlay={closeChatOverlay}
          chatQuote={chatQuote}
        />
      </div>
    </DrawingAnnotationOverlayContext.Provider>
  );
}
