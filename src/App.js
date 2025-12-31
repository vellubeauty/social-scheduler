import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, LogOut, Instagram, Facebook, Linkedin, Edit2, Trash2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthForm = ({ onAuth }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    if (!isForgotPassword && !password) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        setSuccess('Check your email for password reset link!');
        setLoading(false);
      } else {
        const { data, error } = isSignUp 
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
        
        if (isSignUp) {
          setSuccess('Check your email to confirm your account!');
          setLoading(false);
        } else {
          onAuth(data.user);
        }
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vellu</h1>
          <p className="text-gray-600">
            {isForgotPassword ? 'Reset your password' : 'Schedule smarter, not harder'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">{success}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In'))}
          </button>
        </div>

        <div className="mt-4 text-center space-y-2">
          {!isForgotPassword && (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="block w-full text-purple-600 hover:text-purple-700 text-sm"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          )}
          
          <button
            onClick={() => {
              setIsForgotPassword(!isForgotPassword);
              setError('');
              setSuccess('');
            }}
            className="block w-full text-gray-600 hover:text-gray-700 text-sm"
            disabled={loading}
          >
            {isForgotPassword ? 'Back to sign in' : 'Forgot password?'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DayPostsModal = ({ date, posts, onClose, onEdit, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Posts for {date}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No posts scheduled for this day</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {post.platform === 'instagram' && <Instagram size={18} className="text-pink-500" />}
                    {post.platform === 'facebook' && <Facebook size={18} className="text-blue-500" />}
                    {post.platform === 'linkedin' && <Linkedin size={18} className="text-blue-700" />}
                    <span className="font-medium capitalize">{post.platform}</span>
                    <span className="text-sm text-gray-500">at {post.time}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(post)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(post.id)}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CalendarView = ({ posts, onSelectDate, onViewDayPosts }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getPostsForDay = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(post => post.date === dateStr);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={previousMonth} className="px-3 md:px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm md:text-base">←</button>
          <button onClick={nextMonth} className="px-3 md:px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm md:text-base">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-600 py-2 text-xs md:text-sm">{day}</div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = getPostsForDay(day);
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = new Date().getDate() === day && 
                         new Date().getMonth() === currentMonth.getMonth() &&
                         new Date().getFullYear() === currentMonth.getFullYear();

          return (
            <div
              key={day}
              onClick={() => dayPosts.length > 0 ? onViewDayPosts(dateStr, dayPosts) : onSelectDate(dateStr)}
              className={`aspect-square border rounded-lg p-1 md:p-2 cursor-pointer hover:bg-purple-50 transition ${
                isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>{day}</div>
              {dayPosts.length > 0 && (
                <div className="mt-1">
                  <div className="text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-center">
                    {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PostForm = ({ selectedDate, editingPost, onSave, onCancel }) => {
  const [content, setContent] = useState(editingPost?.content || '');
  const [platforms, setPlatforms] = useState(editingPost ? [editingPost.platform] : ['instagram']);
  const [time, setTime] = useState(editingPost?.time || '09:00');
  const [saving, setSaving] = useState(false);

  const togglePlatform = (platform) => {
    if (platforms.includes(platform)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(p => p !== platform));
      }
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleSubmit = async () => {
    if (content.trim() && platforms.length > 0) {
      setSaving(true);
      
      if (editingPost) {
        await onSave({ ...editingPost, content, time, platform: platforms[0] });
      } else {
        for (const platform of platforms) {
          await onSave({ date: selectedDate, time, platform, content, status: 'scheduled' });
        }
      }
      
      setSaving(false);
      setContent('');
      setPlatforms(['instagram']);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {editingPost ? 'Edit Post' : `Schedule Post for ${selectedDate}`}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform{!editingPost && 's'} {!editingPost && <span className="text-gray-500">(select multiple)</span>}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'instagram', icon: Instagram, label: 'Instagram' },
                { value: 'facebook', icon: Facebook, label: 'Facebook' },
                { value: 'linkedin', icon: Linkedin, label: 'LinkedIn' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => togglePlatform(value)}
                  disabled={saving || editingPost}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition ${
                    platforms.includes(value) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'
                  } ${editingPost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="6"
              placeholder="What do you want to post?"
            />
            <div className="text-sm text-gray-500 mt-1">{content.length} characters</div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onCancel} 
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={saving || !content.trim() || platforms.length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : (editingPost ? 'Update Post' : 'Schedule')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewingDayPosts, setViewingDayPosts] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoadingPosts(false);
  };

  const handleSavePost = async (post) => {
    if (editingPost) {
      const { error } = await supabase
        .from('posts')
        .update({ content: post.content, time: post.time, platform: post.platform })
        .eq('id', editingPost.id);

      if (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please try again.');
      } else {
        await loadPosts();
        setEditingPost(null);
        setSelectedDate(null);
        setViewingDayPosts(null);
      }
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...post, user_id: user.id }])
        .select();

      if (error) {
        console.error('Error saving post:', error);
        alert('Failed to save post. Please try again.');
      } else {
        setPosts([...posts, data[0]]);
        setSelectedDate(null);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } else {
      await loadPosts();
      setViewingDayPosts(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPosts([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-purple-600" size={28} />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Vellu</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm text-gray-600 truncate max-w-[120px] md:max-w-none">{user.email}</span>
              <button onClick={handleSignOut} className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm">
                <LogOut size={16} /><span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="text-purple-600" size={16} /></div>
              <h3 className="text-xs md:text-sm font-medium text-gray-600">Scheduled</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{posts.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg"><Clock className="text-green-600" size={16} /></div>
              <h3 className="text-xs md:text-sm font-medium text-gray-600">This Week</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {posts.filter(p => {
                const postDate = new Date(p.date);
                const today = new Date();
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                return postDate >= today && postDate <= weekFromNow;
              }).length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg"><Instagram className="text-blue-600" size={16} /></div>
              <h3 className="text-xs md:text-sm font-medium text-gray-600">Platforms</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">3</p>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow p-4 md:p-6 hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2 col-span-2 lg:col-span-1"
          >
            <Plus size={20} /><span className="text-base md:text-lg font-medium">New Post</span>
          </button>
        </div>

        {loadingPosts ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading posts...</div>
          </div>
        ) : (
          <CalendarView 
            posts={posts} 
            onSelectDate={setSelectedDate}
            onViewDayPosts={(date, dayPosts) => setViewingDayPosts({ date, posts: dayPosts })}
          />
        )}

        {selectedDate && !editingPost && (
          <PostForm 
            selectedDate={selectedDate} 
            onSave={handleSavePost} 
            onCancel={() => setSelectedDate(null)} 
          />
        )}

        {editingPost && (
          <PostForm 
            selectedDate={editingPost.date}
            editingPost={editingPost}
            onSave={handleSavePost} 
            onCancel={() => {
              setEditingPost(null);
              setSelectedDate(null);
            }} 
          />
        )}

        {viewingDayPosts && (
          <DayPostsModal
            date={viewingDayPosts.date}
            posts={viewingDayPosts.posts}
            onClose={() => setViewingDayPosts(null)}
            onEdit={(post) => {
              setEditingPost(post);
              setViewingDayPosts(null);
            }}
            onDelete={handleDeletePost}
          />
        )}
      </div>
    </div>
  );
};

export default App;