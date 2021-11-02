interface Subscribers {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: { (data: any): void }[];
}

export interface Event {
  name: string;
  data: string;
}

export interface EventOptions {
  once?: boolean;
}

const subscribers: Subscribers = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publish(eventName: string, data: any | null): boolean {
  if (!Array.isArray(subscribers[eventName])) {
    return false;
  }

  subscribers[eventName].forEach((callback: (event: Event) => void) => {
    callback({ name: eventName, data });
  });
  return true;
}

export function subscribe(
  eventName: string,
  callback: (event: Event) => void,
  opts: EventOptions = {}
): { unsubscribe(): void } {
  if (!Array.isArray(subscribers[eventName])) {
    subscribers[eventName] = [];
  }

  let index = 0;
  if ((opts.once && subscribers[eventName].length === 0) || !opts.once) {
    subscribers[eventName].push(callback);
    index = subscribers[eventName].length - 1;
  }

  return {
    unsubscribe() {
      subscribers[eventName].splice(index, 1);
    },
  };
}
