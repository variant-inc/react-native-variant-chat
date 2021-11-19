import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import axios, { AxiosInstance } from 'axios';
import { EventRegister } from 'react-native-event-listeners';
import {
  Freshchat,
  FreshchatConfig as FreshchatSDKConfig,
} from 'react-native-freshchat-sdk';
import { SECOND } from 'time-constants';

import { FreshchatChannel } from '../../types/FreshchatChannel.type';
import { FreshchatConversation } from '../../types/FreshchatConversation';
import {
  FreshchatGetMessages,
  FreshchatMessage,
} from '../../types/FreshchatMessage';
import { FreshchatUser } from '../../types/FreshchatUser';
import { ChatProviderConfig } from '../../types/VariantChat';
import { FreshchatBadStatus, FreshchatCommunicationError } from '../Exception';

const FRESHCHAT_FAILED_MESSAGES = '@ps-freshchat-failed-messages';
const MESSAGES_PER_PAGE = 50;
const AXIOS_REQUEST_TIMEOUT = 15;

export const realtimeMessagePerPage = 10;

let instance: AxiosInstance;

export async function initFreshchat(
  driverId: string,
  freshchatUserId: string,
  config: ChatProviderConfig
): Promise<void> {
  if (!config) {
    return;
  }
  instance = axios.create({
    baseURL: config.baseUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'accept': 'application/json',
      'Authorization': `Bearer ${config.accessToken}`,
    },
    timeout: AXIOS_REQUEST_TIMEOUT * SECOND,
  });

  // Freshchat SDK provides push notification functionality.
  initFreshchatSDK(driverId, freshchatUserId, config);
}

const initFreshchatSDK = async (
  driverId: string,
  freshchatUserId: string,
  config: ChatProviderConfig
): Promise<void> => {
  const freshchatSDKConfig = new FreshchatSDKConfig(
    config.appId,
    config.appKey
  );
  const freshchatUser = await getFreshchatUser(freshchatUserId);

  Freshchat.init(freshchatSDKConfig);
  Freshchat.identifyUser(
    driverId,
    freshchatUser.restore_id,
    (error: string) => {
      EventRegister.emit('error', {
        type: 'internal',
        message: `Freshchat user identification failed: ${error} (user id ${freshchatUser.id}, restore id ${freshchatUser.restore_id})`,
      });
    }
  );

  EventRegister.emit('debug', {
    type: 'log',
    message: `Init Freshchat SDK with user: ${JSON.stringify(freshchatUser)})`,
  });
};

export const registerPushNotificationToken = async (
  token: string
): Promise<void> => {
  console.log('SET PUSH NOTIFICATION TOKEN ' + token);
  Freshchat.setPushRegistrationToken(token);
};

export const tryGetNewMessagesOnPushNotificationEvent = (
  notification: FirebaseMessagingTypes.RemoteMessage,
  getNewMessages: () => void
): void => {
  return Freshchat.isFreshchatNotification(
    notification,
    (n: FirebaseMessagingTypes.RemoteMessage) => {
      if (n) {
        // Handle the freshchat notification... retrieve new messages....
        console.log('PUSH NOTIFICATION MESSAGE: ${n}');
        getNewMessages();
        return true;
      }
      // Notification not handled here.
      return false;
    }
  );
};

export async function getFreshchatUser(userId: string): Promise<FreshchatUser> {
  try {
    const response = await instance.get(`/v2/users/${userId}`);
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat user: ${error.message}`
    );
  }
}

export async function getFreshchatAgent(
  agentId: string
): Promise<FreshchatUser> {
  try {
    const response = await instance.get(`/v2/agents/${agentId}`);
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat agent: ${error.message}`
    );
  }
}

export async function getFreshchatChannels(): Promise<FreshchatChannel[]> {
  try {
    const response = await instance.get('/v2/channels');
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data && response.data.channels;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat channels: ${error.message}`
    );
  }
}

export async function getFreshchatConversation(
  conversationId: string
): Promise<FreshchatConversation> {
  try {
    const response = await instance.get(`/v2/conversations/${conversationId}`);
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat conversation: ${error.message}`
    );
  }
}

export async function setFreshchatMessage(
  userId: string,
  conversationId: string,
  message: string
): Promise<FreshchatMessage> {
  try {
    const response = await instance.post(
      `/v2/conversations/${conversationId}/messages`,
      {
        actor_type: 'user',
        actor_id: userId,
        message_type: 'normal',
        message_parts: [{ text: { content: message } }],
      }
    );
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not set freshchat message: ${error.message}`
    );
  }
}

export async function getFreshchatMessages(
  conversationId: string,
  page = 1,
  itemsPerPage = MESSAGES_PER_PAGE
): Promise<FreshchatGetMessages> {
  try {
    const response = await instance.get(
      `/v2/conversations/${conversationId}/messages?page=${page}&items_per_page=${itemsPerPage}`
    );
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat messages: ${error.message}`
    );
  }
}

export async function getFreshchatMoreMessages(
  moreLink: string
): Promise<FreshchatGetMessages | null> {
  try {
    const response = await instance.get(moreLink);
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get more freshchat conversation: ${error.message}`
    );
  }
}

export const setFreshchatFailedMessage = async (
  conversationId: string,
  failedMessage: FreshchatMessage
): Promise<void> => {
  try {
    const freshchatFailedMessages = await getFreshchatFailedMessages(
      conversationId
    );
    freshchatFailedMessages.push(failedMessage);

    await AsyncStorage.setItem(
      `${FRESHCHAT_FAILED_MESSAGES}-${conversationId}`,
      JSON.stringify(freshchatFailedMessages)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    EventRegister.emit('error', {
      type: 'internal',
      message: `Could not save failed message: ${error.message}`,
    });
  }
};

export const getFreshchatFailedMessages = async (
  conversationId: string
): Promise<FreshchatMessage[]> => {
  try {
    const freshchatMessages = await AsyncStorage.getItem(
      `${FRESHCHAT_FAILED_MESSAGES}-${conversationId}`
    );

    if (freshchatMessages) {
      return JSON.parse(freshchatMessages);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    EventRegister.emit('error', {
      type: 'internal',
      message: `Could not get failed message: ${error.message}`,
    });
  }
  return [];
};

export const removeFreshchatFailedMessage = async (
  conversationId: string,
  messageId: string | number
): Promise<void> => {
  try {
    const freshchatFailedMessages = await getFreshchatFailedMessages(
      conversationId
    );
    const filteredFailedMessages = freshchatFailedMessages?.filter(
      (message: FreshchatMessage) => message.id !== messageId
    );

    await AsyncStorage.setItem(
      `${FRESHCHAT_FAILED_MESSAGES}-${conversationId}`,
      JSON.stringify(filteredFailedMessages)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    EventRegister.emit('error', {
      type: 'internal',
      message: `Could not save failed message: ${error.message}`,
    });
  }
};
