import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  ImageUrl: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'DECOY Community',
    ImageUrl: 'img/fleet.png',
    description: (
      <>
        How to integrate with DECOY and get the most from the opportunities around us
      </>
    ),
  },
  {
    title: 'Doctrine Information',
    ImageUrl: 'https://images.evetech.net/types/20454/icon',
    description: (
      <>
        Information on the doctrines with both DECOY and Phoenix Coalition
      </>
    ),
  },
  {
    title: 'Getting Rich',
    ImageUrl: 'https://images.evetech.net/types/10244/icon',
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </>
    ),
  },
];

function Feature({ title, ImageUrl, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={ImageUrl} alt={title} className={styles.featureImage} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
