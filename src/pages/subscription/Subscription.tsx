import { useAccount } from '@gear-js/react-hooks';
import { Button } from '@gear-js/ui';
import { Heading, Loader } from 'components';
import { useSubscriptions, useSubscriptionsMessage } from 'hooks';
import styles from './Subscription.module.scss';

function Subscription() {
  const { account } = useAccount();
  const { decodedAddress } = account || {};

  const { subscriptionsState, isSubscriptionsStateRead } = useSubscriptions();
  const subscription = subscriptionsState && decodedAddress ? subscriptionsState[decodedAddress] : undefined;

  const { withRenewal, subscriptionStart, period, renewalDate } = subscription || {};
  const [startTimestamp] = subscriptionStart || [];
  const [renewTimestamp] = renewalDate || [];

  const startDate = startTimestamp ? new Date(startTimestamp).toLocaleString() : '';
  const renewDate = renewTimestamp ? new Date(renewTimestamp).toLocaleString() : '';

  const sendMessage = useSubscriptionsMessage();

  const cancelSubscription = () => sendMessage({ CancelSubscription: { subscriber: decodedAddress } });

  return isSubscriptionsStateRead ? (
    <>
      <Heading text="My Subscription" />

      <div className={styles.main}>
        {subscription ? (
          <>
            <ul className={styles.list}>
              <li>
                Start Date: <span className={styles.value}>{startDate}</span>
              </li>

              {renewDate && (
                <li>
                  Renewal Date: <span className={styles.value}>{renewDate}</span>
                </li>
              )}

              <li>
                Period: <span className={styles.value}>{period}</span>
              </li>
            </ul>

            <Button text="Cancel subscription" color="light" onClick={cancelSubscription} />
          </>
        ) : (
          <>
            <p>You don&apos;t have an active subscription</p>
            <Button text="Subscribe" />
          </>
        )}
      </div>
    </>
  ) : (
    <Loader />
  );
}

export { Subscription };
