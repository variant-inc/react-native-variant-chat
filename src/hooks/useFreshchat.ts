/* eslint-disable react-hooks/exhaustive-deps */
import {
  getFreshchatAgent,
  getFreshchatChannels,
  getFreshchatConversation,
  getFreshchatMessages,
  getFreshchatMoreMessages,
  getFreshchatUser,
  initFreshchat,
  realtimeMessagePerPage,
  setFreshchatMessage,
} from '../lib/Freshchat/Freshchat';
import {getFreshchatConversations} from '../lib/Freshchat/FreshchatConversation';
import {filterNewMessages} from '../lib/Freshchat/Utils';
import {
  selectFreshchatConversation,
  selectFreshchatConversationUsers,
  selectFreshchatCurrentUser,
  selectFreshchatMessages,
  selectFreshchatMoreMessage,
} from '../store/selectors/freshchatSelectors';
import {
  freshchatAddMessage,
  freshchatAppendMessages,
  freshchatAppendNewMessages,
  freshchatSetChannel,
  freshchatSetConversation,
  freshchatSetConversationUser,
  freshchatSetCurrentUser,
  freshchatSetMessages,
} from '../store/slices/chat/chat';
import {FreshchatChannel} from '../types/FreshchatChannel.type';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, AppState, AppStateStatus} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import {NotificationService} from 'react-native-platform-science';
import Tts from 'react-native-tts';
import {useSelector} from 'react-redux';
import {AppDispatch, useAppDispatch} from '../store';

import {
  accountNotSetup,
  appNotAvailable,
  reopenedMessageMark,
  resolvedMessageMark,
  urgentMessageMark,
} from '../theme/constants';
import {FreshchatConversation} from '../types/FreshchatConversation';
import {FreshchatInit} from '../types/FreshchatInit.enum';
import {
  ActorType,
  FreshchatGetMessages,
  FreshchatMessage,
} from '../types/FreshchatMessage';
import {FreshchatUser} from '../types/FreshchatUser';
import { VariantChatConfig } from '../types/VariantChat';

export const useFreshchatInit = (driverId: string, channelName: string, config: VariantChatConfig): FreshchatInit => {
  const dispatch = useAppDispatch();

  const [initialized, setInitialized] = useState(FreshchatInit.None);

  const init = async (config: VariantChatConfig) => {
    if (driverId) {
      // init axios
      await initFreshchat({
        freshchatAppId: config.chatAppId,
        freshchatAppKey: config.chatAppKey,
        freshchatBaseUrl: config.chatBaseUrl,
        freshchatAccessToken: config.chatAccessToken,
      });

      // channel
      const channel = await getChannel(channelName);
      if (channel) {
        dispatch(freshchatSetChannel({channel}));
      }

      let userId = null;
      let conversationId = null;

      // get conversation from backend
      try {
        const conversationInfo = await getFreshchatConversations(driverId);
        console.log('VMA conversation info: ' + JSON.stringify(conversationInfo));

        if (conversationInfo) {
          userId = conversationInfo.userId;
          const conversationItem = conversationInfo.conversations.find(
            (conversation: {channel: string}) =>
              conversation.channel === channelName,
          );
          conversationId = conversationItem?.id;
        }

        if (!conversationId) {
          showConversationError();
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log('Fetching Conversations Error: ' + error.message);
        showServiceError();
        throw error; // Rethrow for caller to handle bad network request.
      }

      // Getting user, conversation, and messages must be done synchonously.
      let user = null;
      if (userId) {
        user = await getUser(userId);
      }

      if (user) {
        dispatch(freshchatSetCurrentUser({user}));
      }

      const response = await getConversation(conversationId);
      if (response) {
        dispatch(freshchatSetConversation({conversation: response}));
      }

      const messageResponse = await getMessages(conversationId, 1);
      if (messageResponse) {
        dispatch(freshchatSetMessages({message: messageResponse}));
        checkConversationUsers(dispatch, [], messageResponse.messages);
      }

      setInitialized(FreshchatInit.Success);
    }

    Tts.getInitStatus();
  };

  const showConversationError = () => {
    setInitialized(FreshchatInit.Fail);
    Alert.alert(/*appConfig.appName*/'TBD', accountNotSetup, [], {cancelable: false});
  };

  const showServiceError = () => {
    setInitialized(FreshchatInit.Fail);
    Alert.alert(/*appConfig.appName*/'TBD', appNotAvailable, [], {cancelable: false});
  };

  useEffect(() => {
    try {
      init(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setInitialized(FreshchatInit.Fail);
      Alert.alert(/*appConfig.appName*/'TBD', appNotAvailable, [], {cancelable: false});
      console.log('Freshchat init failed: ' + error.message);
    }
  }, [driverId, config]);

  return initialized;
};

const getChannel = async (
  channelName: string,
): Promise<FreshchatChannel | null> => {
  const response = await getFreshchatChannels();
  if (response) {
    const findedChannel = response.find((channel: FreshchatChannel) =>
      channel.name.includes(channelName),
    );
    if (findedChannel) {
      return findedChannel;
    }
  }
  return null;
};

const getUser = async (userId: string): Promise<FreshchatUser | null> => {
  const response = await getFreshchatUser(userId);
  return response;
};

const getConversation = async (
  conversationId: string,
): Promise<FreshchatConversation | null> => {
  const response = await getFreshchatConversation(conversationId);
  return response;
};

const getMessages = async (
  conversationId: string,
  page = 1,
): Promise<FreshchatGetMessages | null> => {
  const response = await getFreshchatMessages(conversationId, page);
  return response;
};

export const useFreshchatGetUser = (userId: string): void => {
  const dispatch = useAppDispatch();

  const getUserInLocal = async (): Promise<void> => {
    const response = await getFreshchatUser(userId);
    if (response) {
      dispatch(freshchatSetConversationUser({user: response}));
    }
  };

  useEffect(() => {
    getUserInLocal();
  }, []);
};

export const useFreshchatSendMessage = (): ((message: string) => void) => {
  const dispatch = useAppDispatch();
  const currentUser = useSelector(selectFreshchatCurrentUser);
  const currentConversation = useSelector(selectFreshchatConversation);

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (currentUser && currentConversation) {
        const response = await setFreshchatMessage(
          currentUser.id,
          currentConversation.conversation_id,
          message,
        );
        if (response) {
          dispatch(freshchatAddMessage({message: response}));
        }
      }
    },
    [currentUser, currentConversation, dispatch],
  );

  return sendMessage;
};

