import { useEffect } from 'react';

/* eslint-disable react-hooks/exhaustive-deps */
import { useApolloClient } from '../hooks/useApolloClient';
import {
  useFreshchatGetNewMessages,
  useFreshchatInit,
} from '../hooks/useFreshchat';
import { VariantChatConfig } from '../types/VariantChat';
import { subscribe } from './Event';

export const useVariantChat = (
  driverId: string,
  config: VariantChatConfig,
  dispatch: any
): void => {
  useEffect(() => {
    // Connect the callers event handlers to our events.
    subscribe('error', ({ data }) => config.onError && config.onError(data), {
      once: true,
    });

    subscribe(
      'message-received-background',
      ({ data }) =>
        config.onMessageReceivedBackground &&
        config.onMessageReceivedBackground(data),
      { once: true }
    );
  }, []);

  console.log(
    'FC INIT ' + driverId + ', ' + JSON.stringify(config.chatProvider)
  );

  useApolloClient(config.variantApi);

  useFreshchatInit(driverId, config.chatProvider, dispatch);

  useFreshchatGetNewMessages();
};
