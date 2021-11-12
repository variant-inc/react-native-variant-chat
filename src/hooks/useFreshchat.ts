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

//export const useFreshchatInit = (
export const useFreshchatInit = (
  driverId: string,
  config: ChatProviderConfig,
  consumerDispatch: any
): FreshchatInit => {
  //const dispatch = useAppDispatch();
  dispatch = consumerDispatch;

  const [initialized, setInitialized] = useState(FreshchatInit.None);

  const init = async (configValue: ChatProviderConfig) => {
    if (driverId) {
      // init axios
      await initFreshchat({
        freshchatBaseUrl: configValue.baseUrl,
        freshchatAccessToken: configValue.accessToken,
        freshchatAppId: configValue.appId,
        freshchatAppKey: configValue.appKey,
      });

      // Get channels from Freshchat.
      const channels = await getChannels();

      if (channels) {
        console.log('SET CHANNELS ' + JSON.stringify(channels));
        await dispatch(freshchatSetChannels({ channels }));
      }

      // Get conversation id's from the messaging api.
      let conversationInfo = null;

      try {
        conversationInfo = await getFreshchatConversations(driverId);
        if (conversationInfo) {
          await dispatch(freshchatSetConversationInfo({ conversationInfo }));
        }

        console.debug(
          'Messaging service conversation info: ' +
            JSON.stringify(conversationInfo)
        );
        if (!conversationInfo) {
          showConversationError();
          return;
        }
        /*
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
        */
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
        console.log('SET USER ' + JSON.stringify(user));
        dispatch(freshchatSetCurrentUser({ user }));
      } else {
        showConversationError();
        return;
      }
      console.log('0');

      // For each channel get the conversations and messages.
      // Channel is specified with the conversation info.
      //for (let i = 0; i < conversationInfo.conversations.length; i++) {
      for (const conversation of conversationInfo.conversations) {
        //const conversationId = conversationInfo.conversations[i].id;

        getConversation(conversation.id)
          .then((response: FreshchatConversation) => {
            return dispatch(
              //freshchatSetConversation({
              //  channelName: conversation.channel,
              //  conversation: response
              //})
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
            return getFreshchatFailedMessages();
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
            console.log('6');
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
  /*
  useEffect(() => {
    try {
      console.log('TRYING FC INIT');
      if (initialized !== FreshchatInit.Success) {
        console.log('RUNNING FC INIT');
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
  }, []);
  */
  useEffect(() => {
    try {
      console.log('TRYING FC INIT');
      if (
        initialized !== FreshchatInit.Success &&
        initialized !== FreshchatInit.InProgress
      ) {
        console.log('RUNNING FC INIT');
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
        publish('error', `Freshchat init failed: ${error.message}`);
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

export const useFreshchatGetUser = (userId: string): void => {
  //const dispatch = useAppDispatch();

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

export const useFreshchatSendMessage = (
  conversationId: string
): ((message: string) => void) => {
  //const dispatch = useAppDispatch();
  const currentUser = useSelector(selectFreshchatCurrentUser);
  //  const currentConversation = useSelector(selectFreshchatConversation);
  //  const currentConversation = useSelector(selectFreshchatConversation(channelName));

  const storeFailedMessage = (message: string) => {
    //if (!currentUser || !currentConversation) {
    if (!currentUser || !conversationId) {
      return;
    }

    // Fail
    const failedMessage = {
      message_parts: [{ text: { content: message } }],
      actor_id: currentUser.id,
      id: uuidv4(),
      conversation_id: conversationId, //currentConversation.conversation_id,
      message_type: MessageType.Normal,
      actor_type: ActorType.User,
      created_time: new Date().toISOString(),
      user_id: currentUser.id,
      not_sent: true,
    };

    setFreshchatFailedMessage(failedMessage);
    dispatch(
      freshchatAddMessage({
        conversationId: conversationId, //currentConversation.conversation_id,
        message: failedMessage,
      })
    );
  };

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      //if (!currentUser || !currentConversation) {
      if (!currentUser || !conversationId) {
        return;
      }
      console.log(
        'SEND MESSAGE ' + conversationId + '  ' + JSON.stringify(message)
      );
      try {
        const response = await setFreshchatMessage(
          currentUser.id,
          conversationId, //currentConversation.conversation_id,
          message
        );

        if (response) {
          // Success
          dispatch(
            freshchatAddMessage({
              conversationId, //currentConversation.conversation_id,
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
    [currentUser, /*currentConversation,*/ conversationId, dispatch]
  );

  return sendMessage;
};

export const useFreshchatSendFailedMessage = (
  channelName: string
): ((message: IOpsMessage) => void) => {
  //const dispatch = useAppDispatch();
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
        removeFreshchatFailedMessage(sendMessage._id);
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
  //const dispatch = useAppDispatch();
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

export const useFreshchatGetNewMessages = (): void => {
  //const dispatch = useAppDispatch();
  //const currentConversation = useSelector(selectFreshchatConversation);
  const conversationInfo = useSelector(selectFreshchatConversationInfo);
  console.log('USE GET NEW MESSAGES ' + JSON.stringify(conversationInfo));

  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  //  const allMessages = useSelector(selectFreshchatMessages(channelName));
  let allMessages: { [key: string]: FreshchatMessage[] } = {};
  console.log('GETTING ALL MESSAGES AT BACKGROUND');

  allMessages = useSelector(selectFreshchatAllMessages);
  console.log('ALL MESSAGES ' + JSON.stringify(allMessages));

  //  for (let i = 0; i < conversationInfo?.conversations.length; i++) {
  //    allMessages[conversationInfo.conversations[i].id] = useSelector(selectFreshchatMessages(conversationInfo.conversations[i].id));
  //for (const conversation of conversationInfo?.conversations) {
  //  allMessages[conversation.id] = useSelector(selectFreshchatMessages(conversation.id));
  //  }
  console.log('DONE GETTING ALL MESSAGES AT BACKGROUND');

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
    console.log('START GET NEW MESSAGES ' + JSON.stringify(conversationInfo));
    if (!conversationInfo) {
      return;
    }
    for (const conversation of conversationInfo.conversations) {
      console.log('GET NEW MESSAGES ' + conversation.channel);
      getNewMessagesForConversation(conversation);
    }
  };

  const getNewMessagesForConversation = async (
    conversation: FreshchatConversationInfoConversation
  ): Promise<void> => {
    console.log('FETCHING MESSAGES');
    // Get our currently stored messages.
    //    const allMessages = useSelector(selectFreshchatMessages(conversation.channel));
    //    console.log('!!!!!!!!!!!!!!!!!');

    const response = await getFreshchatMessages(
      conversation.id,
      1,
      realtimeMessagePerPage
    );
    if (response && allMessages && allMessages[conversation.id]) {
      console.log(
        'FILTER MESSAGES ' + JSON.stringify(allMessages[conversation.id])
      );
      const newMessages = filterNewMessages(
        allMessages[conversation.id],
        response.messages
      );
      if (newMessages.length === 0) {
        console.log('NO NEW MESSAGES');
        return;
      }
      console.log('NEW MESSAGES ' + JSON.stringify(newMessages));

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
    //}, [currentConversation, conversationUsers, allMessages, isFullscreenVideo]);
  }, [conversationInfo, conversationUsers, allMessages, isFullscreenVideo]);
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
  //const dispatch = useAppDispatch();

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
