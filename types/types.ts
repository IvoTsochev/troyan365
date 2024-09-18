export type UserType = {
  id: string;
  email: string;
  username: string;
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
};
