import { useEffect, useRef, useState, useCallback } from 'react';
import { getSettings } from '~/chrome-extension/utils/chrome';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getPageCaptureData, addWebclipDocument } from '../utils/document';
import { CropArea } from './CropArea';
import { Header } from './Header';
import { sliceImage } from './utils';

const queryClient = new QueryClient();

const useClasses = makeStyles({
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  content: {
    width: '100vw',
    height: 'calc(100vh - 40px)',
    overflow: 'scroll',
  },
  scene: {
    margin: '20px 20px',
    position: 'relative',
  },
});

export const App = () => {
  const classes = useClasses();
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  const [data, setData] = useState<{
    screenshot: string;
    dimension: {
      width: number;
      height: number;
    };
    url: string;
    title?: string;
  } | null>(null);
  const [cropRect, setCropRect] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    getPageCaptureData().then(async (result) => {
      const images = result.screenshotData as string[];
      const screenDimension = result.screenDimension as {
        width: number;
        height: number;
      };
      const targetRects = result.targetRects as {
        width: number;
        height: number;
        top: number;
        left: number;
      }[];
      console.log('page data', images, targetRects);
      if (images && images.length > 0) {
        // Calculate total height of the final image
        const width = screenDimension.width * targetRects[0].width;
        const height = targetRects.reduce((acc, rect) => {
          return acc + rect.height * screenDimension.height;
        }, 0);
        if (hiddenCanvasRef.current) {
          hiddenCanvasRef.current.width = width;
          hiddenCanvasRef.current.height = height;
          const hiddenCtx = hiddenCanvasRef.current.getContext('2d');
          if (hiddenCtx) {
            let offsetY = 0;
            for (let i = 0; i < images.length; i++) {
              const imgElement: HTMLImageElement = await new Promise(
                (resolve) => {
                  const img = new Image();
                  img.src = images[i];
                  img.onload = () => {
                    resolve(img);
                  };
                }
              );
              const srcLeft = imgElement.width * targetRects[i].left;
              const srcTop = imgElement.height * targetRects[i].top;
              const srcWidth = imgElement.width * targetRects[i].width;
              const srcHeight = imgElement.height * targetRects[i].height;

              const width = screenDimension.width * targetRects[i].width;
              const height = screenDimension.height * targetRects[i].height;
              hiddenCtx.drawImage(
                imgElement,
                srcLeft,
                srcTop,
                srcWidth,
                srcHeight,
                0,
                offsetY,
                width,
                height
              );
              offsetY += height;
            }
            const imageDataUrl = hiddenCanvasRef.current.toDataURL();
            setData({
              screenshot: imageDataUrl,
              dimension: {
                width,
                height,
              },
              url: result.url,
              title: result.title,
            });
            setCropRect({
              left: 0,
              top: 0,
              width: width,
              height: height,
            });
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (data && canvasRef.current) {
      const img = document.createElement('img');
      img.src = data.screenshot;
      img.onload = () => {
        if (canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              0,
              0,
              img.width,
              img.height
            );
          }
          setCropRect({
            left: 0,
            top: 0,
            width: img.width,
            height: img.height,
          });
        }
      };
    }
  }, [data]);

  const onCrop = useCallback(() => {
    // Create an <img> element
    if (data) {
      const img = document.createElement('img');
      img.src = data.screenshot;
      img.onload = () => {
        if (canvasRef.current) {
          canvasRef.current.width = cropRect.width;
          canvasRef.current.height = cropRect.height;
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              img,
              cropRect.left,
              cropRect.top,
              cropRect.width,
              cropRect.height,
              0,
              0,
              cropRect.width,
              cropRect.height
            );
            const croppedImage = canvasRef.current.toDataURL();
            setData({
              ...data,
              screenshot: croppedImage,
              dimension: {
                width: cropRect.width,
                height: cropRect.height,
              },
            });
          }
        }
      };
    }
  }, [cropRect, data]);

  const onSave = useCallback(
    async (spaceKey: string, documentPath: string) => {
      if (data) {
        const settings = await getSettings();
        const slices = await sliceImage(data.screenshot, data.dimension);

        addWebclipDocument(
          settings,
          spaceKey,
          documentPath,
          {
            slices: slices,
            meta: {
              width: data.dimension.width,
              height: data.dimension.height,
            },
          },
          data.url
        ).then(() => {
          alert(t('clip_action_success'));
        });
      }
    },
    [data, t]
  );

  return (
    <FluentProvider theme={webLightTheme}>
      <QueryClientProvider client={queryClient}>
        <div className={classes.root}>
          <Header
            onCrop={onCrop}
            onSave={onSave}
            data={{ url: data?.url, title: data?.title }}
          />
          <div className={classes.content}>
            {!data ? (
              <canvas id="hidden-canvas" ref={hiddenCanvasRef} />
            ) : (
              <div
                className={classes.scene}
                style={{
                  width: `${data.dimension.width}px`,
                  height: `${data.dimension.height}px`,
                }}
              >
                <canvas ref={canvasRef} />
                <CropArea
                  fullWidth={data.dimension.width}
                  fullHeight={data.dimension.height}
                  rect={cropRect}
                  onUpdate={(rect) => {
                    setCropRect(rect);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </QueryClientProvider>
    </FluentProvider>
  );
};
