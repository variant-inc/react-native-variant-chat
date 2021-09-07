import Chat from './Chat';
import React, {ReactElement} from 'react';
import {persistor, store} from 'store';
import {PersistGate as ReduxPersistGate} from 'redux-persist/integration/react';
import {Provider as ReduxStoreProvider} from 'react-redux';
import {VariantChatProps} from '../types/VariantChat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  return (
    <ReduxStoreProvider store={store}>
      <ReduxPersistGate loading={null} persistor={persistor}>
        <Chat {...props} />
      </ReduxPersistGate>
    </ReduxStoreProvider>
  )
}
