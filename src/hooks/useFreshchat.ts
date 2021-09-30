import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { NotificationService } from 'react-native-platform-science';
import Tts from 'react-native-tts';
import { useSelector } from 'react-redux';
import { IOpsMessage } from 'types/Message.interface';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable react-hooks/exhaustive-deps */
import {
  getFreshchatAgent,
  getFreshchatChannels,
  getFreshchatConversation,
  getFreshchatFailedMessages,
  getFreshchatMessages,
  getFreshchatMoreMessages,
  getFreshchatUser,
  initFreshchat,
  realtimeMessagePerPage,
  removeFreshchatFailedMessage,
  setFreshchatFailedMessage,
  setFreshchatMessage,
} from '../lib/Freshchat/Freshchat';
import { getFreshchatConversations } from '../lib/Freshchat/FreshchatConversation';
import { filterNewMessages } from '../lib/Freshchat/Utils';
import { AppDispatch, useAppDispatch } from '../store';
import {
  selectFreshchatConversation,
  selectFreshchatConversationUsers,
  selectFreshchatCurrentUser,
  selectFreshchatIsFullscreenVideo,
  selectFreshchatMessages,
  selectFreshchatMoreMessage,
} from '../store/selectors/freshchatSelectors';
import {
  freshchatAddMessage,
  freshchatAppendMessages,
  freshchatAppendNewMessages,
  freshchatRemoveMessage,
  freshchatSetChannel,
  freshchatSetConversation,
  freshchatSetConversationUser,
  freshchatSetCurrentUser,
  freshchatSetIsFullscreenVideo,
  freshchatSetMessages,
} from '../store/slices/chat/chat';
import {
  accountNotSetup,
  appNotAvailable,
  reopenedMessageMark,
  resolvedMessageMark,
  urgentMessageMark,
} from '../theme/constants';
import { FreshchatChannel } from '../types/FreshchatChannel.type';
import { FreshchatConversation } from '../types/FreshchatConversation';
import { FreshchatInit } from '../types/FreshchatInit.enum';
import {
  ActorType,
  FreshchatGetMessages,
  FreshchatMessage,
  MessageType,
} from '../types/FreshchatMessage';
import { FreshchatUser } from '../types/FreshchatUser';
import { VariantChatConfig } from '../types/VariantChat';

