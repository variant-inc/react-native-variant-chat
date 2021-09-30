import React, { ReactElement } from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { PersistGate as ReduxPersistGate } from 'redux-persist/integration/react';

import { persistor, store } from '../store';
import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  return (
    <ReduxStoreProvider store={store}>
      <ReduxPersistGate loading={null} persistor={persistor}>
        <Chat {...props} />
      </ReduxPersistGate>
    </ReduxStoreProvider>
  );
};
