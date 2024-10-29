'use client';
import {
  Title1,
  Title3,
  Caption1Strong,
  makeStyles,
  Image,
  tokens,
  Card,
  CardHeader,
  CardHeaderSlots,
} from '@fluentui/react-components';
import {
  DesktopMacRegular,
  DocumentTableSearchRegular,
  TextEffectsSparkleRegular,
} from '@fluentui/react-icons';
import { FeatureCard } from './feature-card';

const useClasses = makeStyles({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '& > section': {
      width: '1200px',
      marginBottom: tokens.spacingVerticalXXL,
    },
  },
  heroSection: {
    paddingTop: tokens.spacingVerticalXXL,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& .fui-Title1': {
      textAlign: 'center',
      width: '100%',
      display: 'block',
    },
    '& .fui-Image': {
      marginTop: tokens.spacingVerticalXL,
      boxShadow: tokens.shadow4,
    },
  },
  sellingPoints: {
    marginTop: tokens.spacingVerticalXXL,
    display: 'flex',
    gap: tokens.spacingHorizontalXXL,
  },
  sellingPointCard: {
    width: '300px',
    '& .fui-CardHeader__image': {
      fontSize: '32px',
    },
  },
});

interface SellingPointProps {
  title: string;
  description: string;
  icon: CardHeaderSlots['image'];
}
const SellingPoint = ({ title, description, icon }: SellingPointProps) => {
  const classes = useClasses();
  return (
    <Card className={classes.sellingPointCard} orientation="vertical">
      <CardHeader header={<Title3>{title}</Title3>} image={icon}></CardHeader>
      <Caption1Strong>{description}</Caption1Strong>
    </Card>
  );
};
const HeroSection = () => {
  const classes = useClasses();
  return (
    <section className={classes.heroSection}>
      <Title1>
        A document management tool that keeps your documents retrievable and
        enhances your reading experience.
      </Title1>
      <Image
        src="/images/main-intro.png"
        alt="main introcution"
        width={1000}
        height={540}
      />
      <div className={classes.sellingPoints}>
        <SellingPoint
          title="Local First"
          description="Inkstain stores your document locally as normal files."
          icon={<DesktopMacRegular />}
        />
        <SellingPoint
          title="Retrievable"
          description="Inkstain indexes your documents using meta data to make them searchable."
          icon={<DocumentTableSearchRegular />}
        />
        <SellingPoint
          title="Intelligent"
          description="Inkstain utilizes AI to help you understand your documents."
          icon={<TextEffectsSparkleRegular />}
        />
      </div>
    </section>
  );
};
export default function Index() {
  const classes = useClasses();
  return (
    <main className={classes.root}>
      <HeroSection />
      <section>
        <FeatureCard
          description="Filter documents by tags and attributes"
          image="/images/features/filter-documents.png"
        />
      </section>
      <section>
        <FeatureCard
          description="Add annotations while reading"
          image="/images/features/document-annotations.png"
        />
      </section>
      <section>
        <FeatureCard
          description="Extract text with OCR"
          image="/images/features/document-ocr.png"
        />
      </section>
      <section>
        <FeatureCard
          description="Download documents to your inkstain space"
          image="/images/features/download-document.png"
        />
      </section>
      <section>
        <FeatureCard
          description="Clip a web page"
          image="/images/features/webclip.png"
        />
      </section>
    </main>
  );
}
