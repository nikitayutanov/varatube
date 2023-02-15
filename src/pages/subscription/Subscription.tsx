import { useAccount } from '@gear-js/react-hooks';
import { Button } from '@gear-js/ui';
import { useState } from 'react';
import { Heading, Loader, PurchaseSubscriptionModal } from 'components';
import { useSubscriptions, useSubscriptionsMessage } from 'hooks';
import styles from './Subscription.module.scss';

const ftContractId = '0xa2677f49725647da5cff15e8a42b2ead9102c387d646ff856f586b81e4b598a0';

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const cancelSubscription = () => sendMessage({ CancelSubscription: { subscriber: decodedAddress } });

  const purchaseSubscription = (values: { isRenewal: boolean; period: string }) =>
    sendMessage(
      {
        RegisterSubscription: {
          payment_method: ftContractId,
          period: { [values.period]: null },
          with_renewal: values.isRenewal,
        },
      },
      { onSuccess: closeModal },
    );

  return (
    <>
      {isSubscriptionsStateRead ? (
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
                <Button text="Subscribe" onClick={openModal} />
              </>
            )}
          </div>
        </>
      ) : (
        <Loader />
      )}

      {isModalOpen && <PurchaseSubscriptionModal close={closeModal} onSubmit={purchaseSubscription} />}
    </>
  );
}

export { Subscription };
