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

export type Invitation = {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};
