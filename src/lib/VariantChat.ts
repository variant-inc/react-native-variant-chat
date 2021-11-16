import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import { useApolloClient } from '../hooks/useApolloClient';
import {
  useFreshchatGetNewMessages,
  useFreshchatInit,
} from '../hooks/useFreshchat';
import { VariantChatConfig } from '../types/VariantChat';
import {
  registerPushNotificationToken,
  tryGetNewMessagesOnPushNotificationEvent,
} from './Freshchat/Freshchat';

let getNewMessages = (): void => {
  return;
};

const useVariantChat = (
  driverId: string,
  config: VariantChatConfig,
  dispatch: any
): void => {
  useApolloClient(config.variantApi);
  useFreshchatInit(driverId, config.chatProvider, dispatch);
  getNewMessages = useFreshchatGetNewMessages();
};

const handlePushNotification = (
  notification: FirebaseMessagingTypes.RemoteMessage
): void => {
  return tryGetNewMessagesOnPushNotificationEvent(notification, getNewMessages);
};

export {
  handlePushNotification,
  registerPushNotificationToken,
  useVariantChat,
};
