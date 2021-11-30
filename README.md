# react-native-variant-chat

A React Native chat component for Variant apps. This component wraps a selected chat provider to create a uniform user experience across multiple consuming apps. The chat provider is currently Freshchat. This component may be upgraded in the future to adapt a newly selected chat provider (ideally without changing the interface exposed by this component).

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

The chat provider managed by Variant Chat is Freshchat. Freshchat does not provide a real-time (socket) connection to its servers making it challenging to know when a new chat message has been sent by the remote server. To address this condition this component provides some built-in and callable features promoting timely and guaranteed chat message delivery.

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
_Note: These steps support the use of the Freshchat SDK only. Changing chat providers will likely remove the need for these steps._

In the consuming apps `android/app/build.gradle` add the following lines.

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

In the consuming apps `android/app/src/main/AndroidManifest.xml` add the following lines.

```javascript
<application>
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

export const ChatScreen: React.FC = () => {

  useEffect(() => {
    const errorListener = VariantChatEvent.addEventListener(
      'error',
      (event: VariantChatEventType) => {
        console.log(`${event.type} ${event.data.message}`);
      },
    );

    const messageReceivedListener = VariantChatEvent.addEventListener(
      'messageReceived',
      (event: VariantChatEventType) => {
        console.log(`${event.type} ${event.data.message}`);
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
**`containerStyle`** | TBD | StyleProp<ViewStyle>
**`scrollToBottomStyle`** | TBD | StyleProp<ViewStyle>
**`messagesContainerStyle`** | TBD | StyleProp<ViewStyle>
**`textInputStyle`** | TBD | StyleProp<TextStyle>
**`textStyle`** | TBD | StyleProp<TextStyle>
**`timeTextStyle`** | TBD | LeftRightStyle<TextStyle>
**`imageStyle`** | TBD | StyleProp<TextStyle>
**`sendContainerStyle`** | TBD | StyleProp<ViewStyle>
**`sendTextStyle`** | TBD | StyleProp<TextStyle>
**`messageContainerStyle`** | TBD | LeftRightStyle<TextStyle>
**`videoMessageContainerStyle`** | TBD | StyleProp<ViewStyle>
**`videoMessageVideoStyle`** | TBD | StyleProp<ViewStyle>
**`textMessageTextStyle`** | TBD | StyleProp<TextStyle>
**`userNameTextStyle`** | TBD | LeftRightStyle<TextStyle>
**`actionsContainerStyle`** | TBD | StyleProp<ViewStyle>
**`actionWrapperSyle`** | TBD | StyleProp<ViewStyle>
**`bubbleContainerStyle`** | TBD | LeftRightStyle<ViewStyle>
**`bubbleWrapperStyle`** | TBD | LeftRightStyle<ViewStyle>
**`bubbleTextStyle`** | TBD | LeftRightStyle<TextStyle>
**`bubbleBottomContainerStyle`** | TBD | LeftRightStyle<ViewStyle>
**`bubbleTickStyle`** | TBD | StyleProp<TextStyle>
**`lightboxCloseButtonStyle`** | TBD | StyleProp<ViewStyle>
**`lightboxProps`** | TBD | any

## Initialization

Call the `useVariantChat` hook to initialize the component library before attempting to render the `<VariantChat>` component.

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

Chat provider specific configuration `chatProvider: ChatProviderConfig`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`baseUrl`** | .. | String | **Required**
**`accessToken`** | .. | String | **Required**
**`appId`** | .. | String | **Required**
**`appKey`** | .. | String | **Required**
**`channelNames`** | .. | Array | **Required**

### Variant API service configuration

Variant app backend specific configuration `variantApi: VariantApiConfig`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`accessToken`** | .. | String | **Required**
**`url`** | .. | String | **Required**

### Capability settings

VariantChat capability settings `capabilities: ChatCapabilities`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`messagePolling`** | Third-party chat provider message polling settings | ChatCapabilities | See [Message polling capability](message-polling-capabillity)

#### Message polling capability

Third-party chat provider message polling settings; `messagePolling`.

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`Driving`** | The number of milliseconds between checking for new messages while driver status is "Driving" | Number | 900000 (15 mins)
**`OnDuty`** | The number of milliseconds between checking for new messages while driver status is "OnDuty" | Number | 900000 (15 mins)
**`OffDuty`** | The number of milliseconds between checking for new messages while driver status is "OffDuty" | Number | 900000 (15 mins)
**`SleeperBerth`** | The number of milliseconds between checking for new messages while driver status is "SleeperBerth" | Number | 900000 (15 mins)
**`Unknown`** | The number of milliseconds between checking for new messages while driver status is "Unknown" | Number | 900000 (15 mins)

Also see [Performance tuning for Freshchat interaction using the Launch Darkly service](#Performance-tuning-for-freshchat-interaction-using-the-launch-darkly-service)

## State

This component relies on redux state to persist data across app launches. The internal store state and reducers need to be folded into the consuming apps store. `useVariantChat()` receives the store `dispatch` to ensure that this component inter-operates with the consuming apps redux store.

Add chat to the consuming apps store state.

```javascript
import { VariantChatState } from 'react-native-variant-chat';

