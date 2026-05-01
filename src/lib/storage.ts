import { User, Post, Comment } from '../types';

const KEYS = {
  USERS: 'cv_users',
  POSTS: 'cv_posts',
  COMMENTS: 'cv_comments',
  CURRENT_USER: 'cv_current_user'
};

const SEED_POSTS: Post[] = [
  {
    id: '1',
    type: 'news',
    mediaType: 'image',
    title: 'University Library Extends Hours',
    content: 'Good news! The library will now be open until midnight during finals week to support student studying.',
    mediaUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=800&q=80',
    authorId: 'admin1',
    authorName: 'Admin',
    createdAt: Date.now() - 86400000,
    likes: []
  },
  {
    id: '2',
    type: 'announcement',
    mediaType: 'text',
    title: 'Upcoming Student Elections',
    content: 'Nominations for the Student Council are now open. Visit the student center for details.',
    authorId: 'admin1',
    authorName: 'Admin',
    createdAt: Date.now() - 172800000,
    likes: []
  },
  {
    id: '3',
    type: 'forum',
    mediaType: 'text',
    title: 'Welcome to the Campus Forum!',
    content: 'This is a space for everyone to discuss campus life. Feel free to introduce yourself!',
    authorId: 'admin1',
    authorName: 'Admin',
    createdAt: Date.now() - 3600000,
    likes: []
  }
];

export const storage = {
  // Auth
  getUsers: (): User[] => {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    if (users.length === 0) {
      const defaultAdmin: User = { 
        id: 'admin1', 
        username: 'admin', 
        password: 'password', 
        role: 'admin', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' 
      };
      localStorage.setItem(KEYS.USERS, JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    return users;
  },
  saveUser: (user: User) => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  // Posts
  getPosts: (): Post[] => {
    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]');
    if (posts.length === 0) {
      localStorage.setItem(KEYS.POSTS, JSON.stringify(SEED_POSTS));
      return SEED_POSTS;
    }
    return posts;
  },
  savePost: (post: Post) => {
    const posts = storage.getPosts();
    posts.unshift(post);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },
  updatePost: (id: string, updates: Partial<Post>) => {
    const posts = storage.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
  },
  deletePost: (id: string) => {
    const posts = storage.getPosts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },

  // Likes
  toggleLike: (postId: string, userId: string) => {
    const posts = storage.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      const liked = post.likes.includes(userId);
      if (liked) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
      }
      localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
  },

  // Comments
  getComments: (postId: string): Comment[] => {
    const comments: Comment[] = JSON.parse(localStorage.getItem(KEYS.COMMENTS) || '[]');
    return comments.filter(c => c.postId === postId);
  },
  addComment: (comment: Comment) => {
    const comments: Comment[] = JSON.parse(localStorage.getItem(KEYS.COMMENTS) || '[]');
    comments.push(comment);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
  }
};
