import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { EventRegister } from 'react-native-event-listeners';
import Tts from 'react-native-tts';
import { useSelector } from 'react-redux';
import { MINUTE } from 'time-constants';
import { v4 as uuidv4 } from 'uuid';

import { FreshchatCommunicationError } from '../lib/Exception';
/* eslint-disable react-hooks/exhaustive-deps */
import {
  getDriverId,
  getFreshchatAgent,
  getFreshchatChannels,
  getFreshchatConversation,
  getFreshchatFailedMessages,
  getFreshchatMessages,
  getFreshchatMoreMessages,
  getFreshchatUser,
  initAxios,
  initFreshchatSDK,
  realtimeMessagePerPage,
  removeFreshchatFailedMessage,
  reportCurrentFreshchatUnreadMessageCounts,
  setDriverId,
  setFreshchatFailedMessage,
  setFreshchatMessage,
  setFreshchatUnreadMessageCounts,
} from '../lib/Freshchat/Freshchat';
import { getFreshchatConversations } from '../lib/Freshchat/FreshchatConversation';
import { filterNewMessages } from '../lib/Freshchat/Utils';
import {
  selectDriverStatus,
  selectDrivingModeStatus,
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
  variantChatReset,
  variantChatSetInitErrorMessage,
  variantChatSetInitStatus,
} from '../store/slices/chat/chat';
import {
  reopenedMessageMark,
  resolvedMessageMark,
  systemMessageMark,
  urgentMessageMark,
} from '../theme/constants';
import { EventMessageType } from '../types/EventMessageType.enum';
import { EventName } from '../types/EventName.enum';
import { FreshchatChannel } from '../types/FreshchatChannel.type';
import { FreshchatConversation } from '../types/FreshchatConversation';
import {
  FreshchatConversationInfo,
  FreshchatConversationInfoConversation,
} from '../types/FreshchatConversationInfo';
import { FreshchatInit } from '../types/FreshchatInit.enum';
import {
  ActorType,
  FreshchatGetMessages,
  FreshchatMessage,
  MessageType,
} from '../types/FreshchatMessage';
import { FreshchatMessageParts } from '../types/FreshchatMessageParts.type';
import { FreshchatUser } from '../types/FreshchatUser';
import { IOpsMessage } from '../types/Message.interface';
import { ChatCapabilities, ChatProviderConfig } from '../types/VariantChat';

let dispatch: any;
let allSimpleChatUsers: Record<string, string>[] = [];
let isInDrivingMode = false;

const NEW_MESSAGES_POLL_INTERVAL = 15 * MINUTE;

export const useConsumerDispatch = (): any => {
  return dispatch;
};

export const resetVariantChat = async (): Promise<void> => {
  if (dispatch) {
    await dispatch(variantChatReset());
  }
};

