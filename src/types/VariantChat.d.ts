export interface ChatProviderConfig {
  appId: string;
  appKey: string;
  baseUrl: string;
  accessToken: string;
  channelName: string;
}

export interface VariantApiConfig {
  accessToken: Function; // Returns a promise for the token
  url: string;
}

export interface VariantConfig {
  chat: ChatProviderConfig;
  api: VariantApiConfig;
  onError?: (message: string) => void;
  onMessageReceivedBackground?: (message: string) => void;
}

export interface VariantChatProps {
  channelName: string;
  theme: ReactNativePaper.Theme;
  defaultAvatarUrl: string;
  onError?: (message: string) => void;
  onMessageReceivedBackground?: (message: string) => void;
}
