export interface Post {
  id: string;
  userId: string;
  text: string;
  workoutId?: string;
  likes: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
}
