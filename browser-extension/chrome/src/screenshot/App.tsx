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
  hiddenCanvas: {
    visibility: 'hidden',
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
      const targetRects = result.targetRects as {
        width: number;
        height: number;
        top: number;
        left: number;
      }[];
      if (images && images.length > 0) {
        const imgElements: HTMLImageElement[] = images.map((url) => {
          const img = new Image();
          img.src = url;
          return img;
        });
        await Promise.all(
          imgElements.map(
            (img) =>
              new Promise((resolve) => {
                img.onload = () => resolve(img);
              })
          )
        );
        // Calculate total height of the final image
        const width = imgElements[0].width * targetRects[0].width;
        let height = 0;
        for (let i = 0; i < targetRects.length; i++) {
          height += imgElements[i].height * targetRects[i].height;
        }
        if (hiddenCanvasRef.current) {
          hiddenCanvasRef.current.width = width;
          hiddenCanvasRef.current.height = height;
          const ctx = hiddenCanvasRef.current.getContext('2d');
          if (ctx) {
            let offsetY = 0;
            for (let i = 0; i < targetRects.length; i++) {
              const left = imgElements[i].width * targetRects[i].left;
              const top = imgElements[i].height * targetRects[i].top;
              const width = imgElements[i].width * targetRects[i].width;
              const height = imgElements[i].height * targetRects[i].height;
              ctx.drawImage(
                imgElements[i],
                left,
                top,
                width,
                height,
                0,
                offsetY,
                width,
                height
              );
              offsetY += height;
            }
            setData({
              screenshot: hiddenCanvasRef.current.toDataURL(),
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
        addWebclipDocument(
          settings,
          spaceKey,
          documentPath,
          {
            imageData: data.screenshot,
            dimension: data.dimension,
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
            {!data && (
              <canvas ref={hiddenCanvasRef} className={classes.hiddenCanvas} />
            )}
            {data ? (
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
            ) : null}
          </div>
        </div>
      </QueryClientProvider>
    </FluentProvider>
  );
};
