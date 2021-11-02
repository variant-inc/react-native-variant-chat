import { useApolloClient } from '../hooks/useApolloClient';
import {
  useFreshchatGetNewMessages,
  useFreshchatInit,
} from '../hooks/useFreshchat';
import { VariantChatConfig } from '../types/VariantChat';
import { subscribe } from './Event';

export const useVariantChat = (
  driverId: string,
  config: VariantChatConfig
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

  useApolloClient(config.api);

  console.log('FC INIT ' + driverId + ', ' + JSON.stringify(config.chat));
  useFreshchatInit(driverId, config.chat.channelName, config.chat);

  useFreshchatGetNewMessages();
};
