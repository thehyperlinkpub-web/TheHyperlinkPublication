import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Megaphone, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Plus, 
  LogOut, 
  User as UserIcon,
  ThumbsUp,
  MessageCircle,
  Trash2,
  Edit2,
  Video as VideoIcon
} from 'lucide-react';
import { User, Post, PostType, Comment } from './types';
import { storage } from './lib/storage';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }: any) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "hover:bg-gray-100 text-gray-600"
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
      {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState<PostType>('news');
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Auth States
  const [authData, setAuthData] = useState({ username: '', password: '', role: 'user' as any });

  useEffect(() => {
    refreshPosts();
  }, []);

  const refreshPosts = () => {
    setPosts(storage.getPosts());
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const users = storage.getUsers();
      const found = users.find(u => u.username === authData.username && u.password === authData.password);
      if (found) {
        storage.setCurrentUser(found);
        setUser(found);
      } else {
        alert('Invalid credentials');
      }
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: authData.username,
        password: authData.password,
        role: authData.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.username}`
      };
      storage.saveUser(newUser);
      storage.setCurrentUser(newUser);
      setUser(newUser);
    }
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setUser(null);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const postData: any = Object.fromEntries(formData);
    
    if (editingPost) {
      storage.updatePost(editingPost.id, {
        title: postData.title,
        content: postData.content,
        type: postData.type,
        mediaType: postData.mediaType,
        mediaUrl: postData.mediaUrl
      });
    } else {
      const newPost: Post = {
        id: Math.random().toString(36).substr(2, 9),
        title: postData.title,
        content: postData.content,
        type: postData.type,
        mediaType: postData.mediaType,
        mediaUrl: postData.mediaUrl,
        authorId: user!.id,
        authorName: user!.username,
        createdAt: Date.now(),
        likes: []
      };
      storage.savePost(newPost);
    }
    
    setShowPostModal(false);
    setEditingPost(null);
    refreshPosts();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Newspaper className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CampusVoice</h1>
            <p className="text-gray-500 mt-2">Connecting Campus Communities</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <Input 
              label="Username" 
              value={authData.username} 
              onChange={(e: any) => setAuthData({...authData, username: e.target.value})}
              required 
            />
            <Input 
              label="Password" 
              type="password"
              value={authData.password} 
              onChange={(e: any) => setAuthData({...authData, password: e.target.value})}
              required 
            />
            {!isLogin && (
              <Select 
                label="Join as" 
                value={authData.role}
                onChange={(e: any) => setAuthData({...authData, role: e.target.value})}
                options={[
                  { label: 'Student User', value: 'user' },
                  { label: 'System Admin', value: 'admin' }
                ]}
              />
            )}
            <Button type="submit" className="w-full h-12 text-lg">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const filteredPosts = posts.filter(p => p.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Newspaper className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                CampusVoice
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                <img src={user.avatar} className="w-7 h-7 rounded-full bg-gray-200" />
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full uppercase font-bold">
                  {user.role}
                </span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar">
            {[
              { id: 'news', icon: Newspaper, label: 'News' },
              { id: 'announcement', icon: Megaphone, label: 'Announcements' },
              { id: 'memorandum', icon: FileText, label: 'Memorandums' },
              { id: 'article', icon: BookOpen, label: 'Articles' },
              { id: 'forum', icon: MessageSquare, label: 'Forum' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PostType)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                `}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Posts</p>
              <p className="text-2xl font-black text-blue-600">{posts.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Forum Topics</p>
              <p className="text-2xl font-black text-indigo-600">{posts.filter(p => p.type === 'forum').length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">System Status</p>
              <p className="text-sm font-bold text-green-500 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live & Online
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Admin Action</p>
              <button 
                onClick={() => { setEditingPost(null); setShowPostModal(true); }}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Create Global Post +
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {activeTab} {activeTab === 'news' ? 'Feed' : 'Section'}
          </h2>
          {(user.role === 'admin' || activeTab === 'forum') && (
            <Button onClick={() => { setEditingPost(null); setShowPostModal(true); }}>
              <Plus className="w-5 h-5" />
              {activeTab === 'forum' ? 'New Topic' : 'Create Post'}
            </Button>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="text-gray-300 w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something with the campus!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={user}
                onEdit={() => { setEditingPost(post); setShowPostModal(true); }}
                onDelete={() => { storage.deletePost(post.id); refreshPosts(); }}
                onRefresh={refreshPosts}
              />
            ))}
          </div>
        )}
      </main>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSavePost} className="p-6 space-y-4">
              <Select 
                label="Category" 
                name="type" 
                defaultValue={editingPost?.type || activeTab}
                options={user.role === 'admin' ? [
                  { label: 'News', value: 'news' },
                  { label: 'Announcement', value: 'announcement' },
                  { label: 'Memorandum', value: 'memorandum' },
                  { label: 'Article', value: 'article' },
                  { label: 'Forum', value: 'forum' }
                ] : [
                  { label: 'Forum', value: 'forum' }
                ]}
              />
              <Input label="Title" name="title" defaultValue={editingPost?.title} required />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea 
                  name="content" 
                  rows={4} 
                  defaultValue={editingPost?.content}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Media Type" 
                  name="mediaType" 
                  defaultValue={editingPost?.mediaType || 'text'}
                  options={[
                    { label: 'Text Only', value: 'text' },
                    { label: 'Image', value: 'image' },
                    { label: 'Video URL', value: 'video' }
                  ]}
                />
                <Input 
                  label="Media URL (Optional)" 
                  name="mediaUrl" 
                  defaultValue={editingPost?.mediaUrl}
                  placeholder="https://..." 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Post Card Component ---

function PostCard({ post, currentUser, onEdit, onDelete, onRefresh }: { 
  post: Post, 
  currentUser: User, 
  onEdit: () => void, 
  onDelete: () => void,
  onRefresh: () => void
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const isLiked = post.likes.includes(currentUser.id);

  useEffect(() => {
    if (showComments) {
      setComments(storage.getComments(post.id));
    }
  }, [showComments, post.id]);

  const handleLike = () => {
    storage.toggleLike(post.id, currentUser.id);
    onRefresh();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId: post.id,
      userId: currentUser.id,
      userName: currentUser.username,
      content: commentText,
      createdAt: Date.now()
    };

    storage.addComment(newComment);
    setComments([...comments, newComment]);
    setCommentText('');
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Media Content */}
      {post.mediaType === 'image' && post.mediaUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      {post.mediaType === 'video' && post.mediaUrl && (
        <div className="aspect-video w-full bg-black flex items-center justify-center">
          <VideoIcon className="text-white w-12 h-12 opacity-50" />
          <p className="absolute text-white text-xs mt-16">Video Content</p>
        </div>
      )}

      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
            {post.type}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {(currentUser.role === 'admin' || currentUser.id === post.authorId) && (
              <div className="flex items-center ml-2 border-l pl-2 gap-2">
                <button onClick={onEdit} className="text-blue-500 hover:text-blue-700">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={onDelete} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {post.content}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
            <UserIcon className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-medium text-gray-700">{post.authorName}</span>
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600' : ''}`} />
            {post.likes.length}
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Comments
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
            <div className="max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-gray-700">{c.userName}</span>
                      <span className="text-[9px] text-gray-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-gray-600">{c.content}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Write a comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit"
                disabled={!commentText.trim()}
                className="bg-blue-600 text-white p-1.5 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