export const useFreshchatInit = (
  driverId: string,
  config: ChatProviderConfig,
  consumerDispatch: any
): FreshchatInit => {
  dispatch = consumerDispatch;

  // const [initialized, setInitialized] = useState(FreshchatInit.None);
  const initializedRef = useRef(FreshchatInit.None);

  const setInitErrorMessage = useFreshchatSetInitErrorMessage();
  const setInitStatus = useFreshchatSetInitStatus();

  const init = async (providerConfig: ChatProviderConfig) => {
    // reset reducer
    if (driverId) {
      const savedDriverId = await getDriverId();

      if (driverId !== savedDriverId) {
        resetVariantChat();
        setDriverId(driverId);
      }

      await initAxios(providerConfig);

      // Get conversation id's from the messaging api.
      let conversationInfo: FreshchatConversationInfo = null;

      try {
        conversationInfo = await getFreshchatConversations(driverId);
        if (conversationInfo?.conversations) {
          await dispatch(freshchatSetConversationInfo({ conversationInfo }));
        } else if (conversationInfo?.statusCode === 404) {
          driverError(`${conversationInfo?.message} (driver ${driverId})`);
          return;
        } else if (!conversationInfo?.conversations) {
          conversationError(
            `No conversation info from messaging service for driver ${driverId}`
          );
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.message.toLowerCase().includes('not authenticated')) {
          authError(`${error.message} (driver ${driverId})`);
        } else {
          serviceError(`${error.message} (driver ${driverId})`);
        }
        throw error;
      }

      // Get channels from Freshchat.
      const channels = await getChannels();

      if (channels) {
        await dispatch(freshchatSetChannels({ channels }));
      }

      // Getting user, conversation, and messages must be done synchonously.
      let user = null;
      if (conversationInfo.userId) {
        user = await getUser(conversationInfo.userId);
      }

      if (user) {
        dispatch(freshchatSetCurrentUser({ user }));
      } else {
        conversationError(
          `No chat provider user found for user id ${conversationInfo.userId} (driver ${driverId})`
        );
        return;
      }

      allSimpleChatUsers = [
        {
          id: user.id,
          type: ActorType.User,
        },
      ];

      // Freshchat SDK provides push notification functionality.
      initFreshchatSDK(driverId, user, config);

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
            checkConversationUsers(dispatch, response.messages);
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
            conversationError(
              `Failed to get conversation messages (driver ${driverId}, conversation ${conversationInfo?.userId})`
            );
            return;
          });
      }

      // reports current unread messages' count
      reportCurrentFreshchatUnreadMessageCounts();
      reportInitializationComplete(conversationInfo);

      initializedRef.current = FreshchatInit.Success;
      setInitStatus(initializedRef.current);
    }

    Tts.getInitStatus();
  };

  const reportInitializationComplete = (
    conversationInfo: FreshchatConversationInfo
  ) => {
    EventRegister.emit(EventName.Initialized, {
      type: EventMessageType.Internal,
      data: {
        channelNames: conversationInfo?.conversations.map((c) => {
          return c.channel;
        }),
      },
    });
  };

  const driverError = (message: string) => {
    initializedRef.current = FreshchatInit.Fail;
    setInitErrorMessage(message);
    setInitStatus(initializedRef.current);

    EventRegister.emit(EventName.Error, {
      type: EventMessageType.NoDriver,
      data: {
        message: `Conversation error: ${message}`,
      },
    });
  };

  const conversationError = (message: string) => {
    initializedRef.current = FreshchatInit.Fail;
    setInitErrorMessage(message);
    setInitStatus(initializedRef.current);

    EventRegister.emit(EventName.Error, {
      type: EventMessageType.NoConversation,
      data: {
        message: `Conversation error: ${message}`,
      },
    });
  };

  const serviceError = (message: string) => {
    initializedRef.current = FreshchatInit.Fail;
    setInitErrorMessage(message);
    setInitStatus(initializedRef.current);

    EventRegister.emit(EventName.Error, {
      type: EventMessageType.Service,
      data: {
        message: `Service error: ${message}`,
      },
    });
  };

  const authError = (message: string) => {
    initializedRef.current = FreshchatInit.Fail;
    setInitErrorMessage(message);
    setInitStatus(initializedRef.current);

    EventRegister.emit(EventName.Error, {
      type: EventMessageType.NotAuthenticated,
      data: {
        message: `Authentication error: ${message} (authentication token has likely expired)`,
      },
    });
  };

  useEffect(() => {
    try {
      if (
        initializedRef.current !== FreshchatInit.Success &&
        initializedRef.current !== FreshchatInit.InProgress
      ) {
        initializedRef.current = FreshchatInit.InProgress;

        init(config);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      initializedRef.current = FreshchatInit.Fail;
      setInitErrorMessage(error.message);
      setInitStatus(initializedRef.current);

      if (error instanceof FreshchatCommunicationError) {
        serviceError(
          `Chat provider error: ${error.message} (driver ${driverId})`
        );
      } else if (error.message.toLowerCase().includes('Not authenticated')) {
        authError(
          `Authentication failure: ${error.message} (driver ${driverId})`
        );
      } else {
        serviceError(
          `Freshchat init failed: ${error.message} (driver ${driverId})`
        );
      }
    }

    return () => {
      initializedRef.current = FreshchatInit.None;
      setInitErrorMessage(null);
      setInitStatus(initializedRef.current);
    };
  }, [driverId]);

  return initializedRef.current;
};

const getChannels = async (): Promise<FreshchatChannel[] | null> => {
  const response = await getFreshchatChannels();
  return response;
};

