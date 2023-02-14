import { useSubscriptions } from 'hooks';

function Home() {
  const { subscriptionsState } = useSubscriptions();
  console.log('subscriptionsState: ', subscriptionsState);

  return <>main</>;
}

export { Home };
