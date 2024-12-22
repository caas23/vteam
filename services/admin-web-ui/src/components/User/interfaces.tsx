interface User {
  _id: string;
  name: string;
  payment_method: string;
  banned: boolean;
  completed_trips: string[];
  user_id: string;
} 

interface UserDetailsProps {
  data: User;
}

export type {
  User,
  UserDetailsProps
};
