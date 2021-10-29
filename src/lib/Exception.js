class FreshchatBadStatus extends Error {
  constructor(message) {
    super(message);
    this.name = 'FreshchatBadStatus';
    this.title = 'Freshchat bad status';
  }
}

class FreshchatCommunicationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FreshchatCommunicationError';
    this.title = 'Freshchat communication error';
  }
}

export {
  FreshchatBadStatus,
  FreshchatCommunicationError,
};