export interface StoreState {
  // Other app store state
  chat: VariantChatState;
}
```

Add chat initial store state to the consuming apps initial store state.

```javascript
export { initialVariantChatState } from './types/VariantChatState';

export const initialStoreState = Object.freeze<StoreState>({
  // Other app initial store state
  chat: initialVariantChatState,
});
```

Add the chat reducer to the consuming apps combined reducer.

```javascript
import {variantChatReducer} from 'react-native-variant-chat';

export const rootReducer = combineReducers({
  // Other app reducers
  chat: variantChatReducer,
});
```
  
## Events

```javascript
import { VariantChatEvent, VariantChatEventType } from 'react-native-variant-chat';

// Add a listner to handle the desired event.
const internalErrorListener = VariantChatEvent.addEventListener(
  'error',
  (event: VariantChatEventType) => {
    console.log(`${event.type} ${event.data.message}`);
  },
);

// Be sure to remove the listener when the consuming component unmounts.
VariantChatEvent.removeEventListener(internalErrorListener);
```

The following events are emitted from the library. Your app should register for events by name.

Event name | Description | Types | Data
------ | ------ | ------ | ------
**`error`** | Variant chat has encountered an error | `conversation`, `internal`, `service` | {message: String}
**`messageReceived`** | Variant chat has received a chat message from the provider, message received while the app is in the background | `background` | {channelName: String, message: String}
**`unreadMessageCounts`** | For each channel, the number of unread messages | `unreadMessageCounts` | {'channel-name': Number, ...} e.g. channel-name may be 'Chat with Team'.

The event callback receives a single argument `event` of type `VariantChatEventType`.

Property | Description | Type
------ | ------ | ------
**`type`** | The type of event received | String
**`data`** | The event data | Object as defined by the event

## Synchronize Messages

You can force on-demand fetching of messages from the chat provider by calling `syncMessages()`.

Note: `handlePushNotification()` automatically fetches chat provider messages as needed. Foreground push notifications are received from Freshchat. However, background notifications on iOS are not received. Freshchat does not set the APNs property `contentAvailable` which is required for receiving background notifications on iOS. It is possible to simulate the handling of background message fetching by forcing on-demand fetching of messages using `syncMessages()`. Although having nothing to do with receiving a push notification, fetching messages when the app comes to the foreground will catch the case when the driver is responding to the receipt of a background push notification (e.g. presentation of a banner).

```javascript
import { syncMessages } from 'react-native-variant-chat';

syncMessages();
```

### Push Notifications

The chat provider can send push notifications to the app. To enable the chat provider to target the app the push notification token must be provided to this component.

Register the apps push notification token.

```javascript
import {registerPushNotificationToken} from 'react-native-variant-chat';

registerPushNotificationToken(pushNotificationToken);
```

When a push notification is received by the consuming app it should be forwarded to this component for possible handing of the notification payload. If the notification payload is sent by the chat provider then this component will automatically fetch messages from the chat provider service. If the notification is not from the chat provider then no action is taken. Th return value of `handlePushNotification()` indicates whether or not the notification was handled.

```javascript
import {handlePushNotification} from 'react-native-variant-chat';

const isHandled: boolean = handlePushNotification(notification);
```

Argument | Description | Type | Default
------ | ------ | ------ | ------
**`notification`** | The notification received by the app | FirebaseMessagingTypes.RemoteMessage | **Required**

## Driver Status

You can provide driver status to this component using the function `setDriverStatus()`. This example demonstrates how you can map the consuming apps driver status values to those used by this component.

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

This component relies on Freshchat as the third-party provider for centralized messaging services. Unfortunatley Freshchat does not provide a mobile-friendly method to listen for new messages sent to the driver. The solution in-part is to apply a message polling technique to pull new messages on some specified time interval. Since rate limits are enforced on the Freshchat service the polling interval must be managed. This component provides a method to remotely set the polling interval. The polling interval setting is sensitive to driver status. This design allows this component to request new messages from the chat provider based on the drivers current status. For example, polling for new messsges may be less frequent when driver is `Driving` vs. in `SleeperBerth`.

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

All driver message polling changes in the consuming app are applied immediately upon committing changes on Launch Darkly. If the consuming app is not presently running then the changes will be picked up next time the app launches. If the consuming app is presently running then the changes are applied dynamically within a few seconds.
