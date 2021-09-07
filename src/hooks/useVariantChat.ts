import {useApolloClient} from './useApolloClient';
import {useFreshchatInit} from './useFreshchat';
import {VariantConfig} from '../types/VariantChat';

export const useVariantChatInit = (driverId: string, channel: string, config: VariantConfig): void => {
  useApolloClient(config.api);
  useFreshchatInit(driverId, channel, config.chat);
};
