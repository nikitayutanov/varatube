import { buttonStyles } from '@gear-js/ui';
import clsx from 'clsx';
import { useSubscriptions } from 'hooks';
import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

function Home() {
  const { subscriptionsState } = useSubscriptions();
  console.log(subscriptionsState);

  return (
    <>
      <Link
        to="subscription"
        className={clsx(buttonStyles.button, buttonStyles.large, buttonStyles.primary, styles.link)}>
        My Subscription
      </Link>
      <Link to="videos" className={clsx(buttonStyles.button, buttonStyles.large, buttonStyles.secondary)}>
        Videos
      </Link>
    </>
  );
}

export { Home };
