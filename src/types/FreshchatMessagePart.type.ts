export type FreshchatMessagePart = {
  text?: string;
  image?: string;
  video?: string;
  pdf?: string;
  audio?: string;
  urgent?: boolean;
  skip?: boolean;
};
