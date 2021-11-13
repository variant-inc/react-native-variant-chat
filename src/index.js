import { EventRegister } from 'react-native-event-listeners';

const VariantChatEvent = {
  addEventLister: EventRegister.addEventListener,
  removeEventListener: EventRegister.removeEventListener,
  removeAllListeners: EventRegister.removeAllListeners,
};

export { VariantChatEvent };
export { VariantChatState } from './types/VariantChatState';
export { VariantChat } from './components/VariantChat';
export { useVariantChat } from './lib/VariantChat';
export {
  initialVariantChatState,
  variantChatReducer,
} from './store/slices/chat/chat';
