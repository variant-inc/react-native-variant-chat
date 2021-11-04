import React, { ReactElement } from 'react';

import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  return <Chat {...props} />;
};
