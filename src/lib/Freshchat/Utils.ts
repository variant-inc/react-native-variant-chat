import { FreshchatMessage } from '../../types/FreshchatMessage';

export const filterNewMessages = (
  allMessages: FreshchatMessage[],
  currentMessages: FreshchatMessage[]
): FreshchatMessage[] => {
  const newMessages: FreshchatMessage[] = [];

  currentMessages.forEach((message: FreshchatMessage) => {
    const findIndex = allMessages.findIndex(
      (item: FreshchatMessage) => item.id === message.id
    );

    if (findIndex === -1) {
      newMessages.push(message);
    }
  });

  return newMessages;
};
