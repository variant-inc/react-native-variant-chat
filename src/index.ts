import { EventRegister } from 'react-native-event-listeners';

import { DriverStatus } from './types/DriverStatus';

export * from './types/VariantChatEvent';
export * from './types/VariantChatState';
export type { VariantChatConfig } from './types/VariantChat';

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
 * Provides a remote synchonization of messages.
 */
export { syncMessages } from './lib/VariantChat';

/**
 * Provides the user interface component.
 */
export { VariantChat } from './components/VariantChat';

/**
 * Provides Variant chat event handling.
 */
export { EventRegister as VariantChatEvent };

/**
 * Provides Variant chat the driver status.
 */
export { DriverStatus };
export { setDriverStatus } from './lib/VariantChat';

/**
 * Provides the necessary integration of Variant chat into your redux store.
 */
export {
  initialVariantChatState,
  variantChatReducer,
} from './store/slices/chat/chat';
