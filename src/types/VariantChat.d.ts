export interface VariantChatConfig {
  appId: string;
  appKey: string;
  baseUrl: string;
  accessToken: string;
  channelName: string;
}

export interface VariantApiConfig {
  accessToken: string;
  url: string;
}

export interface VariantConfig {
  chat: VariantChatConfig;
  api: VariantApiConfig;
}

export interface VariantChatProps {
  config: VariantConfig;
  driverId: string;
  theme: ReactNativePaper.Theme;
  defaultAvatarUrl: string;
}
