import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {AxiosInstance} from 'axios';
import {SECOND} from 'time-constants';

import {FreshchatBadStatus, FreshchatCommunicationError} from 'lib/Exception';
import {FreshchatConfig} from '../../types/Freshchat';
import {FreshchatChannel} from '../../types/FreshchatChannel.type';
import {FreshchatConversation} from '../../types/FreshchatConversation';
import {
  FreshchatGetMessages,
  FreshchatMessage,
} from '../../types/FreshchatMessage';
import { FreshchatUser } from '../../types/FreshchatUser';

const FRESHCHAT_USER_ID = '@ps-freshchat-user-id';
const FRESHCHAT_CONVERSATION_ID = '@ps-freshchat-conversation-id';
const FRESHCHAT_FAILED_MESSAGES = '@ps-freshchat-failed-messages';
const MESSAGES_PER_PAGE = 50;
const AXIOS_REQUEST_TIMEOUT = 15;

export const realtimeMessagePerPage = 10;

let instance: AxiosInstance;

export async function initFreshchat(config: FreshchatConfig): Promise<void> {
  if (!config) {
    return;
  }
  instance = axios.create({
    baseURL: config.freshchatBaseUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'accept': 'application/json',
      'Authorization': `Bearer ${config.freshchatAccessToken}`,
    },
    timeout: AXIOS_REQUEST_TIMEOUT * SECOND,
  });
}

export async function getFreshchatUser(
  userId: string
): Promise<FreshchatUser | null> {
  try {
    const response = await instance.get(`/v2/users/${userId}`);
    // log.debug('Freshchat User: ', JSON.stringify(response.data));
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat user: ${error.message}`,
    );
  }

  return null;
}

export async function getFreshchatAgent(
  agentId: string
): Promise<FreshchatUser | null> {
  try {
    const response = await instance.get(`/v2/agents/${agentId}`);
    // log.debug('Freshchat Agent: ', JSON.stringify(response.data));
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat agent: ${error.message}`,
    );
  }

  return null;
}

export async function getFreshchatChannels(): Promise<FreshchatChannel[]> {
  try {
    const response = await instance.get('/v2/channels');
    // log.debug('Freshchat channels: ', JSON.stringify(response.data));
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data && response.data.channels;
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat channels: ${error.message}`,
    );
  }
  return [];
}

export async function getFreshchatConversation(
  conversationId: string
): Promise<FreshchatConversation | null> {
  try {
    const response = await instance.get(`/v2/conversations/${conversationId}`);
    // log.debug('Freshchat Conversations: ', JSON.stringify(response.data));
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat conversation: ${error.message}`,
    );
  }
  return null;
}

export async function setFreshchatMessage(
  userId: string,
  conversationId: string,
  message: string
): Promise<FreshchatMessage | null> {
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

    // log.debug('Freshchat Message: ', JSON.stringify(response.data));
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not set freshchat message: ${error.message}`,
    );
  }
  return null;
}

export async function getFreshchatMessages(
  conversationId: string,
  page = 1,
  itemsPerPage = MESSAGES_PER_PAGE
): Promise<FreshchatGetMessages | null> {
  try {
    const response = await instance.get(
      `/v2/conversations/${conversationId}/messages?page=${page}&items_per_page=${itemsPerPage}`
    );
    // log.debug('Freshchat Messages: ', JSON.stringify(response.data));
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get freshchat messages: ${error.message}`,
    );
  }
  return null;
}

export async function getFreshchatMoreMessages(
  moreLink: string
): Promise<FreshchatGetMessages | null> {
  try {
    const response = await instance.get(moreLink);
    // log.debug('Freshchat Messages: ', JSON.stringify(response.data));
    if (response.status !== 200) {
      throw new FreshchatBadStatus(`status code ${response.status}`);
    }
    return response.data;
  } catch (error: any) {
    throw new FreshchatCommunicationError(
      `Could not get more freshchat conversation: ${error.message}`,
    );
  }
  return null;
}

export const setFreshchatUserId = async (
  driverId: string,
  userId: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${FRESHCHAT_USER_ID}-${driverId}`, userId);
  } catch (error: any) {
    //log.error(`Could not get freshchat user id: ${error.message}`);
    console.log(`Could not get freshchat user id: ${error.message}`);
  }
};

export const getFreshchatUserId = async (
  driverId: string
): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem(
      `${FRESHCHAT_USER_ID}-${driverId}`
    );
    return userId;
  } catch (error: any) {
    //log.error(`Could not get freshchat user: ${error.message}`);
    console.log(`Could not get freshchat user: ${error.message}`);
    return null;
  }
};

export const clearFreshchatUserId = (driverId: string): void => {
  AsyncStorage.removeItem(`${FRESHCHAT_USER_ID}-${driverId}`);
};

export const setFreshchatConversationId = async (
  driverId: string,
  conversationId: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      `${FRESHCHAT_CONVERSATION_ID}-${driverId}`,
      conversationId
    );
  } catch (error: any) {
    //log.error(`Could not save freshchat conversation id: ${error.message}`);
    console.log(`Could not save freshchat conversation id: ${error.message}`);
  }
};

export const getFreshchatConversationId = async (
  driverId: string
): Promise<string | null> => {
  try {
    const conversationId = await AsyncStorage.getItem(
      `${FRESHCHAT_CONVERSATION_ID}-${driverId}`
    );
    return conversationId;
  } catch (error: any) {
    //log.error(`Could not get freshchat conversation id: ${error.message}`);
    console.log(`Could not get freshchat conversation id: ${error.message}`);
    return null;
  }
};

export const clearFreshchatConversationId = (driverId: string): void => {
  AsyncStorage.removeItem(`${FRESHCHAT_CONVERSATION_ID}-${driverId}`);
};

export const setFreshchatFailedMessage = async (
  failedMessage: FreshchatMessage
): Promise<void> => {
  try {
    const freshchatFailedMessages = await getFreshchatFailedMessages();
    freshchatFailedMessages.push(failedMessage);

    await AsyncStorage.setItem(
      FRESHCHAT_FAILED_MESSAGES,
      JSON.stringify(freshchatFailedMessages)
    );
  } catch (error: any) {
    //log.error('could not save freshchat failed message', error.message);
    console.log('could not save freshchat failed message', error.message);
  }
};

export const getFreshchatFailedMessages = async (): Promise<
  FreshchatMessage[]
> => {
  try {
    const freshchatMessages = await AsyncStorage.getItem(
      FRESHCHAT_FAILED_MESSAGES
    );

    if (freshchatMessages) {
      return JSON.parse(freshchatMessages);
    }
  } catch (error: any) {
    //log.error('could not get freshchat failed message', error.message);
    console.log('could not get freshchat failed message', error.message);
  }
  return [];
};

export const removeFreshchatFailedMessage = async (
  messageId: string | number
): Promise<void> => {
  try {
    const freshchatFailedMessages = await getFreshchatFailedMessages();
    const filteredFailedMessages = freshchatFailedMessages?.filter(
      (message: FreshchatMessage) => message.id !== messageId
    );

    await AsyncStorage.setItem(
      FRESHCHAT_FAILED_MESSAGES,
      JSON.stringify(filteredFailedMessages)
    );
  } catch (error: any) {
    //log.error('could not save freshchat failed message', error.message);
    console.log('could not save freshchat failed message', error.message);
  }
};

export const clearFreshchatFailedMessages = (): void => {
  AsyncStorage.removeItem(FRESHCHAT_FAILED_MESSAGES);
};
