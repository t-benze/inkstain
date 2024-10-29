'use client';
import * as React from 'react';
import {
  makeStyles,
  tokens,
  Image,
  Body1,
  Link,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: '100px',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    boxShadow: tokens.shadow8,
  },
  content: {
    minWidth: '1200px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
});

export const Footer = () => {
  const classes = useStyles();
  return (
    <footer className={classes.root}>
      <div className={classes.content}>
        <Image
          src="/images/company-logo-256.png"
          alt="Fast&Good Software"
          width={100}
          height={100}
        />
        <div className={classes.info}>
          <Body1>© 2024 Fast&Good Software. All rights reserved.</Body1>
        </div>
      </div>
    </footer>
  );
};
