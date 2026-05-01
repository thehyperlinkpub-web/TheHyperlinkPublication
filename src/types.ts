
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

export type PostType = 'news' | 'announcement' | 'memorandum' | 'article' | 'forum';
export type MediaType = 'text' | 'image' | 'video';

export interface Post {
  id: string;
  type: PostType;
  mediaType: MediaType;
  title: string;
  content: string;
  mediaUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  likes: string[]; // array of userIds
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}
