import {
  DriverConversationQueryResponse,
  GET_DRIVER_CONVERSATION,
} from 'graphql/queries/getDriverConversation';
import {apolloClient} from 'lib/apolloClient';

import {FreshchatConversationResponse} from '../../types/FreshchatConversationResponse.type';

export async function getFreshchatConversations(
  currentDriverId: string,
): Promise<FreshchatConversationResponse | null> {
  try {
    const {data} = await apolloClient.query<DriverConversationQueryResponse>({
      query: GET_DRIVER_CONVERSATION,
      variables: {driverId: currentDriverId},
    });

    const conversations: FreshchatConversationResponse =
      data?.driver?.conversations ?? null;
    return conversations;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    //log.error('Freshchat Conversations Error: ' + error.message);
    throw error; // Rethrow for caller to handle bad network request.
  }
}
