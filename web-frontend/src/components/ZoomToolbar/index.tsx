import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import { useTranslation } from 'react-i18next';
import {
  AutoFitHeightRegular,
  AutoFitWidthRegular,
  ZoomInRegular,
  ZoomOutRegular,
} from '@fluentui/react-icons';
export interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFitWidth: () => void;
  onZoomFitHeight: () => void;
}
export const ZoomToolbar = ({
  onZoomIn,
  onZoomOut,
  onZoomFitWidth,
  onZoomFitHeight,
}: ToolbarProps) => {
  const { t } = useTranslation();
  return (
    <>
      <ToolbarButtonWithTooltip
        content={t('zoom_in')}
        dataTest="toolbar-zoomInBtn"
        icon={<ZoomInRegular />}
        onClick={onZoomIn}
      />
      <ToolbarButtonWithTooltip
        content={t('zoom_out')}
        dataTest="toolbar-zoomOutBtn"
        icon={<ZoomOutRegular />}
        onClick={onZoomOut}
      />
      <ToolbarButtonWithTooltip
        content={t('zoom_fit_width')}
        dataTest="toolbar-fitWidthBtn"
        icon={<AutoFitWidthRegular />}
        onClick={onZoomFitWidth}
      />
      <ToolbarButtonWithTooltip
        content={t('zoom_fit_height')}
        dataTest="toolbar-fitHeightBtn"
        icon={<AutoFitHeightRegular />}
        onClick={onZoomFitHeight}
      />
    </>
  );
};

export { useZoomScale } from './useZoomScale';
