'use client';

import * as React from 'react';
import Image from 'next/image';
import { Title1, makeStyles, tokens } from '@fluentui/react-components';

const useClasses = makeStyles({
  root: {
    backgroundImage: 'url(/images/background.png)',
    backgroundRepeat: 'repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64px',
    width: '100%',
    borderBottom: '1px solid #e0e0e0',
    top: 0,
    position: 'sticky',
    boxShadow: tokens.shadow8,
  },

  content: {
    minWidth: '1200px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',

    '& > .fui-Title1': {
      marginLeft: tokens.spacingHorizontalM,
    },

    '& .spacer': {
      flexGrow: 1,
    },
  },
});

export const Header = () => {
  const classes = useClasses();
  return (
    <header className={classes.root}>
      <div className={classes.content}>
        <Image
          src="/images/logo-128.png"
          alt="Inkstain"
          width={48}
          height={48}
        />
        <Title1>Inkstain</Title1>
        <div className={'spacer'} />
        <a
          href="https://github.com/t-benze/inkstain"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/images/github-mark/github-mark.svg"
            alt="GitHub"
            width={24}
            height={24}
          />
        </a>
      </div>
    </header>
  );
};
