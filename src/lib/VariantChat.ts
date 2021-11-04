import { useApolloClient } from '../hooks/useApolloClient';
import {
  doFreshchatInit,
  useFreshchatGetNewMessages,
} from '../hooks/useFreshchat';
import { VariantChatConfig } from '../types/VariantChat';
import { subscribe } from './Event';

export const useVariantChat = (
  driverId: string,
  config: VariantChatConfig,
  dispatch: any
): void => {
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

  useApolloClient(config.variantApi);

  console.log(
    'FC INIT ' + driverId + ', ' + JSON.stringify(config.chatProvider)
  );

  ////////////////////////////////////////////////////

  ////////////////////////////////////////////////////

  //useFreshchatInit(driverId, config.chatProvider, dispatch);
  doFreshchatInit(driverId, config.chatProvider, dispatch);

  useFreshchatGetNewMessages();
};
