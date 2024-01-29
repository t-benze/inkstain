import * as React from 'react';
import {
  useId,
  Toast,
  ToastBody,
  ToastTitle,
  ToastFooter,
  Button,
  Toaster,
  useToastController,
} from '@fluentui/react-components';

const MainPage: React.FunctionComponent = () => {
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);
  const notify = () =>
    dispatchToast(
      <Toast>
        <ToastTitle action={<Button>Undo</Button>}>Email sent</ToastTitle>
        <ToastBody subtitle="Subtitle">This is a toast body</ToastBody>
        <ToastFooter>
          <Button>Action</Button>
          <Button>Action</Button>
        </ToastFooter>
      </Toast>,
      { intent: 'success' }
    );

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Button onClick={notify}>Make toast</Button>
    </>
  );
  // return (
  //   <div>
  //     {/* Include Primary Sidebar, Tab list, and Secondary Sidebar here */}
  //   </div>
  // );
};

export default MainPage;
