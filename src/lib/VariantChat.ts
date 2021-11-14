import { useApolloClient } from '../hooks/useApolloClient';
import {
  useFreshchatGetNewMessages,
  useFreshchatInit,
} from '../hooks/useFreshchat';
import { VariantChatConfig } from '../types/VariantChat';

export const useVariantChat = (
  driverId: string,
  config: VariantChatConfig,
  dispatch: any
): void => {

  useApolloClient(config.variantApi);
  useFreshchatInit(driverId, config.chatProvider, dispatch);
  useFreshchatGetNewMessages();
};
