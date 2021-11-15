import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import DeviceInfo from 'react-native-device-info';
import { EventRegister } from 'react-native-event-listeners';
import Tts from 'react-native-tts';
import { useSelector } from 'react-redux';
import { SECOND } from 'time-constants';
import { v4 as uuidv4 } from 'uuid';

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
import { AppDispatch } from '../store';
import {
  selectFreshchatAllMessages,
  selectFreshchatConversation,
  selectFreshchatConversationInfo,
  selectFreshchatConversationUsers,
  selectFreshchatCurrentUser,
  selectFreshchatIsFullscreenVideo,
  selectFreshchatMoreMessage,
} from '../store/selectors/freshchatSelectors';
import {
  freshchatAddConversation,
  freshchatAddMessage,
  freshchatAppendMessages,
  freshchatAppendNewMessages,
  freshchatRemoveMessage,
  freshchatSetChannels,
  freshchatSetConversationInfo,
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
import { FreshchatConversationInfoConversation } from '../types/FreshchatConversationInfo';
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

let dispatch: any;
const NEW_MESSAGES_POLL_INTERVAL = 10 * SECOND;
const appName = DeviceInfo.getApplicationName();

export const useConsumerDispatch = (): any => {
  return dispatch;
};

export const useFreshchatInit = (
  driverId: string,
  config: ChatProviderConfig,
  consumerDispatch: any
): FreshchatInit => {
  dispatch = consumerDispatch;

  const [initialized, setInitialized] = useState(FreshchatInit.None);

  const init = async (providerConfig: ChatProviderConfig) => {
    if (driverId) {
      await initFreshchat(driverId, providerConfig);

      // Get channels from Freshchat.
      const channels = await getChannels();

      if (channels) {
        await dispatch(freshchatSetChannels({ channels }));
      }

      // Get conversation id's from the messaging api.
      let conversationInfo = null;

      try {
        conversationInfo = await getFreshchatConversations(driverId);
        if (conversationInfo) {
          await dispatch(freshchatSetConversationInfo({ conversationInfo }));
        }

        if (!conversationInfo) {
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
      if (conversationInfo.userId) {
        user = await getUser(conversationInfo.userId);
      }

      if (user) {
        dispatch(freshchatSetCurrentUser({ user }));
      } else {
        showConversationError();
        return;
      }

      // For each channel get the conversations and messages.
      // Channel is specified with the conversation info.
      for (const conversation of conversationInfo.conversations) {
        getConversation(conversation.id)
          .then((response: FreshchatConversation) => {
            return dispatch(
              freshchatAddConversation({ conversation: response })
            );
          })
          .then(() => {
            return getMessages(conversation.id, 1);
          })
          .then((response: FreshchatGetMessages) => {
            dispatch(
              freshchatSetMessages({
                conversationId: conversation.id,
                message: response,
              })
            );
            checkConversationUsers(dispatch, [], response.messages);
            return getFreshchatFailedMessages(conversation.id);
          })
          .then((failedMessages: FreshchatMessage[]) => {
            // Check and Append the failed messages
            if (failedMessages && failedMessages.length) {
              return dispatch(
                freshchatAppendNewMessages({
                  conversationId: conversation.id,
                  messages: failedMessages,
                })
              );
            }
            return;
          })
          .catch(() => {
            showConversationError();
            return;
          });
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
      if (
        initialized !== FreshchatInit.Success &&
        initialized !== FreshchatInit.InProgress
      ) {
        setInitialized(FreshchatInit.InProgress);
        init(config);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setInitialized(FreshchatInit.Fail);
      if (error instanceof FreshchatCommunicationError) {
        showTimeoutError();
      } else {
        showServiceError();
        EventRegister.emit('error', `Freshchat init failed: ${error.message}`);
      }
    }
  }, []);

  return initialized;
};

const getChannels = async (): Promise<FreshchatChannel[] | null> => {
  const response = await getFreshchatChannels();
  return response;
};

const getUser = async (userId: string): Promise<FreshchatUser | null> => {
  const response = await getFreshchatUser(userId);
  return response;
};

const getConversation = async (
  conversationId: string
): Promise<FreshchatConversation> => {
  const response = await getFreshchatConversation(conversationId);
  return response;
};

const getMessages = async (
  conversationId: string,
  page = 1
): Promise<FreshchatGetMessages> => {
  const response = await getFreshchatMessages(conversationId, page);
  return response;
};

export const useFreshchatSendMessage = (
  conversationId: string
): ((message: string) => void) => {
  const currentUser = useSelector(selectFreshchatCurrentUser);

  const storeFailedMessage = (message: string) => {
    if (!currentUser || !conversationId) {
      return;
    }

    // Fail
    const failedMessage = {
      message_parts: [{ text: { content: message } }],
      actor_id: currentUser.id,
      id: uuidv4(),
      conversation_id: conversationId,
      message_type: MessageType.Normal,
      actor_type: ActorType.User,
      created_time: new Date().toISOString(),
      user_id: currentUser.id,
      not_sent: true,
    };

    setFreshchatFailedMessage(conversationId, failedMessage);
    dispatch(
      freshchatAddMessage({
        conversationId: conversationId,
        message: failedMessage,
      })
    );
  };

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!currentUser || !conversationId) {
        return;
      }

      try {
        const response = await setFreshchatMessage(
          currentUser.id,
          conversationId,
          message
        );

        if (response) {
          // Success
          dispatch(
            freshchatAddMessage({
              conversationId,
              message: response,
            })
          );
        } else {
          storeFailedMessage(message);
        }
      } catch (error) {
        // Fail
        storeFailedMessage(message);
      }
    },
    [currentUser, conversationId, dispatch]
  );

  return sendMessage;
};

export const useFreshchatSendFailedMessage = (
  channelName: string
): ((message: IOpsMessage) => void) => {
  const currentUser = useSelector(selectFreshchatCurrentUser);
  const currentConversation = useSelector(
    selectFreshchatConversation(channelName)
  );
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
        dispatch(
          freshchatRemoveMessage({
            conversationId: currentConversation.conversation_id,
            id: sendMessage._id,
          })
        );

        dispatch(
          freshchatAddMessage({
            conversationId: currentConversation.conversation_id,
            message: response,
          })
        );

        // Remove the failed messages from storage
        removeFreshchatFailedMessage(
          currentConversation.conversation_id,
          sendMessage._id
        );
      }

      dispatch(freshchatSetSendingMessageId({ id: null }));

      isSending.current = false;
    },
    [currentUser, currentConversation, dispatch]
  );

  return sendFailedMessage;
};

