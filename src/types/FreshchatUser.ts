export type FreshchatUserProperties = {
  name: string;
  value: string;
};

export type FreshchatUser = {
  reference_id?: string;
  created_time?: string;
  updated_time?: string;
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar: {
    url: string;
  };
  properties?: FreshchatUserProperties[];
};
