# react-native-variant-chat

A React Native chat component for Variant apps. This component wraps a selected chat provider to provide a uniform experience across multiple consuming app. The chat provider is currently Freshchat. This component may be upgraded in the future to adapt a newly selected chat provider (ideally withou changing the interface exposed by this component).

## Installation

```sh
npm install https://github.com/variant-inc/react-native-variant-chat
```
Add the following dependencies.
- TODO: remove this requirement

```sh
npm install react-native-background-timer
npm install react-native-tts
```

## Integration

Several steps are required to integrate this component.
1. Place the `<VariantChat>` component into a view
1. Make a call to initialize the component library
1. Add the components reducers and selectors to your Redux store
1. Add event handlers and provide UI responses
1. Initialize and handle push notifications

### Basic Usage

```javascript
import {VariantChat} from "react-native-variant-chat";

export const ChatModal: React.FC = () => {

  useEffect(() => {
    const errorListener = VariantChatEvent.addEventListener(
      'error',
      (error: string) => {
        console.log(error);
      },
    );

    const messageReceivedListener = VariantChatEvent.addEventListener(
      'messageReceivedInBackground',
      (message: string) => {
        console.log(message);
      },
    );

    return () => {
      VariantChatEvent.removeEventListener(errorListener);
      VariantChatEvent.removeEventListener(messageReceivedListener);
    };
  }, []);

  const noConversationComponent = (): JSX.Element => {
    return (
      <View>
        <Text>{`Conversation 'Chat with Team' does not exist.`}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.view}>
      <Modal title="Chat">
        <VariantChat
          channelName={'Chat with Team'}
          theme={theme}
          defaultAvatarUrl={'https://some-domain/my-avatar.jpg'}
          NoConversationComponent={noConversationComponent()}
        />
      </Modal>
    </SafeAreaView>
  );
};

```

### Component

Prop | Description | Type | Default
------ | ------ | ------ | ------
**`channelName`** | The channel name for which a conversation is presented | String | **Required**
**`theme`** | A react native paper theme | ReactNativePaper.Theme | **A sample theme**
**`defaultAvatarUrl`** | A URL resolving an image to be used as the users avatar | String | **The chat users initials**
**`NoConversationComponent`** | Rendered if the specified `channelName` does not resolve a conversation | Component, Element | **Text stating the conversation does not exist**

### Initialization

The library must be initialized before attempting to render the `<VariantChat>` component. The `useVariantChat` hook initializes the component library.

```javascript
useVariantChat = (
  driverId: '123456',
  config: {
    chatProvider: {
      baseUrl: 'freshchat-url';
      accessToken: 'freshchat-access-token';
      appId: 'freshchat-app-id';
      appKey: 'freshchat-app-key';
      channelNames: ['Chat with Team', 'Ambassador Program'];
    }
    variantApi: {
      accessToken: getAccessToken,
      url: 'variant-api-url'
    }
  },
  dispatch: appDispatch);
```

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`driverId`** | The driver id of the user | String | **Required**
**`config`** | Service configuration including `chatProvider` and `variantApi`| VariantChatConfig | **Required**
**`dispatch`** | Your redux store dispatch function | Dispatch<any> | **Required**

Chat provider configuration.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`chatProvider`** | Chat provider specific configuration | ChatProviderConfig | **Required**
**`baseUrl`** | .. | String | **Required**
**`accessToken`** | .. | String | **Required**
**`appId`** | .. | String | **Required**
**`appKey`** | .. | String | **Required**
**`channelNames`** | .. | Array | **Required**

Variant API service configuration.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`variantApi`** | Variant app backend specific configuration | VariantApiConfig | **Required**
**`accessToken`** | .. | String | **Required**
**`url`** | .. | String | **Required**

### Redux Store

Variant chat relies on redux state to share data within the component and to manage app offline functionality. The Variant chat store state and reducers need to be folded into the apps store. `useVariantChat()` receives the store `dispatch` to ensure that the Variant chat component can inter-operate with the apps redux store.

Add chat to you app store state.

```javascript
import { VariantChatState } from 'react-native-variant-chat';

export interface StoreState {
  // Other app store state
  chat: VariantChatState;
}
```

Add chat initial store state to your app initial store state.

```javascript
export { initialVariantChatState } from './types/VariantChatState';

export const initialStoreState = Object.freeze<StoreState>({
  // Other app initial store state
  chat: initialVariantChatState,
});
```

Add the chat reducer to your apps combined reducer.

```javascript
import {variantChatReducer} from 'react-native-variant-chat';

export const rootReducer = combineReducers({
  // Other app reducers
  chat: variantChatReducer,
});
```

### Events

```javascript
import { VariantChatEvent } from 'react-native-variant-chat';

// Add a listner to handle the desired event.
const errorListener = VariantChatEvent.addEventListener(
  'error',
  (message: string) => {
    console.log('ERROR: ' + message);
  },
);

// Be sure to remove the listener when the consuming component unmounts.
VariantChatEvent.removeEventListener(errorListener);
```

Event name | Description | Event data
------ | ------ | ------
**`error`** | Variant chat has encountered an error | error message text
**`messageReceivedInBackground`** | Variant chat has received a chat message from the provider, message received while the app is in the background | message text

### Push Notification

The chat provider can send push notifications to the app. To enable the chat provider to target the app the push notification token should be provided to Variant chat.

Register the apps push notification token.

```javascript
import {registerPushNotificationToken} from 'react-native-variant-chat';

registerPushNotificationToken(pushNotificationToken);
```

When a push notification is received by the app Variant chat can handle the notification to provide additional services including the following.
- Improve message delivery performance (future)
- Manage badging (future)

```javascript
import {handlePushNotification} from 'react-native-variant-chat';

handlePushNotification(notification);
```

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`notification`** | The notification received by the app | FirebaseMessagingTypes.RemoteMessage | **Required**

## License

MIT
