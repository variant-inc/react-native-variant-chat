import { VariantChatStyles } from './VariantChatStyles.type';

export interface ChatProviderConfig {
  baseUrl: string;
  accessToken: string;
  appId: string;
  appKey: string;
  channelNames: string[];
}

export interface VariantApiConfig {
  accessToken: () => Promise<string | null>;
  url: string;
}

export interface ChatCapabilities {
  messagePolling: {
    Driving: number;
    OnDuty: number;
    OffDuty: number;
    SleeperBerth: number;
    Unknown: number;
  };
}

export interface VariantChatConfig {
  chatProvider: ChatProviderConfig;
  variantApi: VariantApiConfig;
  capabilities?: ChatCapabilities;
}

export interface VariantChatProps {
  channelName: string;
  defaultAvatarUrl?: string;
  NoConversationComponent?: JSX.Element;
  UrgentMessageComponent?: JSX.Element;
  chatStyles?: VariantChatStyles;
}
