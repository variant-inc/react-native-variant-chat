import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import DeviceInfo from 'react-native-device-info';
//import { NotificationService } from 'react-native-platform-science';
import Tts from 'react-native-tts';
import { useSelector } from 'react-redux';
import { SECOND } from 'time-constants';
import { v4 as uuidv4 } from 'uuid';

import { publish } from '../lib/Event';
import { FreshchatCommunicationError } from '../lib/Exception';
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
  freshchatSetSendingMessageId,
} from '../store/slices/chat/chat';
import {
  accountNotSetup,
  appNotAvailable,
  networkTimeout,
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
import { IOpsMessage } from '../types/Message.interface';
import { ChatProviderConfig } from '../types/VariantChat';

const NEW_MESSAGES_POLL_INTERVAL = 10 * SECOND;

const appName = DeviceInfo.getApplicationName();

export const useFreshchatInit = (
  driverId: string,
  config: ChatProviderConfig
): FreshchatInit => {
  const channelName = config.channelNames[0]; // TODO temp, replace with impl to use the whole array
  const dispatch = useAppDispatch();

  const [initialized, setInitialized] = useState(FreshchatInit.None);

  const init = async (configValue: ChatProviderConfig) => {
    if (driverId) {
      // init axios
      await initFreshchat({
        freshchatAppId: configValue.appId,
        freshchatAppKey: configValue.appKey,
        freshchatBaseUrl: configValue.baseUrl,
        freshchatAccessToken: configValue.accessToken,
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
    Alert.alert(appName, accountNotSetup, [], {
      cancelable: false,
    });
  };

  const showServiceError = () => {
    setInitialized(FreshchatInit.Fail);
    Alert.alert(appName, appNotAvailable, [], {
      cancelable: false,
    });
  };

  const showTimeoutError = () => {
    setInitialized(FreshchatInit.Fail);
    Alert.alert(appName, networkTimeout, [], { cancelable: false });
  };

  useEffect(() => {
    try {
      if (initialized !== FreshchatInit.Success) {
        init(config);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setInitialized(FreshchatInit.Fail);
      if (error instanceof FreshchatCommunicationError) {
        showTimeoutError();
      } else {
        showServiceError();
        publish('error', `Freshchat init failed: ${error.message}`);
      }
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

  const storeFailedMessage = (message: string) => {
    if (!currentUser || !currentConversation) {
      return;
    }

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
  };

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!currentUser || !currentConversation) {
        return;
      }

      try {
        const response = await setFreshchatMessage(
          currentUser.id,
          currentConversation.conversation_id,
          message
        );

        if (response) {
          // Success
          dispatch(freshchatAddMessage({ message: response }));
        } else {
          storeFailedMessage(message);
        }
      } catch (error) {
        // Fail
        storeFailedMessage(message);
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

      if (isSending.current) {
        return;
      }

      const message = sendMessage.messages[0].text.content;

      isSending.current = true;

      dispatch(freshchatSetSendingMessageId({ id: sendMessage._id }));

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

      dispatch(freshchatSetSendingMessageId({ id: null }));

      isSending.current = false;
    },
    [currentUser, currentConversation, dispatch]
  );

  return sendFailedMessage;
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

export const useFreshchatGetNewMessages = (): void => {
  const dispatch = useAppDispatch();
  const currentConversation = useSelector(selectFreshchatConversation);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const allMessages = useSelector(selectFreshchatMessages);
  const isFullscreenVideo = useSelector(selectFreshchatIsFullscreenVideo);

  const appState = useRef(AppState.currentState);
  const lastBackgroundMessage = useRef<string | null>(null);

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
      // App has come to the foreground
    } else {
      // App has come to the background
    }

    appState.current = nextAppState;
  };

  const getNewMessages = async (): Promise<void> => {
    console.log('GET NEW MESSAGES');
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

        if (appState.current === 'background' && !isFullscreenVideo) {
          if (lastBackgroundMessage.current === newMessages[0].id) {
            return;
          }

          lastBackgroundMessage.current = newMessages[0]?.id;

          let newMessage =
            newMessages[0]?.message_parts[0]?.text?.content || '';

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
            publish('message-received-background', newMessage);
            console.log('MSG EVENT');
            /*
            const now = new Date();
            const dateTime = `${now.getFullYear()}-${
              now.getMonth() + 1
            }-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
            */
            /*
            NotificationService.addNotification(
              `${bundleId}-${dateTime}`,
              appName,
              newMessage
            );
            */
          }
        }
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Android
      console.log('BGRD START');
      const backgroundIntervalId = BackgroundTimer.setInterval(() => {
        try {
          getNewMessages();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          publish('error', `Background message fetch failed: ${error.message}`);
        }
      }, NEW_MESSAGES_POLL_INTERVAL);

      return () => {
        console.log('BGRD STOP');
        BackgroundTimer.clearInterval(backgroundIntervalId);
      };
    }

    // iOS
    console.log('BGRD START');
    BackgroundTimer.runBackgroundTimer(() => {
      try {
        getNewMessages();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        publish('error', `Background message fetch failed: ${error.message}`);
      }
    }, NEW_MESSAGES_POLL_INTERVAL);

    return () => {
      console.log('BGRD STOP');
      BackgroundTimer.stopBackgroundTimer();
    };
  }, [currentConversation, conversationUsers, allMessages, isFullscreenVideo]);
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
