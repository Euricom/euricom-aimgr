export interface Invite {
  id: string;
  email: string;
  status: 'accepted' | 'expired' | 'pending' | 'deleted';
  provider: string;
  invitedAt: Date;
  expiresAt: Date;
}