export const useFreshchatGetMessages = (page = 1): void => {
  const dispatch = useAppDispatch();
  const currentConversation = useSelector(selectFreshchatConversation);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);

  const getMessagesInLocal = async (): Promise<void> => {
    if (currentConversation) {
      const response = await getFreshchatMessages(
        currentConversation.conversation_id,
        page,
      );
      if (response) {
        dispatch(freshchatAppendMessages({message: response}));

        checkConversationUsers(dispatch, conversationUsers, response.messages);
      }
    }
  };

  useEffect(() => {
    getMessagesInLocal();
  }, []);
};

export const useFreshchatGetMoreMessages = (): (() => void) => {
  const dispatch = useAppDispatch();
  const currentConversation = useSelector(selectFreshchatConversation);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const moreMessages = useSelector(selectFreshchatMoreMessage);

  const getMoreMessages = useCallback(async (): Promise<void> => {
    if (currentConversation && moreMessages) {
      const response = await getFreshchatMoreMessages(moreMessages?.href);
      if (response) {
        dispatch(freshchatAppendMessages({message: response}));

        checkConversationUsers(dispatch, conversationUsers, response.messages);
      }
    }
  }, [currentConversation, conversationUsers, moreMessages, dispatch]);

  return getMoreMessages;
};

export const useFreshchatGetNewMessages = (driverId: string): void => {
  const dispatch = useAppDispatch();
  const currentConversation = useSelector(selectFreshchatConversation);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const allMessages = useSelector(selectFreshchatMessages);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
    }

    appState.current = nextAppState;
  };

  const getNewMessages = async (): Promise<void> => {
    if (currentConversation) {
      const response = await getFreshchatMessages(
        currentConversation.conversation_id,
        1,
        realtimeMessagePerPage,
      );
      if (response) {
        const newMessages = filterNewMessages(allMessages, response.messages);
        if (newMessages.length === 0) {
          return;
        }

        dispatch(freshchatAppendNewMessages({messages: newMessages}));
        checkConversationUsers(dispatch, conversationUsers, response.messages);

        let newMessage = newMessages[0].message_parts[0].text?.content || '';

        if (appState.current === 'background') {
          if (newMessage.includes(urgentMessageMark)) {
            // urgent message
            Tts.stop();
            newMessage = newMessage
              .replace(urgentMessageMark, '')
              .replace('&nbsp;', '');
            Tts.speak(newMessage);
          }

          if (
            !newMessage.includes(resolvedMessageMark) &&
            !newMessage.includes(reopenedMessageMark)
          ) {
            NotificationService.addNotification(
              driverId,
              /*appConfig.appName*/'TBD',
              newMessage,
            );
          }
        }
      }
    }
  };

  useEffect(() => {
    BackgroundTimer.runBackgroundTimer(() => {
      getNewMessages();
    }, 5000);

    return () => {
      BackgroundTimer.stopBackgroundTimer();
    };
  }, [currentConversation, conversationUsers, allMessages]);
};

const checkConversationUsers = (
  dispatch: AppDispatch,
  conversationUsers: FreshchatUser[],
  messages: FreshchatMessage[],
) => {
  const newUsers: Record<string, string>[] = [];

  messages.forEach((message: FreshchatMessage) => {
    if (
      conversationUsers.findIndex(
        (item: FreshchatUser) => item.id === message.actor_id,
      ) === -1
    ) {
      newUsers.push({
        id: message.actor_id,
        type: message.actor_type,
      });
    }
  });

  if (newUsers.length > 0) {
    newUsers.forEach(async (user: Record<string, string>) => {
      let responseUser = null;
      if (user.type === ActorType.User) {
        responseUser = await getFreshchatUser(user.id);
      } else if (user.type === ActorType.Agent) {
        responseUser = await getFreshchatAgent(user.id);
      }
      if (responseUser) {
        dispatch(freshchatSetConversationUser({user: responseUser}));
      }
    });
  }
};
