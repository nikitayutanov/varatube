import { Button } from '@gear-js/ui';
import { Heading } from 'components';
import styles from './Subscription.module.scss';

function Subscription() {
  const isActive = false;

  return (
    <>
      <Heading text="My Subscription" />

      <div className={styles.main}>
        {isActive ? (
          <>
            <ul className={styles.list}>
              <li>Start Date: 01.01.2023</li>
              <li>Renewal Date: 01.01.2023</li>
              <li>End Date: 01.03.2023</li>
            </ul>
            <Button text="Cancel subscription" color="light" />
          </>
        ) : (
          <>
            <p>You don&apos;t have an active subscription</p>
            <Button text="Subscribe" />
          </>
        )}
      </div>
    </>
  );
}

export { Subscription };
