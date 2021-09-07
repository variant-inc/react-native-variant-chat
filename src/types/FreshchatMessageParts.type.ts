export type FreshchatMessageParts = {
  text: {
    content: string;
  };
  image?: {
    url: string;
  };
  file?: {
    name: string;
    url: string;
    content_type: string;
  };
};
