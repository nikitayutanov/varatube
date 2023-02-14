import { Heading } from 'components';
import { Link } from 'react-router-dom';
import { ADDRESS } from 'consts';
import styles from './Videos.module.scss';

const name = 'Random Name';

const description =
  'some random description using random words, some random description using random words, some random description using random words, some random description using random words';

const CIDs = [
  'QmWxkTjf1tX1wfCaocBH2XMDpLSF3Tw8PEzKxn4xxsGjCx',
  'QmeUgZ8b4RD2DsrEi756YwfbRynyPXZyKEJk2pw8ZHATn3',
  'QmZutgsmUSLUDY6LhEuQFEFAW9AoJ2zmUgQMsxndHNSYRf',
  'QmQKboWyCaqct3PXPDhpvsKCvse1eqRacpErkq6BoFBiiB',
  'QmXqJZEZ55UYZBY9Bf67a614DK47xiNakbuEP5XbXFyB4r',
  'QmbYBTHBTLX8mmAFhhvkdXUt4ZtfwZFPQeJFMFhADoc9Lw',
  'QmPMo6bEMuLHGU2qvDbJuxHJS2UaDeuZbehshC5BDEvMjW',
  'QmP7EUM7AbA1Cshox9EqJ8Ux21C3XJTU4owaUF79KQiRDV',
];

function Videos() {
  const isAnyVideo = CIDs.length > 0;

  const getVideos = () =>
    CIDs.map((cid) => (
      <li key={cid}>
        <Link to={`/video/${cid}`} className={styles.video}>
          <h3 className={styles.heading}>{name}</h3>

          <div className={styles.videoWrapper}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video>
              <source src={`${ADDRESS.IPFS_GATEWAY}${cid}`} type="video/mp4" />
            </video>
          </div>

          <p className={styles.description}>{description}</p>
        </Link>
      </li>
    ));

  return (
    <>
      <Heading text="Videos" />

      {isAnyVideo ? (
        <ul className={styles.videos}>{getVideos()}</ul>
      ) : (
        <p>There aren&apos;t any videos at the moment.</p>
      )}
    </>
  );
}

export { Videos };