const getUser = async (userId: string): Promise<FreshchatUser | null> => {
  try {
    const response = await getFreshchatUser(userId);
    return response;
  } catch (error) {
    return null;
  }
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
): ((messageParts: FreshchatMessageParts[]) => void) => {
  const currentUser = useSelector(selectFreshchatCurrentUser);

  const storeFailedMessage = (messageParts: FreshchatMessageParts[]) => {
    if (!currentUser || !conversationId) {
      return;
    }

    // Fail
    const failedMessage = {
      message_parts: messageParts,
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
    async (messageParts: FreshchatMessageParts[]): Promise<void> => {
      if (!currentUser || !conversationId) {
        return;
      }

      try {
        const response = await setFreshchatMessage(
          currentUser.id,
          conversationId,
          messageParts
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
          storeFailedMessage(messageParts);
        }
      } catch (error) {
        // Fail
        storeFailedMessage(messageParts);
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

      const messageParts = sendMessage.messages;

      isSending.current = true;

      dispatch(freshchatSetSendingMessageId({ id: sendMessage._id }));

      try {
        const response = await setFreshchatMessage(
          currentUser.id,
          currentConversation.conversation_id,
          messageParts
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
      } catch (error: any) {
        EventRegister.emit(EventName.Error, {
          type: EventMessageType.Internal,
          data: {
            message: `Chat message send failed: ${error.message}`,
          },
        });
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

        checkConversationUsers(dispatch, response.messages);
      }
    }
  }, [currentConversation, moreMessages, dispatch]);

  return getMoreMessages;
};

export const useFreshchatGetNewMessages = (
  capabilities: ChatCapabilities | undefined
): (() => void) => {
  const conversationInfo = useSelector(selectFreshchatConversationInfo);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const allMessages = useSelector(selectFreshchatAllMessages);
  const isFullscreenVideo = useSelector(selectFreshchatIsFullscreenVideo);
  const driverStatus = useSelector(selectDriverStatus);
  isInDrivingMode = useSelector(selectDrivingModeStatus);

  const allMessagesRef = useRef(allMessages);

  const appState = useRef(AppState.currentState);
  const lastBackgroundMessage = useRef<string | null>(null);

  let pollingInterval = NEW_MESSAGES_POLL_INTERVAL;

  if (driverStatus && capabilities?.messagePolling[driverStatus]) {
    pollingInterval = capabilities?.messagePolling[driverStatus];
  }

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    allMessagesRef.current = allMessages;
  }, [allMessages]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Android
      const backgroundIntervalId = BackgroundTimer.setInterval(() => {
        getNewMessages();
      }, pollingInterval);

      return () => {
        BackgroundTimer.clearInterval(backgroundIntervalId);
      };
    }

    // iOS
    BackgroundTimer.runBackgroundTimer(() => {
      getNewMessages();
    }, pollingInterval);

    return () => {
      BackgroundTimer.stopBackgroundTimer();
    };
  }, [conversationInfo, conversationUsers, isFullscreenVideo, pollingInterval]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    appState.current = nextAppState;
  };

  const getNewMessages = async (): Promise<void> => {
    if (!conversationInfo) {
      return;
    }

    try {
      if (conversationInfo.conversations) {
        for (const conversation of conversationInfo.conversations) {
          getNewMessagesForConversation(conversation);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      EventRegister.emit(EventName.Error, {
        type: EventMessageType.Internal,
        data: {
          message: `Chat message fetch failed: ${error.message}`,
        },
      });
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
    if (
      response &&
      allMessagesRef.current &&
      allMessagesRef.current[conversation.id]
    ) {
      const newMessages = filterNewMessages(
        allMessagesRef.current[conversation.id],
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

      checkConversationUsers(dispatch, response.messages);
      setFreshchatUnreadMessageCounts(conversation.channel, newMessages.length);

      const lastMessage = newMessages[newMessages.length - 1];
      let newMessageText = lastMessage?.message_parts[0]?.text?.content || '';

      if (appState.current === 'background' && !isFullscreenVideo) {
        if (lastBackgroundMessage.current === lastMessage.id) {
          return;
        }

        lastBackgroundMessage.current = lastMessage?.id;

        if (
          !resolvedMessageMark.some((s) => newMessageText.includes(s)) &&
          !reopenedMessageMark.some((s) => newMessageText.includes(s)) &&
          !systemMessageMark.some((s) => newMessageText.includes(s))
        ) {
          EventRegister.emit(EventName.MessageReceived, {
            type: EventMessageType.Background,
            data: {
              channelName: conversation.channel,
              message: newMessageText,
            },
          });
        }
      }

      if (newMessageText.includes(urgentMessageMark) || isInDrivingMode) {
        // urgent message
        Tts.stop();
        newMessageText = newMessageText
          .replace(urgentMessageMark, '')
          .replace('&nbsp;', '');
        Tts.setDucking(true);
        Tts.speak(newMessageText);
      }
    }
  };

  return getNewMessages;
};

const checkConversationUsers = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appDispatch: any,
  messages: FreshchatMessage[]
) => {
  const newUsers: Record<string, string>[] = [];

  messages.forEach((message: FreshchatMessage) => {
    if (
      allSimpleChatUsers.findIndex(
        (item: Record<string, string>) => item.id === message.actor_id
      ) === -1
    ) {
      const user = {
        id: message.actor_id,
        type: message.actor_type,
      };

      allSimpleChatUsers.push(user);
      newUsers.push(user);
    }
  });

  if (newUsers.length > 0) {
    newUsers.forEach(async (user: Record<string, string>) => {
      let responseUser = null;
      if (user.type === ActorType.User) {
        responseUser = await getUser(user.id);
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
  return useCallback(
      async (isFullscreenVideo: boolean): Promise<void> => {
        dispatch(
            freshchatSetIsFullscreenVideo({isFullscreen: isFullscreenVideo})
        );
      },
      [dispatch]
  );
};

export const useFreshchatSetInitErrorMessage = (): ((
  initErrorMessage: string | null
) => void) => {
  return useCallback(
      async (initErrorMessage: string | null): Promise<void> => {
        dispatch(variantChatSetInitErrorMessage({initErrorMessage}));
      },
      [dispatch]
  );
};

export const useFreshchatSetInitStatus = (): ((
  initStatus: FreshchatInit
) => void) => {
  return useCallback(
      async (initStatus: FreshchatInit): Promise<void> => {
        dispatch(variantChatSetInitStatus({initStatus}));
      },
      [dispatch]
  );
};
