import {useApolloClient} from '../../hooks/useApolloClient';
import {useFreshchatInit} from '../../hooks/useFreshchat';
import {VariantConfig} from '../../types/VariantChat';

export const initVariantChat = (driverId: string, channel: string, config: VariantConfig): void => {
  useApolloClient(config.api);
  useFreshchatInit(driverId, channel, config.chat);
};
