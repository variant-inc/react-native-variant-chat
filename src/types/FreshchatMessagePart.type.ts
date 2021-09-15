export type FreshchatMessagePart = {
  text?: string;
  image?: string;
  video?: string;
  audio?: string;
  urgent?: boolean;
  skip?: boolean;
};
