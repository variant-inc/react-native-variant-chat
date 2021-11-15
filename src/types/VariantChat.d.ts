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
  onError?: (message: string) => void;
  onMessageReceivedBackground?: (message: string) => void;
}

export interface VariantChatProps {
  channelName: string;
  theme: ReactNativePaper.Theme;
  defaultAvatarUrl: string;
  NoConversationComponent: JSX.Element;
}
