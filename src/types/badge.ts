export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
}
