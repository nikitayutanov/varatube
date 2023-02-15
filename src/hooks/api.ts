import { getProgramMetadata, getStateMetadata, MessagesDispatched, ProgramMetadata } from '@gear-js/api';
import { DEFAULT_ERROR_OPTIONS, DEFAULT_SUCCESS_OPTIONS, useAccount, useAlert, useApi } from '@gear-js/react-hooks';
import { web3FromSource } from '@polkadot/extension-dapp';
import { EventRecord } from '@polkadot/types/interfaces';
import { AnyJson, Codec, ISubmittableResult } from '@polkadot/types/types';
import { bnToBn } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { useState, useEffect, useRef } from 'react';
import stateWasm from 'assets/gear_subscription_state.meta.wasm';

const metaHex =
  '0x01000000000001050000000000000000000108000000250c4800000004080410000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000050700140850676561725f737562736372697074696f6e5f696f1c416374696f6e7300010c505265676973746572537562736372697074696f6e0c01387061796d656e745f6d6574686f6404011c4163746f724964000118706572696f64180118506572696f64000130776974685f72656e6577616c1c0110626f6f6c00000044436865636b537562736372697074696f6e0401287375627363726962657204011c4163746f7249640001004843616e63656c537562736372697074696f6e00020000180850676561725f737562736372697074696f6e5f696f18506572696f640001141059656172000000284e696e654d6f6e746873000100245369784d6f6e7468730002002c54687265654d6f6e746873000300144d6f6e7468000400001c0000050000200850676561725f737562736372697074696f6e5f696f44537562736372697074696f6e5374617465000008012c737562736372696265727324018442547265654d61703c4163746f7249642c2053756273637269626572446174613e00013c7061796d656e745f6d6574686f647340016042547265654d61703c4163746f7249642c2050726963653e000024042042547265654d617008044b01040456012800040038000000280850676561725f737562736372697074696f6e5f696f3853756273637269626572446174610000140130776974685f72656e6577616c1c0110626f6f6c0001387061796d656e745f6d6574686f6404011c4163746f724964000118706572696f64180118506572696f64000148737562736372697074696f6e5f73746172742c0128287536342c207533322900013072656e6577616c5f646174652c0128287536342c207533322900002c00000408303400300000050600340000050500380000023c003c0000040804280040042042547265654d617008044b01040456011000040044000000440000020000' as HexString;

const programId = '0x4bb6ebddd74d8976d631168d4f3317bccf93f856ee7bf54e1d5e66fa16aa97a2' as HexString;

const metadata = getProgramMetadata(metaHex);

type FullSubState = {
  [key: HexString]: {
    isActive: boolean;
    startDate: number;
    endDate: number;
    startBlock: number;
    endBlock: number;
    period: string;
    renewalDate: number;
    renewalBlock: number;
    price: number;
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

  console.log(isStateRead);
  console.log(state);

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

type SendMessageOptions = {
  value?: string | number;
  isOtherPanicsAllowed?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-shadow
function useSendMessage(destination: HexString, metadata: ProgramMetadata | undefined) {
  const { api } = useApi(); // сircular dependency fix
  const { account } = useAccount();
  const alert = useAlert();

  const title = 'gear.sendMessage';
  const loadingAlertId = useRef('');

  const handleEventsStatus = (events: EventRecord[], onSuccess?: () => void, onError?: () => void) => {
    events.forEach(({ event: { method, section } }) => {
      if (method === 'MessageEnqueued') {
        alert.success(`${section}.MessageEnqueued`);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onSuccess && onSuccess();
      } else if (method === 'ExtrinsicFailed') {
        alert.error('Extrinsic Failed', { title });
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onError && onError();
      }
    });
  };

  const handleStatus = (result: ISubmittableResult, onSuccess?: () => void, onError?: () => void) => {
    const { status, events } = result;
    const { isReady, isInBlock, isInvalid, isFinalized } = status;

    if (isInvalid) {
      alert.update(loadingAlertId.current, 'Transaction error. Status: isInvalid', DEFAULT_ERROR_OPTIONS);
    } else if (isReady) {
      alert.update(loadingAlertId.current, 'Ready');
    } else if (isInBlock) {
      alert.update(loadingAlertId.current, 'In Block');
    } else if (isFinalized) {
      alert.update(loadingAlertId.current, 'Finalized', DEFAULT_SUCCESS_OPTIONS);
      handleEventsStatus(events, onSuccess, onError);
    }
  };

  const sendMessage = (payload: AnyJson, options?: SendMessageOptions) => {
    if (account && metadata) {
      loadingAlertId.current = alert.loading('Sign In', { title });

      const { value = 0, isOtherPanicsAllowed = false, onSuccess, onError } = options || {};
      const { address, decodedAddress, meta } = account;
      const { source } = meta;

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      api.message.send({ destination, gasLimit: bnToBn('250000000000'), payload, value }, metadata) &&
        web3FromSource(source)
          .then(({ signer }) =>
            api.message.signAndSend(address, { signer }, (result) => handleStatus(result, onSuccess, onError)),
          )
          .catch(({ message }: Error) => {
            alert.update(loadingAlertId.current, message, DEFAULT_ERROR_OPTIONS);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            onError && onError();
          });
    }
  };

  return sendMessage;
}
function useReadWasmState<T = AnyJson>(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  programId: HexString | undefined,
  wasm: Buffer | Uint8Array | undefined,
  functionName: string | undefined,
  payload?: AnyJson,
  isReadOnError?: boolean,
) {
  const { api } = useApi();

  const readWasmState = () => {
    if (!programId || !wasm || !functionName) return;

    return getStateMetadata(wasm).then((stateMetadata) =>
      api.programState.readUsingWasm({ programId, wasm, fn_name: functionName, argument: payload }, stateMetadata),
    );
  };

  const alert = useAlert();

  const [state, setState] = useState<T>();
  const [error, setError] = useState('');
  const [isStateRead, setIsStateRead] = useState(false);

  const resetError = () => setError('');

  const readState = (isInitLoad?: boolean) => {
    if (isInitLoad) setIsStateRead(false);

    readWasmState()
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

  useEffect(() => {
    readState(true);
    resetError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, wasm, functionName]);

  const handleStateChange = ({ data }: MessagesDispatched) => {
    const changedIDs = data.stateChanges.toHuman() as HexString[];
    const isAnyChange = changedIDs.some((id) => id === programId);

    if (isAnyChange) readState();
  };

  useEffect(() => {
    if (!programId || !wasm || !functionName) return;

    const unsub = api?.gearEvents.subscribeToGearEvent('MessagesDispatched', handleStateChange);

    return () => {
      unsub?.then((unsubCallback) => unsubCallback());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, programId, wasm, functionName]);

  return { state, isStateRead, error };
}

function useSubscriptions() {
  const [buffer, setBuffer] = useState<Buffer>();

  useEffect(() => {
    fetch(stateWasm)
      .then((result) => result.arrayBuffer())
      .then((arrBuffer) => Buffer.from(arrBuffer))
      .then((res) => setBuffer(res));
  }, []);

  const { state, isStateRead } = useReadWasmState<FullSubState>(programId, buffer, 'all_subscriptions');

  return { subscriptionsState: state, isSubscriptionsStateRead: isStateRead };
}

function useSubscriptionsMessage() {
  return useSendMessage(programId, metadata);
}

export { useSubscriptions, useSubscriptionsMessage };
