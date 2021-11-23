import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import { useApolloClient } from '../hooks/useApolloClient';
import {
  useFreshchatGetNewMessages,
  useFreshchatInit,
} from '../hooks/useFreshchat';
import { variantChatSetDriverStatus } from '../store/slices/chat/chat';
import { DriverStatus } from '../types/DriverStatus';
import { VariantChatConfig } from '../types/VariantChat';
import {
  registerPushNotificationToken,
  tryGetNewMessagesOnPushNotificationEvent,
} from './Freshchat/Freshchat';

let dispatch: any;

export const useConsumerDispatch = (): any => {
  return dispatch;
};

let getNewMessages = (): void => {
  return;
};

const useVariantChat = (
  driverId: string,
  config: VariantChatConfig,
  consumerDispatch: any
): void => {
  dispatch = consumerDispatch;
  useApolloClient(config.variantApi);
  useFreshchatInit(driverId, config.chatProvider, dispatch);
  getNewMessages = useFreshchatGetNewMessages(config.capabilities);
};

const handlePushNotification = (
  notification: FirebaseMessagingTypes.RemoteMessage
): void => {
  return tryGetNewMessagesOnPushNotificationEvent(notification, getNewMessages);
};

const setDriverStatus = (status: DriverStatus): void => {
  dispatch(variantChatSetDriverStatus({ driverStatus: status }));
};

export {
  handlePushNotification,
  registerPushNotificationToken,
  setDriverStatus,
  useVariantChat,
};
