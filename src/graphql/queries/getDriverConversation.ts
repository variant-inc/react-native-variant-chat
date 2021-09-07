import {gql} from '@apollo/client';

export interface DriverConversationQueryResponse {
  driver: {
    conversations: {
      driverId: string;
      userId: string;
      conversations: {
        id: string;
        channel: string;
      }[];
    };
  };
}

export const GET_DRIVER_CONVERSATION = gql`
  query GetDriverConversation($driverId: ID!) {
    driver(driverId: $driverId) {
      conversations {
        driverId
        userId
        conversations {
          id
          channel
        }
      }
    }
  }
`;
