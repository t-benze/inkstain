import {
  TreeOpenChangeEvent,
  TreeOpenChangeData,
  TreeItemValue,
} from '@fluentui/react-components';

export type OnOpenChange = (
  event: TreeOpenChangeEvent,
  data: TreeOpenChangeData
) => void;

export type OnTreeItemClicked = (data: {
  event: React.MouseEvent;
  value: TreeItemValue;
  itemType: 'branch' | 'leaf';
}) => void;

export type Select = {
  value: string;
  itemType: string;
};
