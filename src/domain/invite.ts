export interface Invite {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  provider: string;
}
