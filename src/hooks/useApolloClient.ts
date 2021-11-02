import 'react-native-get-random-values';

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import fetch from 'cross-fetch';
import { v4 as uuidv4 } from 'uuid';

import { VariantApiConfig } from '../types/VariantChat';

const REQ_ID_HEADER = 'X-CORRELATION-ID';
let configRef: VariantApiConfig;

export const useApolloClient = (
  apiConfig: VariantApiConfig | void
): ApolloClient<NormalizedCacheObject> | void => {
  const requestIdLink = setContext(async (_, { headers = {} }) => {
    headers[REQ_ID_HEADER] = uuidv4();
    return {
      headers,
    };
  });

  const errorLink = onError(({ operation, graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => {
        if (
          !(
            operation.operationName === 'GetDriverStatus' &&
            message === 'Not authenticated'
          )
        ) {
          console.error(
            `GraphQL error: ${operation.operationName} - ${message}`
          );
        }
      });
    }

    if (networkError) {
      console.error(
        `GraphQL network error: ${operation.operationName} - ${networkError.message}`
      );
    }
  });

  const authLink = setContext(async (_, { headers = {} }) => {
    const token = await configRef?.accessToken();
    headers.authorization = `Bearer ${token}`;
    return {
      headers,
    };
  });

  const httpLink = createHttpLink({
    uri: configRef?.url,
    fetch,
  });

  if (apiConfig) {
    configRef = apiConfig;
  }
  return new ApolloClient({
    link: ApolloLink.from([requestIdLink, errorLink, authLink, httpLink]),
    cache: new InMemoryCache({}),
  });
};
