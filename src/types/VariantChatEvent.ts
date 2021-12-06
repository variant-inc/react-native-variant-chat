import { EventMessageType } from './EventMessageType.enum';

export interface VariantChatEventType {
  type: EventMessageType;
  data: Record<string, unknown>;
}
