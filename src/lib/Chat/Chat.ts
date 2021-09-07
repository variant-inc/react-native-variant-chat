import {VariantChatConfig} from 'types/VariantChat';
import {initFreshchat} from '../Freshchat/Freshchat';

export async function initChat(config: VariantChatConfig): Promise<void> {
  initFreshchat({
    freshchatAppId: config.chatAppId,
    freshchatAppKey: config.chatAppKey,
    freshchatBaseUrl: config.chatBaseUrl,
    freshchatAccessToken: config.chatAccessToken,
  });
}
