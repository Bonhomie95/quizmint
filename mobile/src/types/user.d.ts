export interface User {
  _id?: string;
  username: string;
  avatar: string;
  coins: number;
  highScore: number;
  streak: number;
  allTimePoints?: number;
  wallet?: string;
  uuid?: string; // For mobile users
  pinHash?: string; // For users with PIN protection
}
export interface UserWithPin extends User {
  pinHash: string;
  wallet: string;
}