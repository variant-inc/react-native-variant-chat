import {
  DriverConversationQueryResponse,
  GET_DRIVER_CONVERSATION,
} from '../../graphql/queries/getDriverConversation';
import { useApolloClient } from '../../hooks/useApolloClient';
import { FreshchatConversationInfo } from '../../types/FreshchatConversationInfo';

export async function getFreshchatConversations(
  currentDriverId: string
): Promise<FreshchatConversationInfo | null> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const apolloClient = useApolloClient();

  if (apolloClient) {
    const { data } = await apolloClient.query<DriverConversationQueryResponse>({
      query: GET_DRIVER_CONVERSATION,
      variables: { driverId: currentDriverId },
    });

    return data?.driver?.conversations ?? null;
  }

  return null;
}
