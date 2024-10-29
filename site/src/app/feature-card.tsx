import {
  tokens,
  LargeTitle,
  Image,
  makeStyles,
} from '@fluentui/react-components';

interface FeatureCardProps {
  description: string;
  image: string;
}

const useClasses = makeStyles({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '& > img': {
      boxShadow: tokens.shadow4,
    },
  },
});

export function FeatureCard({ description, image }: FeatureCardProps) {
  const classes = useClasses();
  return (
    <div className={classes.root}>
      <LargeTitle>{description}</LargeTitle>
      <Image src={image} alt={description} width={1000} height={540} />
    </div>
  );
}
