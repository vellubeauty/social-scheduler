import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, LogOut, Instagram, Facebook, Linkedin } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthForm = ({ onAuth }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      if (isSignUp) {
        setError('Check your email to confirm your account!');
        setLoading(false);
      } else {
        onAuth(data.user);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Scheduler</h1>
          <p className="text-gray-600">Schedule smarter, not harder</p>
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

          {error && (
            <div className={`p-3 rounded-lg text-sm ${
              error.includes('Check your email') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 hover:text-purple-700 text-sm"
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({ posts, onSelectDate }) => {
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={previousMonth} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">←</button>
          <button onClick={nextMonth} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-600 py-2">{day}</div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = getPostsForDay(day);
          const isToday = new Date().getDate() === day && 
                         new Date().getMonth() === currentMonth.getMonth() &&
                         new Date().getFullYear() === currentMonth.getFullYear();

          return (
            <div
              key={day}
              onClick={() => onSelectDate(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
              className={`aspect-square border rounded-lg p-2 cursor-pointer hover:bg-purple-50 transition ${
                isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>{day}</div>
              {dayPosts.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, 2).map((post, idx) => (
                    <div key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded truncate">
                      {post.time} - {post.platform}
                    </div>
                  ))}
                  {dayPosts.length > 2 && <div className="text-xs text-gray-500">+{dayPosts.length - 2} more</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PostForm = ({ selectedDate, onSave, onCancel }) => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [time, setTime] = useState('09:00');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (content.trim()) {
      setSaving(true);
      await onSave({ date: selectedDate, time, platform, content, status: 'scheduled' });
      setSaving(false);
      setContent('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Post for {selectedDate}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <div className="flex gap-2">
              {[
                { value: 'instagram', icon: Instagram, label: 'Instagram' },
                { value: 'facebook', icon: Facebook, label: 'Facebook' },
                { value: 'linkedin', icon: Linkedin, label: 'LinkedIn' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setPlatform(value)}
                  disabled={saving}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 transition ${
                    platform === value ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
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
              rows="4"
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
              disabled={saving}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Schedule Post'}
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
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
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
              <h1 className="text-2xl font-bold text-gray-900">Social Scheduler</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                <LogOut size={18} />Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="text-purple-600" size={20} /></div>
              <h3 className="text-sm font-medium text-gray-600">Scheduled</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg"><Clock className="text-green-600" size={20} /></div>
              <h3 className="text-sm font-medium text-gray-600">This Week</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {posts.filter(p => {
                const postDate = new Date(p.date);
                const today = new Date();
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                return postDate >= today && postDate <= weekFromNow;
              }).length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg"><Instagram className="text-blue-600" size={20} /></div>
              <h3 className="text-sm font-medium text-gray-600">Platforms</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">3</p>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow p-6 hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2"
          >
            <Plus size={24} /><span className="text-lg font-medium">New Post</span>
          </button>
        </div>

        {loadingPosts ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading posts...</div>
          </div>
        ) : (
          <CalendarView posts={posts} onSelectDate={setSelectedDate} />
        )}

        {selectedDate && <PostForm selectedDate={selectedDate} onSave={handleSavePost} onCancel={() => setSelectedDate(null)} />}
      </div>
    </div>
  );
};

export default App;