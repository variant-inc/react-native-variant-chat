export interface VariantChatConfig {
  chatAppId: string;
  chatAppKey: string;
  chatBaseUrl: string;
  chatAccessToken: string;
}

export interface VariantChatProps {
  config: VariantChatConfig;
  driverId: string;
  theme: ReactNativePaper.Theme;
  defaultAvatarUrl: string;
}
