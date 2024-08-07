import { Tooltip, ToolbarButton } from '@fluentui/react-components';

export const ToolbarButtonWithTooltip = ({
  content,
  icon,
  dataTest,
  onClick,
  disabled,
}: {
  content: string;
  dataTest: string;
  icon: JSX.Element;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Tooltip content={content} relationship="description" positioning={'below'}>
      <ToolbarButton
        disabled={disabled}
        data-test={dataTest}
        icon={icon}
        onClick={onClick}
      />
    </Tooltip>
  );
};
