interface User {
  _id: string;
  name: string;
  password: string;
  email: string;
  payment_method: string;
  banned: boolean;
  completed_trips: string[];
  user_id: string;
} 

export type {
  User,
};
