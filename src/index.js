import { EventRegister } from 'react-native-event-listeners';

/**
 * Initialize the component libary.
 */
export { useVariantChat } from './lib/VariantChat';

/**
 * Push notification support.
 * registerPushNotificationToken - Tells the chat provider to send push notifications when a message is sent.
 * handlePushNotification - Call when the host app receives a push notification to allow this package to attempt to
 * handle the payload.
 */
export { registerPushNotificationToken } from './lib/VariantChat';
export { handlePushNotification } from './lib/VariantChat';

/**
 * Provides the user interface component.
 */
export { VariantChat } from './components/VariantChat';

/**
 * Provides Variant chat event handling.
 */
export { EventRegister as VariantChatEvent };

/**
 * Provides the necessary integration of Variant chat into your redux store.
 */
export { VariantChatState } from './types/VariantChatState';
export {
  initialVariantChatState,
  variantChatReducer,
} from './store/slices/chat/chat';