export const useFreshchatGetMoreMessages = (
  channelName: string
): (() => void) => {
  const currentConversation = useSelector(
    selectFreshchatConversation(channelName)
  );
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const moreMessages = useSelector(selectFreshchatMoreMessage(channelName));
  const isFetching = useRef(false);

  const getMoreMessages = useCallback(async (): Promise<void> => {
    if (currentConversation && moreMessages && !isFetching.current) {
      isFetching.current = true;

      const response = await getFreshchatMoreMessages(moreMessages?.href);

      isFetching.current = false;

      if (response) {
        dispatch(
          freshchatAppendMessages({
            conversationId: currentConversation.conversation_id,
            message: response,
          })
        );

        checkConversationUsers(dispatch, conversationUsers, response.messages);
      }
    }
  }, [currentConversation, conversationUsers, moreMessages, dispatch]);

  return getMoreMessages;
};

export const useFreshchatGetNewMessages = (): (() => void) => {
  const conversationInfo = useSelector(selectFreshchatConversationInfo);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const allMessages = useSelector(selectFreshchatAllMessages);
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
    appState.current = nextAppState;
  };

  const getNewMessages = async (): Promise<void> => {
    if (!conversationInfo) {
      return;
    }

    try {
      for (const conversation of conversationInfo.conversations) {
        getNewMessagesForConversation(conversation);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      EventRegister.emit(
        'error',
        `Chat message fetch failed: ${error.message}`
      );
    }
  };

  const getNewMessagesForConversation = async (
    conversation: FreshchatConversationInfoConversation
  ): Promise<void> => {
    const response = await getFreshchatMessages(
      conversation.id,
      1,
      realtimeMessagePerPage
    );
    if (response && allMessages && allMessages[conversation.id]) {
      const newMessages = filterNewMessages(
        allMessages[conversation.id],
        response.messages
      );
      if (newMessages.length === 0) {
        return;
      }

      dispatch(
        freshchatAppendNewMessages({
          conversationId: conversation.id,
          messages: newMessages,
        })
      );
      checkConversationUsers(dispatch, conversationUsers, response.messages);

      if (appState.current === 'background' && !isFullscreenVideo) {
        if (lastBackgroundMessage.current === newMessages[0].id) {
          return;
        }

        lastBackgroundMessage.current = newMessages[0]?.id;

        let newMessage = newMessages[0]?.message_parts[0]?.text?.content || '';

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
          EventRegister.emit('messageReceivedInBackground', newMessage);
        }
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Android
      const backgroundIntervalId = BackgroundTimer.setInterval(() => {
        getNewMessages();
      }, NEW_MESSAGES_POLL_INTERVAL);

      return () => {
        BackgroundTimer.clearInterval(backgroundIntervalId);
      };
    }

    // iOS
    BackgroundTimer.runBackgroundTimer(() => {
      getNewMessages();
    }, NEW_MESSAGES_POLL_INTERVAL);

    return () => {
      BackgroundTimer.stopBackgroundTimer();
    };
  }, [conversationInfo, conversationUsers, allMessages, isFullscreenVideo]);

  return getNewMessages;
};

const checkConversationUsers = (
  appDispatch: AppDispatch,
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
        appDispatch(freshchatSetConversationUser({ user: responseUser }));
      }
    });
  }
};

export const useFreshchatSetIsFullscreenVideo = (): ((
  isFullscreenVideo: boolean
) => void) => {
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
