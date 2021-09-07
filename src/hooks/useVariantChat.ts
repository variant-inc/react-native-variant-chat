import {useFreshchatInit} from './useFreshchat';
import {VariantChatConfig} from 'types/VariantChat';

export const useVariantChatInit = (driverId: string, channel: string, config: VariantChatConfig): void => {
  useFreshchatInit(driverId, channel, config);
};
