interface User {
    name: string;
    payment_method: string;
    banned: boolean;
    completed_trips: string[];
    user_id: string;
    balance: number
}

interface UserDetailsProps {
    data: User;
}
  
export type {
    User,
    UserDetailsProps
};
