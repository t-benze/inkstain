import { makeStyles } from '@fluentui/react-components';

export const useClasses = makeStyles({
  input: {
    minWidth: '600px',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    '& > .fui-Label': {
      minWidth: '100px',
    },
  },
});
