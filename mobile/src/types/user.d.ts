export interface User {
  _id?: string;
  username: string;
  avatar: string;
  coins: number;
  highScore: number;
  streak: number;
  allTimePoints?: number;
  wallet?: string;
  pin?: string; // For users with PIN protection
  uuid?: string; // For mobile users
  pinHash?: string; // For users with PIN protection
  tier?: {
    level: number;
    emoji: string;
    color: string;
  };}
export interface UserWithPin extends User {
  pinHash: string;
  wallet: string;
}