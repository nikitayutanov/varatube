import { getProgramMetadata, MessagesDispatched, ProgramMetadata } from '@gear-js/api';
import { useAlert, useApi, useSendMessage } from '@gear-js/react-hooks';
import { AnyJson, Codec } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { useState, useEffect } from 'react';

const metaHex =
  '0x010000000000010500000000000000000001080000000d0b4000000004080410000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000050700140850676561725f737562736372697074696f6e5f696f1c416374696f6e7300010c505265676973746572537562736372697074696f6e0c01387061796d656e745f6d6574686f6404011c4163746f724964000118706572696f64180118506572696f64000130776974685f72656e6577616c1c0110626f6f6c00000044436865636b537562736372697074696f6e0401287375627363726962657204011c4163746f7249640001004843616e63656c537562736372697074696f6e0401287375627363726962657204011c4163746f72496400020000180850676561725f737562736372697074696f6e5f696f18506572696f6400010c404f6e654d696e75746554656e53656373000000184d696e7574650001002854686972747953656373000200001c0000050000200850676561725f737562736372697074696f6e5f696f44537562736372697074696f6e5374617465000004012c737562736372696265727324018442547265654d61703c4163746f7249642c2053756273637269626572446174613e000024042042547265654d617008044b01040456012800040038000000280850676561725f737562736372697074696f6e5f696f3853756273637269626572446174610000140130776974685f72656e6577616c1c0110626f6f6c0001387061796d656e745f6d6574686f6404011c4163746f724964000148737562736372697074696f6e5f73746172742c0128287536342c2075333229000118706572696f64180118506572696f6400013072656e6577616c5f646174652c0128287536342c207533322900002c00000408303400300000050600340000050500380000023c003c00000408042800' as HexString;

const programId = '0x2d2f354b726e08adf8c4bb95f835c55471f0f431f684e01a548efee91119c288' as HexString;

const metadata = getProgramMetadata(metaHex);

type FullState = {
  subscribers: {
    [key: HexString]: {
      withRenewal: boolean;
      paymentMethod: HexString;
      subscriptionStart: [number, number];
      period: string;
      renewalDate: [number, number];
    };
  };
};

function useHandleReadState<T = AnyJson>(
  handleReadState: () => Promise<Codec> | undefined,
  isReadOnError: boolean | undefined,
) {
  const alert = useAlert();

  const [state, setState] = useState<T>();
  const [error, setError] = useState('');
  const [isStateRead, setIsStateRead] = useState(false);

  const resetError = () => setError('');

  const readState = (isInitLoad?: boolean) => {
    if (isInitLoad) setIsStateRead(false);

    handleReadState()
      ?.then((codecState) => codecState.toJSON())
      .then((result) => {
        setState(result as unknown as T);
        if (!isReadOnError) setIsStateRead(true);
      })
      .catch(({ message }: Error) => setError(message))
      .finally(() => {
        if (isReadOnError) setIsStateRead(true);
      });
  };

  useEffect(() => {
    if (error) alert.error(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return { state, isStateRead, error, readState, resetError };
}

// eslint-disable-next-line @typescript-eslint/no-shadow
function useStateSubscription(programId: HexString | undefined, onStateChange: () => void, dependency?: boolean) {
  const { api } = useApi(); // сircular dependency fix

  const handleStateChange = ({ data }: MessagesDispatched) => {
    const changedIDs = data.stateChanges.toHuman() as HexString[];
    const isAnyChange = changedIDs.some((id) => id === programId);

    if (isAnyChange) onStateChange();
  };

  useEffect(() => {
    const isDependency = dependency !== undefined;

    if (!programId || (isDependency && !dependency)) return;

    const unsub = api?.gearEvents.subscribeToGearEvent('MessagesDispatched', handleStateChange);

    return () => {
      unsub?.then((unsubCallback: any) => unsubCallback());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, programId, dependency]);
}

function useReadFullState<T = AnyJson>(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  programId: HexString | undefined,
  meta: ProgramMetadata | undefined,
  isReadOnError?: boolean,
) {
  const { api } = useApi(); // сircular dependency fix

  const readFullState = () => {
    if (!programId || !meta) return;

    return api.programState.read({ programId }, meta);
  };

  const { state, isStateRead, error, readState, resetError } = useHandleReadState<T>(readFullState, isReadOnError);

  useEffect(() => {
    readState(true);
    resetError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, meta]);

  useStateSubscription(programId, readState, !!meta);

  return { state, isStateRead, error };
}

function useSubscriptions() {
  const { state, isStateRead } = useReadFullState<FullState>(programId, metadata);

  return { subscriptionsState: state?.subscribers, isSubscriptionsStateRead: isStateRead };
}

function useSubscriptionsMessage() {
  return useSendMessage(programId, metadata);
}

export { useSubscriptions, useSubscriptionsMessage };
