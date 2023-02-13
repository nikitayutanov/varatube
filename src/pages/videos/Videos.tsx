import { Link } from 'react-router-dom';
import src from './placeholder.png';
import styles from './Videos.module.scss';

const videos = [
  { id: 0, name: 'First video' },
  { id: 1, name: 'First video' },
  { id: 2, name: 'First video' },
  { id: 3, name: 'First video' },
  { id: 4, name: 'First video' },
  { id: 5, name: 'First video' },
  { id: 6, name: 'First video' },
  { id: 7, name: 'First video' },
  { id: 8, name: 'First video' },
  { id: 9, name: 'First video' },
  { id: 10, name: 'First video' },
  { id: 11, name: 'First video' },
  { id: 12, name: 'First video' },
  { id: 13, name: 'First video' },
  { id: 14, name: 'First video' },
  { id: 15, name: 'First video' },
];

function Videos() {
  const isAnyVideo = videos.length > 0;

  const getVideos = () =>
    videos.map(({ id, name }) => (
      <li key={id}>
        <Link to="/" className={styles.video}>
          <h3 className={styles.heading}>{name}</h3>
          <img src={src} alt="" />
        </Link>
      </li>
    ));

  return isAnyVideo ? (
    <ul className={styles.videos}>{getVideos()}</ul>
  ) : (
    <p>There aren&apos;t any videos at the moment.</p>
  );
}

export { Videos };
