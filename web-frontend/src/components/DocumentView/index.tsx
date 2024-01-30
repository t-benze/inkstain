import { SpaceManagementView } from './SpaceManagementView';
interface DocumentViewProps {
  type: string;
  name: string;
}

export const DocumentView = ({ type, name }: DocumentViewProps) => {
  if (type.startsWith('@inkstain/')) {
    const inkstainType = type.replace('@inkstain/', '');
    switch (inkstainType) {
      case 'space-management':
        return <SpaceManagementView />;
      default:
        return <div>Unknown InkStain Document Type</div>;
    }
  }
  return <div>standard documents</div>;
};
