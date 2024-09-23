export type UserType = {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
};

export type ListingType = {
  created_at: string;
  creator_id: string;
  id: number;
  listing_id: string;
  phone_number1: string;
  thumbnail_url: string;
  title: string;
  users: UserType;
  description?: string;
};

export type FavoriteType = {
  id: string;
  listing_id: string;
  user_id: string;
};
