import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {AxiosInstance} from 'axios';
import {FreshchatChannel} from '../../types/FreshchatChannel.type';

import {FreshchatConfig} from '../../types/Freshchat';
import {FreshchatConversation} from '../../types/FreshchatConversation';
import {
  FreshchatGetMessages,
  FreshchatMessage,
} from '../../types/FreshchatMessage';
import {FreshchatUser} from '../../types/FreshchatUser';

const FRESHCHAT_USER_ID = '@ps-freshchat-user-id';
const FRESHCHAT_CONVERSATION_ID = '@ps-freshchat-conversation-id';
const MESSAGES_PER_PAGE = 50;

export const realtimeMessagePerPage = 10;

let instance: AxiosInstance;

export async function initFreshchat(config: FreshchatConfig): Promise<void> {
  if (!config) {
    return;
  }
  //console.log('>>>>> ' + JSON.stringify(config));
  instance = axios.create({
    baseURL: config.freshchatBaseUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      accept: 'application/json',
      Authorization: `Bearer ${config.freshchatAccessToken}`,
    },
  });
}

export async function getFreshchatUser(
  userId: string,
): Promise<FreshchatUser | null> {
  try {
    const response = await instance.get(`/v2/users/${userId}`);
    // console.log('Freshchat User: ', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    //log.error('could not get freshchat user', error);
  }

  return null;
}

export async function getFreshchatAgent(
  agentId: string,
): Promise<FreshchatUser | null> {
  try {
    const response = await instance.get(`/v2/agents/${agentId}`);
    // console.log('Freshchat Agent: ', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    //log.error('could not get freshchat agnet', error);
  }

  return null;
}

export async function getFreshchatChannels(): Promise<FreshchatChannel[]> {
  try {
    const response = await instance.get('/v2/channels');
    // console.log('Freshchat channels: ', JSON.stringify(response.data));
    return response.data && response.data.channels;
  } catch (error) {
    //log.error('could not get freshchat channels', error);
  }
  return [];
}

export async function getFreshchatConversation(
  conversationId: string,
): Promise<FreshchatConversation | null> {
  try {
    const response = await instance.get(`/v2/conversations/${conversationId}`);
    // console.log('Freshchat Conversations: ', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    //log.error('could not get freshchat conversation', error);
  }
  return null;
}

export async function setFreshchatMessage(
  userId: string,
  conversationId: string,
  message: string,
): Promise<FreshchatMessage | null> {
  try {
    const response = await instance.post(
      `/v2/conversations/${conversationId}/messages`,
      {
        actor_type: 'user',
        actor_id: userId,
        message_type: 'normal',
        message_parts: [{text: {content: message}}],
      },
    );

    // console.log('Freshchat Message: ', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    //log.error('could not set freshchat message', error);
  }
  return null;
}

export async function getFreshchatMessages(
  conversationId: string,
  page = 1,
  itemsPerPage = MESSAGES_PER_PAGE,
): Promise<FreshchatGetMessages | null> {
  try {
    const response = await instance.get(
      `/v2/conversations/${conversationId}/messages?page=${page}&items_per_page=${itemsPerPage}`,
    );

    // console.log('Freshchat Messages: ', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    //log.error('could not get freshchat messages', error);
  }
  return null;
}

export async function getFreshchatMoreMessages(
  moreLink: string,
): Promise<FreshchatGetMessages | null> {
  try {
    const response = await instance.get(moreLink);

    // console.log('Freshchat Messages: ', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    //log.error('could not get more freshchat messages', error);
  }
  return null;
}

export const setFreshchatUserId = async (
  driverId: string,
  userId: string,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${FRESHCHAT_USER_ID}-${driverId}`, userId);
  } catch (error) {
    //log.error('could not save freshchat user id', error);
  }
};

export const getFreshchatUserId = async (
  driverId: string,
): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem(
      `${FRESHCHAT_USER_ID}-${driverId}`,
    );
    return userId;
  } catch (error) {
    //log.error('could not get freshchat user id', error);
    return null;
  }
};

export const clearFreshchatUserId = (driverId: string): void => {
  AsyncStorage.removeItem(`${FRESHCHAT_USER_ID}-${driverId}`);
};

export const setFreshchatConversationId = async (
  driverId: string,
  conversationId: string,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      `${FRESHCHAT_CONVERSATION_ID}-${driverId}`,
      conversationId,
    );
  } catch (error) {
    //log.error('could not save freshchat conversation id', error);
  }
};

export const getFreshchatConversationId = async (
  driverId: string,
): Promise<string | null> => {
  try {
    const conversationId = await AsyncStorage.getItem(
      `${FRESHCHAT_CONVERSATION_ID}-${driverId}`,
    );
    return conversationId;
  } catch (error) {
    //log.error('could not get freshchat conversation id', error);
    return null;
  }
};

export const clearFreshchatConversationId = (driverId: string): void => {
  AsyncStorage.removeItem(`${FRESHCHAT_CONVERSATION_ID}-${driverId}`);
};
