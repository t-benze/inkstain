import * as React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@fluentui/react-components';

interface SpaceManagementDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const SpaceManagementDialog: React.FunctionComponent<
  SpaceManagementDialogProps
> = ({ isOpen, onDismiss }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogTrigger>
        <Button appearance="primary">Manage Spaces</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle>Manage Spaces</DialogTitle>
        <DialogContent>
          {/* Include 'Spaces' List and Create 'Space' Button here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={onDismiss}>Close</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default SpaceManagementDialog;
