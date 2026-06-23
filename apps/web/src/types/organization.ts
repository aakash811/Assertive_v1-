export type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};
