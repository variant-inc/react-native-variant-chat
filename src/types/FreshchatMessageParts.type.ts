export type FreshchatMessageParts = {
  text?: {
    content: string;
  };
  image?: {
    url: string;
  };
  file?: {
    name: string;
    url: string;
    file_size_in_bytes: number;
    content_type: string;
  };
};
