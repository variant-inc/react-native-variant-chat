class FreshchatBadStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FreshchatBadStatus';
  }
}

class FreshchatCommunicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FreshchatCommunicationError';
  }
}

export { FreshchatBadStatus, FreshchatCommunicationError };
