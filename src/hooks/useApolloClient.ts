import 'react-native-get-random-values';
import {useState} from 'react';

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import fetch from 'cross-fetch';
import {v4 as uuidv4} from 'uuid';
import {VariantApiConfig} from '../types/VariantChat';

const REQ_ID_HEADER = 'X-CORRELATION-ID';

export const useApolloClient = (apiConfig: VariantApiConfig | void): ApolloClient<NormalizedCacheObject> | void => {

  const [config, setConfig] = useState<VariantApiConfig>();

  const requestIdLink = setContext(async (_, {headers = {}}) => {
    headers[REQ_ID_HEADER] = uuidv4();
    return {
      headers,
    };
  });

  const errorLink = onError(({operation, graphQLErrors, networkError}) => {
    if (graphQLErrors) {
      graphQLErrors.map(({message}) => {
        if (
          !(
            operation.operationName === 'GetDriverStatus' &&
            message === 'Not authenticated'
          )
        ) {
          console.error(`GraphQL error: ${operation.operationName} - ${message}`);
        }
      });
    }
  
    if (networkError) {
      console.error(
        `GraphQL network error: ${operation.operationName} - ${networkError.message}`,
      );
    }
  });
  
  const authLink = setContext(async (_, {headers = {}}) => {
    headers.authorization = `Bearer ${config?.accessToken}`;
    return {
      headers,
    };
  });

  const httpLink = createHttpLink({
    uri: config?.url,
    fetch,
  });

  if (apiConfig) {
    setConfig(apiConfig);
  } else {
    return new ApolloClient({
      link: ApolloLink.from([requestIdLink, errorLink, authLink, httpLink]),
      cache: new InMemoryCache({}),
    });
  }
}
