import { VariantChatStyles } from './VariantChatStyles.type';

export interface ChatProviderConfig {
  baseUrl: string;
  accessToken: string;
  appId: string;
  appKey: string;
  channelNames: [string];
}

export interface VariantApiConfig {
  accessToken: () => Promise<string>;
  url: string;
}

export interface VariantChatConfig {
  chatProvider: ChatProviderConfig;
  variantApi: VariantApiConfig;
}

export interface VariantChatProps {
  channelName: string;
  defaultAvatarUrl: string;
  NoConversationComponent: JSX.Element;
  chatStyles?: VariantChatStyles;
}
