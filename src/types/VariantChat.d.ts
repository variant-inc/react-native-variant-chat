export interface ChatProviderConfig {
  appId: string;
  appKey: string;
  baseUrl: string;
  accessToken: string;
  channelNames: [string];
}

export interface VariantApiConfig {
  accessToken: Function; // Returns a promise for the token
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
}
