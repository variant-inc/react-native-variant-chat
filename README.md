# react-native-variant-chat

A React Native chat component for Variant apps. This component wraps a selected chat provider to provide a uniform experience across multiple consuming app. The chat provider is currently Freshchat. This component may be upgraded in the future to adapt a newly selected chat provider (ideally withou changing the interface exposed by this component).

- [Installation](#installation)
- [Integration Steps](#integration-steps)
- [Basic Usage](#basic-usage)
- [UI Component](#ui-component)
- [Initialization](#initialization)
- [State](#state)
- [Events](#events)
- [Synchronize Messages](#synchronize-messages)
- [Push Notifications](#push-notifications)
- [Driver Status](#driver-status)
- [Performance tuning for Freshchat interaction using the Launch Darkly service](#performance-tuning-for-freshchat-interaction-using-the-launch-darkly-service)

## Chat Provider

The chat provider managed by Variant Chat is Freshchat. Freshchat does not provide a real-time (socket) connection to its servers making it challenging to know whena new chat message has been sent from the remote server. To address this condition this component provides some built-in and callable features promoting timely and guaranteed chat message delivery.

- Polling - this component polls the Freshchat server to fetch messages. See [Message polling capability](message-polling-capability).
- Push notifications - arrival of push notifications create events that stimulate this component to fetch new messages. See [Push Notifications](#push-notifications).
- App events - app state transitions can be used to stimulate the fetching of messages. See [Synchronize Messages](#synchronize-messages).

## Installation

```sh
npm install https://github.com/variant-inc/react-native-variant-chat
```
Add the following dependencies.
- TODO: remove this requirement

```sh
npm install react-native-background-timer
npm install react-native-tts
npm install react-native-freshchat-sdk
```

### Android specific installation

Make the following changes to Android configuration to avoid Freshchat SDK runtime warnings about a file provider for the camera.

In `android/app/build.gradle` add the following lines. Modify appropriatley for the consuming app.

```javascript
defaultConfig {
  ...
  resValue "string", "freshchat_file_provider_authority", "com.drivevariant.driver_app.freshchat.provider" // Add this line
}

productFlavors {
  development {
    ...
    resValue "string", "freshchat_file_provider_authority", "com.drivevariant.driver_app.dev.freshchat.provider" // Add this line
  }
  staging {
    ...
    resValue "string", "freshchat_file_provider_authority", "com.drivevariant.driver_app.staging.freshchat.provider" // Add this line
  }
}

```

In `android/app/src/main/AndroidManifest.xml` add the following lines.

```javascript
<application
  ...
  <provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.freshchat.provider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
      android:name="android.support.FILE_PROVIDER_PATHS"
      android:resource="@xml/freshchat_file_provider_paths" />
  </provider>
  ...
</application>
```

## Integration Steps

Several steps are required to integrate this component.
1. Place the `<VariantChat>` component into a view
1. Make a call to initialize the component library
1. Add the components reducers and selectors to your Redux store
1. Add event handlers and provide UI responses
1. Initialize and handle push notifications
1. Provide driver status
1. Tune performance

## Basic Usage

```javascript
import {VariantChat, VariantChatEventType} from "react-native-variant-chat";

export const ChatModal: React.FC = () => {

  useEffect(() => {
    const errorListener = VariantChatEvent.addEventListener(
      'error',
      (event: VariantChatEventType) => {
        console.log(`${event.type} ${event.message}`);
      },
    );

    const messageReceivedListener = VariantChatEvent.addEventListener(
      'messageReceived',
      (event: VariantChatEventType) => {
        console.log(`${event.type} ${event.message}`);
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
          chatStyles={chatStyles}
          defaultAvatarUrl={'https://some-domain/my-avatar.jpg'}
          NoConversationComponent={noConversationComponent()}
        />
      </Modal>
    </SafeAreaView>
  );
};

```

## UI Component

Prop | Description | Type | Default
------ | ------ | ------ | ------
**`channelName`** | The channel name for which a conversation is presented | String | **Required**
**`chatStyles`** | Styles for the user interface | VariantChatStyles  | **Default styles**
**`defaultAvatarUrl`** | A URL resolving an image to be used as the users avatar | String | **The chat users initials**
**`NoConversationComponent`** | Rendered if the specified `channelName` does not resolve a conversation | Component, Element | **Text stating the conversation does not exist**

### ChatStyles

Chat styles are standard React properties. The `LeftRightStyle` is used to denote, for example, left chat bubble or right chat bubble.

```javascript
export interface LeftRightStyle<T> {
  left?: StyleProp<T>
  right?: StyleProp<T>
}
```

Prop | Description | Type
------ | ------ | ------
**containerStyle** | TBD | StyleProp<ViewStyle>
**scrollToBottomStyle** | TBD | StyleProp<ViewStyle>
**messagesContainerStyle** | TBD | StyleProp<ViewStyle>
**textInputStyle** | TBD | StyleProp<TextStyle>
**textStyle** | TBD | StyleProp<TextStyle>
**timeTextStyle** | TBD | LeftRightStyle<TextStyle>
**imageStyle** | TBD | StyleProp<TextStyle>
**sendContainerStyle** | TBD | StyleProp<ViewStyle>
**sendTextStyle** | TBD | StyleProp<TextStyle>
**messageContainerStyle** | TBD | LeftRightStyle<TextStyle>
**videoMessageContainerStyle** | TBD | StyleProp<ViewStyle>
**videoMessageVideoStyle** | TBD | StyleProp<ViewStyle>
**textMessageTextStyle** | TBD | StyleProp<TextStyle>
**userNameTextStyle** | TBD | LeftRightStyle<TextStyle>
**actionsContainerStyle** | TBD | StyleProp<ViewStyle>
**actionWrapperSyle** | TBD | StyleProp<ViewStyle>
**bubbleContainerStyle** | TBD | LeftRightStyle<ViewStyle>
**bubbleWrapperStyle** | TBD | LeftRightStyle<ViewStyle>
**bubbleTextStyle** | TBD | LeftRightStyle<TextStyle>
**bubbleBottomContainerStyle** | TBD | LeftRightStyle<ViewStyle>
**bubbleTickStyle** | TBD | StyleProp<TextStyle>
**lightboxCloseButtonStyle** | TBD | StyleProp<ViewStyle>
**lightboxProps** | TBD | any

## Initialization

The library must be initialized before attempting to render the `<VariantChat>` component. The `useVariantChat` hook initializes the component library.

```javascript
useVariantChat = (
  driverId: '123456',
  config: {
    chatProvider: {
      baseUrl: 'freshchat-url',
      accessToken: 'freshchat-access-token',
      appId: 'freshchat-app-id',
      appKey: 'freshchat-app-key',
      channelNames: ['Chat with Team', 'Ambassador Program'],
    },
    variantApi: {
      accessToken: getAccessToken,
      url: 'variant-api-url',
    },
    capabilities: {
      messagePolling: {
        Driving: 10000,
        OnDuty: 20000,
        OffDuty: 30000,
        SleeperBerth: 40000,
        Unknown: 50000,
      },
    },
  dispatch: appDispatch);
```

### Basic VariantChat configuration

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`driverId`** | The driver id of the user | String | **Required**
**`config`** | Service configuration including `chatProvider`, `variantApi`, and `capabilities` | **Required** (`capabilities` optional)
**`dispatch`** | Your redux store dispatch function | Dispatch<any> | **Required**

### Chat provider configuration

Chat provider specific configuration; `chatProvider: ChatProviderConfig`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`baseUrl`** | .. | String | **Required**
**`accessToken`** | .. | String | **Required**
**`appId`** | .. | String | **Required**
**`appKey`** | .. | String | **Required**
**`channelNames`** | .. | Array | **Required**

### Variant API service configuration

Variant app backend specific configuration; `variantApi: VariantApiConfig`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`accessToken`** | .. | String | **Required**
**`url`** | .. | String | **Required**

### Capability settings

VariantChat capability settings; `capabilities: ChatCapabilities`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`messagePolling`** | Third-party chat provider message polling settings | ChatCapabilities | See [Message polling capability](message-polling-capabillity)

#### Message polling capability

Third-party chat provider message polling settings; `messagePolling`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`Driving`** | The number of milliseconds between checking for new messages while driver status is "Driving" | number | 900000 (15 mins)
**`OnDuty`** | The number of milliseconds between checking for new messages while driver status is "OnDuty" | number | 900000 (15 mins)
**`OffDuty`** | The number of milliseconds between checking for new messages while driver status is "OffDuty" | number | 900000 (15 mins)
**`SleeperBerth`** | The number of milliseconds between checking for new messages while driver status is "SleeperBerth" | number | 900000 (15 mins)
**`Unknown`** | The number of milliseconds between checking for new messages while driver status is "Unknown" | number | 900000 (15 mins)

Also see [Performance tuning for Freshchat interaction using the Launch Darkly service](#Performance-tuning-for-freshchat-interaction-using-the-launch-darkly-service)

## State

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

### Clearing State

It is possible to clear the persistent state of the component. For example, this might need to be done when the consuming apps user changes (i.e. on logout).

```javascript
import {resetVariantChat} from 'react-native-variant-chat';

resetVariantChat();
```

## Events

```javascript
import { VariantChatEvent, VariantChatEventType } from 'react-native-variant-chat';

// Add a listner to handle the desired event.
const internalErrorListener = VariantChatEvent.addEventListener(
  'error',
  (event: VariantChatEventType) => {
    console.log(`${event.type} ${event.message}`);
  },
);

// Be sure to remove the listener when the consuming component unmounts.
VariantChatEvent.removeEventListener(internalErrorListener);
```

The following events are emitted from the library. Your app should register for events by name.

Event name | Description | Types
------ | ------ | ------
**`error`** | Variant chat has encountered an error | `conversation`, `internal`, `service`
**`info`** | Variant chat has provided some useful information | `notYetImplemented`
**`messageReceived`** | Variant chat has received a chat message from the provider, message received while the app is in the background | `background`

The event callback receives a single argument `event` of type `VariantChatEventType`. Properties of each `VariantChatEventType` are as follows.

Property | Description | Type
------ | ------ | ------
**`type`** | The type of event received | String
**`message`** | The event description | String

## Synchronize Messages

You can force an on-demand fetching of messages from the chat provider by calling `syncMessages()`.

Note: `handlePushNotification()` automatically fetches chat provider messages as needed. Foreground push notifications are received from Freshchat. However, background notifications on iOS are not received. Freshchat does not set the APNs property `contentAvailable` which is required for receiving background notifications. It's possible to simulate the handling of background message fetching by forcing on-demand fetching of messages using `syncMessages()`. Although having nothing to do with receiving a push notification, fetching messages when the app comes to the foreground will catch the case when the driver is responding to the receipt of a background push notification (e.g. presentation of a banner).

```javascript
import { syncMessages } from 'react-native-variant-chat';

syncMessages();
```

### Push Notifications

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

## Driver Status

The following features of VariantChat are sensitive to the drivers status. You can provide driver status to VariantChat using the function `setDriverStatus()`.

```javascript
import {
  DriverStatus as VariantChatDriverStatus, // Get VariantChat driver status type.
  setDriverStatus as setVariantChatDriverStatus,
} from 'react-native-variant-chat';

import {DriverStatus} from 'types/Driver'; // Get consuming app driver status type.

// Create a lookup table to map driver status from app to VariantChat values.
const driverStatusMap = {
  [DriverStatus.Driving]: VariantChatDriverStatus.Driving,
  [DriverStatus.OffDuty]: VariantChatDriverStatus.OffDuty,
  [DriverStatus.OnDuty]: VariantChatDriverStatus.OnDuty,
  [DriverStatus.SleeperBerth]: VariantChatDriverStatus.SleeperBerth,
  [DriverStatus.Unknown]: VariantChatDriverStatus.Unknown,
};

setVariantChatDriverStatus(driverStatusMap[driverStatus]);
```

## Performance tuning for Freshchat interaction using the Launch Darkly service

VariantChat relies on Freshchat as the third-party provider for centralized messaging services. Unfortunatley Freshchat does not provide a mobile-friendly method to listen for new messages sent by Operations Specialists. The VariantChat solution in-part is to apply a message polling technique to pull new messages on some specified time interval. Since we have rate limits on the use of the Freshchat service the polling interval must be managed. VariantChat provides method to remotely set the polling interval. The polling interval setting is senstitive driver status. This allows VariantChat to request new messages based on the drivers current status. For example, VariantChat may be set to poll for new messsges less frequently when driver is `Driving` vs. in `SleeperBerth`.

Launch Darkly can be used to provide the remote management of polling intervals. Launch Darkly "variations" provide for the configuration of the interval values. Each value is expressed as a number of milliseconds.

```javascript
// Example Launch Darkly variation
{
  "messagePolling": {
    "Driving": 10000,
    "OnDuty": 20000,
    "OffDuty": 30000,
    "SleeperBerth": 40000,
    "Unknown": 50000,
  }
}
```

All driver message polling changes in the consuming mobile app are applied immediately upon committing changes on Launch Darkly. If the consuming mobile app is not presently running then the changes will be picked up next time the app launches. If the consuming mobile app is presently running then the changes are applied dynamically within a few seconds.