export const useFreshchatInit = (
  driverId: string,
  channelName: string,
  config: VariantChatConfig
): FreshchatInit => {
  const dispatch = useAppDispatch();

  const [initialized, setInitialized] = useState(FreshchatInit.None);

  const init = async (configValue: VariantChatConfig) => {
    if (driverId) {
      // init axios
      await initFreshchat({
        freshchatAppId: configValue.chatAppId,
        freshchatAppKey: configValue.chatAppKey,
        freshchatBaseUrl: configValue.chatBaseUrl,
        freshchatAccessToken: configValue.chatAccessToken,
      });

      // channel
      const channel = await getChannel(channelName);
      if (channel) {
        dispatch(freshchatSetChannel({ channel }));
      }

      let userId = null;
      let conversationId = null;

      // get conversation from backend
      try {
        const conversationInfo = await getFreshchatConversations(driverId);
        console.debug(
          'Messaging service conversation info: ' +
            JSON.stringify(conversationInfo)
        );

        if (conversationInfo) {
          userId = conversationInfo.userId;
          const conversationItem = conversationInfo.conversations.find(
            (conversation: { channel: string }) =>
              conversation.channel === channelName
          );
          conversationId = conversationItem?.id;
        }

        if (!conversationId) {
          showConversationError();
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // ENOTFOUND indicates the messaging service could not find the specified driver id.
        if (error.message.includes('ENOTFOUND')) {
          showConversationError();
        } else {
          showServiceError();
        }
        throw error;
      }

      // Getting user, conversation, and messages must be done synchonously.
      let user = null;
      if (userId) {
        user = await getUser(userId);
      }

      if (user) {
        dispatch(freshchatSetCurrentUser({ user }));
      }

      const response = await getConversation(conversationId);
      if (response) {
        dispatch(freshchatSetConversation({ conversation: response }));
      }

      const messageResponse = await getMessages(conversationId, 1);
      if (messageResponse) {
        dispatch(freshchatSetMessages({ message: messageResponse }));
        checkConversationUsers(dispatch, [], messageResponse.messages);
      }

      // Check and Append the failed messages
      const failedMessages = await getFreshchatFailedMessages();
      if (failedMessages && failedMessages.length) {
        dispatch(freshchatAppendNewMessages({ messages: failedMessages }));
      }

      setInitialized(FreshchatInit.Success);
    }

    Tts.getInitStatus();
  };

  const showConversationError = () => {
    setInitialized(FreshchatInit.Fail);
    Alert.alert(/*appConfig.appName*/ 'TBD', accountNotSetup, [], {
      cancelable: false,
    });
  };

  const showServiceError = () => {
    setInitialized(FreshchatInit.Fail);
    Alert.alert(/*appConfig.appName*/ 'TBD', appNotAvailable, [], {
      cancelable: false,
    });
  };

  useEffect(() => {
    try {
      init(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setInitialized(FreshchatInit.Fail);
      Alert.alert(/*appConfig.appName*/ 'TBD', appNotAvailable, [], {
        cancelable: false,
      });
      console.log(`Freshchat init failed: ${error.message}`);
    }
  }, [driverId, config]);

  return initialized;
};

const getChannel = async (
  channelName: string
): Promise<FreshchatChannel | null> => {
  const response = await getFreshchatChannels();
  if (response) {
    const findedChannel = response.find((channel: FreshchatChannel) =>
      channel.name.includes(channelName)
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
  conversationId: string
): Promise<FreshchatConversation | null> => {
  const response = await getFreshchatConversation(conversationId);
  return response;
};

const getMessages = async (
  conversationId: string,
  page = 1
): Promise<FreshchatGetMessages | null> => {
  const response = await getFreshchatMessages(conversationId, page);
  return response;
};

export const useFreshchatGetUser = (userId: string): void => {
  const dispatch = useAppDispatch();

  const getUserInLocal = async (): Promise<void> => {
    const response = await getFreshchatUser(userId);
    if (response) {
      dispatch(freshchatSetConversationUser({ user: response }));
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
      if (!currentUser || !currentConversation) {
        return;
      }

      const response = await setFreshchatMessage(
        currentUser.id,
        currentConversation.conversation_id,
        message
      );

      if (response) {
        // Success
        dispatch(freshchatAddMessage({ message: response }));
      } else {
        // Fail
        const failedMessage = {
          message_parts: [{ text: { content: message } }],
          actor_id: currentUser.id,
          id: uuidv4(),
          conversation_id: currentConversation.conversation_id,
          message_type: MessageType.Normal,
          actor_type: ActorType.User,
          created_time: new Date().toISOString(),
          user_id: currentUser.id,
          not_sent: true,
        };

        setFreshchatFailedMessage(failedMessage);
        dispatch(freshchatAddMessage({ message: failedMessage }));
      }
    },
    [currentUser, currentConversation, dispatch]
  );

  return sendMessage;
};

export const useFreshchatSendFailedMessage = (): ((
  message: IOpsMessage
) => void) => {
  const dispatch = useAppDispatch();
  const currentUser = useSelector(selectFreshchatCurrentUser);
  const currentConversation = useSelector(selectFreshchatConversation);
  const isSending = useRef(false);

  const sendFailedMessage = useCallback(
    async (sendMessage: IOpsMessage): Promise<void> => {
      if (!currentUser || !currentConversation) {
        return;
      }

      if (!sendMessage.messages || !sendMessage.messages.length) {
        return;
      }

      // only text message for now
      if (!sendMessage.messages[0].text) {
        return;
      }

      const message = sendMessage.messages[0].text.content;

      isSending.current = true;

      const response = await setFreshchatMessage(
        currentUser.id,
        currentConversation.conversation_id,
        message
      );

      if (response) {
        // Success

        // remove the failed message
        dispatch(freshchatRemoveMessage({ id: sendMessage._id }));

        dispatch(freshchatAddMessage({ message: response }));

        // Remove the failed messages from storage
        removeFreshchatFailedMessage(sendMessage._id);
      }

      isSending.current = false;
    },
    [currentUser, currentConversation, dispatch]
  );

  return sendFailedMessage;
};

export const useFreshchatGetMessages = (page = 1): void => {
  const dispatch = useAppDispatch();
  const currentConversation = useSelector(selectFreshchatConversation);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);

  const getMessagesInLocal = async (): Promise<void> => {
    if (currentConversation) {
      const response = await getFreshchatMessages(
        currentConversation.conversation_id,
        page
      );
      if (response) {
        dispatch(freshchatAppendMessages({ message: response }));

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
  const isFetching = useRef(false);

  const getMoreMessages = useCallback(async (): Promise<void> => {
    if (currentConversation && moreMessages && !isFetching.current) {
      isFetching.current = true;

      const response = await getFreshchatMoreMessages(moreMessages?.href);

      isFetching.current = false;

      if (response) {
        dispatch(freshchatAppendMessages({ message: response }));

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
  const isFullscreenVideo = useSelector(selectFreshchatIsFullscreenVideo);

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
    } else {
      console.log('App has come to the background!');
    }

    appState.current = nextAppState;
  };

  const getNewMessages = async (): Promise<void> => {
    if (currentConversation) {
      const response = await getFreshchatMessages(
        currentConversation.conversation_id,
        1,
        realtimeMessagePerPage
      );
      if (response) {
        const newMessages = filterNewMessages(allMessages, response.messages);
        if (newMessages.length === 0) {
          return;
        }

        dispatch(freshchatAppendNewMessages({ messages: newMessages }));
        checkConversationUsers(dispatch, conversationUsers, response.messages);

        let newMessage = newMessages[0].message_parts[0].text?.content || '';

        if (appState.current === 'background' && !isFullscreenVideo) {
          if (newMessage.includes(urgentMessageMark)) {
            // urgent message
            Tts.stop();
            newMessage = newMessage
              .replace(urgentMessageMark, '')
              .replace('&nbsp;', '');
            Tts.speak(newMessage);
          }

          if (
            !resolvedMessageMark.some((s) => newMessage.includes(s)) &&
            !reopenedMessageMark.some((s) => newMessage.includes(s))
          ) {
            NotificationService.addNotification(
              driverId,
              /*appConfig.appName*/ 'TBD',
              newMessage
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
  messages: FreshchatMessage[]
) => {
  const newUsers: Record<string, string>[] = [];

  messages.forEach((message: FreshchatMessage) => {
    if (
      conversationUsers.findIndex(
        (item: FreshchatUser) => item.id === message.actor_id
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
        dispatch(freshchatSetConversationUser({ user: responseUser }));
      }
    });
  }
};

export const useFreshchatSetIsFullscreenVideo = (): ((
  isFullscreenVideo: boolean
) => void) => {
  const dispatch = useAppDispatch();

  const setIsFullscreenVideo = useCallback(
    async (isFullscreenVideo: boolean): Promise<void> => {
      dispatch(
        freshchatSetIsFullscreenVideo({ isFullscreen: isFullscreenVideo })
      );
    },
    [dispatch]
  );

  return setIsFullscreenVideo;
};
