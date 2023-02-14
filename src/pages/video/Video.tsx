import { Heading } from 'components';
import src from 'assets/images/placeholder.png';
import styles from './Video.module.scss';

const heading = 'Heading';
const description =
  'some random description using random words, some random description using random words, some random description using random words, some random description using random words';

function Video() {
  return (
    <div className={styles.wrapper}>
      <Heading text={heading} />

      <img src={src} alt="" />
      <p>{description}</p>
    </div>
  );
}

export { Video };
