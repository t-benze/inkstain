import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { DialogOpenChangeEventHandler } from '@fluentui/react-dialog';
import { useTranslation } from 'react-i18next';
import { ChevronRightRegular } from '@fluentui/react-icons';
import { useQuery } from '@tanstack/react-query';
import { AppContext } from '~/web/app/context';
import { platformApi } from '~/web/apiClient';

const useStyles = makeStyles({
  breadcrumbs: {
    // ...shorthands.marginBlock('0', '0'),
  },
  list: {
    ...shorthands.border(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke3
    ),
  },
});

interface DirectoryPickerDialogProps {
  open: boolean;
  onOpenChange: DialogOpenChangeEventHandler;
  currentDirectory: string;
  onSelectDirectory: (path: string) => void;
  confirmText?: string;
}

export const DirectoryPickerDialog: React.FunctionComponent<
  DirectoryPickerDialogProps
> = ({
  confirmText,
  currentDirectory,
  onSelectDirectory,
  open,
  onOpenChange,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const appContext = React.useContext(AppContext);
  const [currentDirectoryInner, setCurrentDirectoryInner] =
    useState(currentDirectory);
  useEffect(() => {
    setCurrentDirectoryInner(currentDirectory);
  }, [currentDirectory]);

  const { data: directories } = useQuery({
    queryKey: [
      'directory',
      ...currentDirectoryInner.split(appContext.platform.pathSep),
    ],
    queryFn: async () => {
      if (currentDirectoryInner === '') {
        return (appContext.platform.drives ?? []).map((d) => ({
          name: d.replace('\\', ''),
          path: d + appContext.platform.pathSep,
        }));
      }
      return await platformApi.listDirectories({
        path: currentDirectoryInner,
      });
    },
  });

  // Split the current directory into segments for the breadcrumbs
  const directorySegments = currentDirectoryInner
    .split(appContext.platform.pathSep)
    .filter(Boolean)
    .reduce((acc: { name: string; path: string }[], segment) => {
      if (acc.length === 0) {
        return appContext.platform.platform === 'win32'
          ? [
              { name: 'PC', path: '' },
              {
                name: segment,
                path: `${segment}${appContext.platform.pathSep}`,
              },
            ]
          : [{ name: segment, path: '/' + segment }];
      } else {
        return [
          ...acc,
          {
            name: segment,
            path: `${acc[acc.length - 1].path}${
              appContext.platform.pathSep
            }${segment}`,
          },
        ];
      }
    }, []);

  // Create the top part of the dialog for breadcrumbs
  const renderBreadcrumbs = () => (
    <div className={styles.breadcrumbs}>
      {directorySegments.map((segment, index) => (
        <Button
          key={index}
          onClick={() => {
            setCurrentDirectoryInner(segment.path);
          }}
          appearance="subtle"
          iconPosition="after"
          icon={<ChevronRightRegular />}
        >
          {segment.name}
        </Button>
      ))}
    </div>
  );

  return (
    <Dialog data-open={open} open={open} onOpenChange={onOpenChange}>
      <DialogSurface>
        <DialogBody data-test="direcotryPickerDialog">
          <DialogTitle>{t('choose_a_directory')}</DialogTitle>
          <DialogContent>
            {renderBreadcrumbs()}
            <div className={styles.list}>
              {!directories ? (
                <div>{t('loading')}</div>
              ) : (
                <>
                  {directories.map((directory) => (
                    <div key={directory.path}>
                      <Button
                        appearance="subtle"
                        name={directory.name}
                        value={directory.path}
                        onClick={() => setCurrentDirectoryInner(directory.path)}
                      >
                        {directory.name}
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">{t('cancel')}</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button
                data-test="directoryPickerDialog-confirmBtn"
                appearance="primary"
                onClick={() => onSelectDirectory(currentDirectoryInner)}
              >
                {confirmText ?? t('confirm')}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
