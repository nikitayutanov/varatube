import { Heading } from 'components';
import { useParams } from 'react-router-dom';
import { ADDRESS } from 'consts';
import styles from './Video.module.scss';

const heading = 'Random Name';

const description =
  'some random description using random words, some random description using random words, some random description using random words, some random description using random words';

function Video() {
  const { cid } = useParams();

  return (
    <div className={styles.wrapper}>
      <Heading text={heading} />

      <div className={styles.videoWrapper}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video controls>
          <source src={`${ADDRESS.IPFS_GATEWAY}${cid}`} type="video/mp4" />
        </video>
      </div>

      <p>{description}</p>
    </div>
  );
}

export { Video };
