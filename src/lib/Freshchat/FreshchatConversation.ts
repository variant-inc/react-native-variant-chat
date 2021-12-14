import {
  DriverConversationQueryResponse,
  GET_DRIVER_CONVERSATION,
} from '../../graphql/queries/getDriverConversation';
import { useApolloClient } from '../../hooks/useApolloClient';
import { FreshchatConversationResponse } from '../../types/FreshchatConversationResponse.type';

export async function getFreshchatConversations(
  currentDriverId: string
): Promise<FreshchatConversationResponse | null> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const apolloClient = useApolloClient();

  try {
    if (apolloClient) {
      const { data } =
        await apolloClient.query<DriverConversationQueryResponse>({
          query: GET_DRIVER_CONVERSATION,
          variables: { driverId: currentDriverId },
        });

      const conversations: FreshchatConversationResponse =
        data?.driver?.conversations ?? null;

      return conversations?.conversations ? conversations : null;
    }
  } catch {
    // Error emitted by ApolloClient
  }

  return null;
}
