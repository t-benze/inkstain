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

interface SettingsDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const SettingsDialog: React.FunctionComponent<SettingsDialogProps> = ({
  isOpen,
  onDismiss,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogTrigger>
        <Button appearance="primary">Open Settings</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>{/* Settings content goes here */}</DialogContent>
        <DialogActions>
          <Button onClick={onDismiss}>Save</Button>
          <Button onClick={onDismiss}>Cancel</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default SettingsDialog;
