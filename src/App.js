import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, LogOut, Instagram, Facebook, Linkedin, Edit2, Trash2, X, Youtube, Video, Cloud, Upload, Image as ImageIcon, Sparkles, RefreshCw, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';
const groqApiKey = process.env.REACT_APP_GROQ_API_KEY || '';
const linkedinClientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID || '';
const linkedinRedirectUri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI || 'http://localhost:3000/auth/linkedin/callback';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PLATFORMS = [
  { value: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-500', limit: 2200 },
  { value: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-500', limit: 63206 },
  { value: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700', limit: 3000 },
  { value: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-500', limit: 5000 },
  { value: 'tiktok', icon: Video, label: 'TikTok', color: 'text-black', limit: 2200 },
  { value: 'twitter', icon: Cloud, label: 'X (Twitter)', color: 'text-gray-900', limit: 280 },
  { value: 'bluesky', icon: Cloud, label: 'Bluesky', color: 'text-blue-400', limit: 300 },
  { value: 'threads', icon: Cloud, label: 'Threads', color: 'text-gray-700', limit: 500 },
];

const generateCaption = async (topic, platform, tone) => {
  if (!groqApiKey) {
    throw new Error('Groq API key not configured');
  }

  const platformInfo = PLATFORMS.find(p => p.value === platform);
  const charLimit = platformInfo?.limit || 2200;

  const toneDescriptions = {
    professional: 'professional and business-appropriate',
    casual: 'casual and friendly',
    funny: 'humorous and entertaining',
    inspirational: 'motivational and uplifting',
    sales: 'persuasive and sales-focused'
  };

  const prompt = `Write a ${toneDescriptions[tone]} social media caption for ${platformInfo?.label || platform} about: ${topic}

Requirements:
- Must be under ${charLimit} characters
- Include relevant emojis
- Add 3-5 relevant hashtags at the end
- Make it engaging and likely to get interactions
- Match the tone: ${tone}

Just write the caption directly, no explanations or extra text.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert who writes engaging captions. Always write concise, platform-appropriate content with emojis and hashtags.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate caption');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
};

const PasswordResetPage = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-6">Enter your new password</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleReset()}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

          <button
            onClick={onBack}
            disabled={loading}
            className="w-full text-gray-600 hover:text-gray-700 text-sm"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

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
          redirectTo: window.location.origin + '#reset-password',
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

const TrashBin = ({ deletedPosts, onRestore, onPermanentDelete, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Trash Bin</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {deletedPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Trash is empty</p>
        ) : (
          <div className="space-y-3">
            {deletedPosts.map((post) => {
              const platform = PLATFORMS.find(p => p.value === post.platform);
              const Icon = platform?.icon || Cloud;
              
              return (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={18} className={platform?.color} />
                      <span className="font-medium capitalize">{post.platform}</span>
                      <span className="text-sm text-gray-500">{post.date} at {post.time}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRestore(post.id)}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => onPermanentDelete(post.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                  {post.media_url && (
                    <div className="mb-2">
                      {post.media_type === 'video' ? (
                        <video src={post.media_url} className="max-w-xs rounded" controls />
                      ) : (
                        <img src={post.media_url} alt="Post media" className="max-w-xs rounded" />
                      )}
                    </div>
                  )}
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{post.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const DayPostsModal = ({ date, posts, onClose, onEdit, onDelete, onNewPost }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Posts for {date}</h3>
          <div className="flex gap-2">
            <button
              onClick={onNewPost}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              New Post
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No posts scheduled for this day</p>
            <button
              onClick={onNewPost}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Schedule a Post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const platform = PLATFORMS.find(p => p.value === post.platform);
              const Icon = platform?.icon || Cloud;
              
              return (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={18} className={platform?.color} />
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
                  {post.media_url && (
                    <div className="mb-2">
                      {post.media_type === 'video' ? (
                        <video src={post.media_url} className="max-w-full rounded" controls />
                      ) : (
                        <img src={post.media_url} alt="Post media" className="max-w-full rounded" />
                      )}
                    </div>
                  )}
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>
              );
            })}
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
              className={`aspect-square border rounded-lg p-1 cursor-pointer hover:bg-purple-50 transition ${
                isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className={`text-xs md:text-sm font-medium mb-1 ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>{day}</div>
              {dayPosts.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {dayPosts.slice(0, 3).map((post, idx) => {
                    const platform = PLATFORMS.find(p => p.value === post.platform);
                    const Icon = platform?.icon || Cloud;
                    return (
                      <div key={idx} className="flex items-center gap-0.5 bg-purple-100 rounded px-1 py-0.5">
                        <Icon size={10} className={platform?.color} />
                        <span className="text-[8px] text-gray-600">{post.time}</span>
                        {post.media_url && <ImageIcon size={8} className="text-purple-600" />}
                      </div>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-[8px] text-gray-500 px-1">+{dayPosts.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AICaptionGenerator = ({ platform, onInsert, onClose }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState('');
  const [error, setError] = useState('');

  const tones = [
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'casual', label: 'Casual', emoji: '😊' },
    { value: 'funny', label: 'Funny', emoji: '😄' },
    { value: 'inspirational', label: 'Inspirational', emoji: '✨' },
    { value: 'sales', label: 'Sales', emoji: '💰' }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setGenerating(true);
    setError('');
    setGenerated('');

    try {
      const caption = await generateCaption(topic, platform, tone);
      setGenerated(caption);
    } catch (err) {
      setError(err.message || 'Failed to generate caption');
    } finally {
      setGenerating(false);
    }
  };
  const LinkedInCallback = ({ onComplete }) => {
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        alert(`LinkedIn authorization failed: ${error}`);
        window.location.href = '/';
        return;
      }

      if (code) {
        try {
          // Call Edge Function to exchange code for token
          const response = await fetch(`${supabaseUrl}/functions/v1/linkedin-oauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              action: 'exchange_code',
              code: code,
            }),
          });

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          // Get current user
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            throw new Error('Not authenticated');
          }

          // Save to connected_accounts
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

          const { error: dbError } = await supabase
            .from('connected_accounts')
            .upsert({
              user_id: user.id,
              platform: 'linkedin',
              platform_user_id: data.profile.id,
              platform_username: data.profile.name,
              access_token: data.access_token,
              expires_at: expiresAt.toISOString(),
              profile_image_url: data.profile.picture,
            }, {
              onConflict: 'user_id,platform,platform_user_id'
            });

          if (dbError) throw dbError;

          alert('LinkedIn account connected successfully!');
          window.location.href = '/';
          
        } catch (error) {
          console.error('LinkedIn callback error:', error);
          alert(`Failed to connect LinkedIn: ${error.message}`);
          window.location.href = '/';
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900">Connecting LinkedIn...</h2>
        <p className="text-gray-600 mt-2">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            AI Caption Generator
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your post about?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., New product launch, Monday motivation, Behind the scenes..."
              disabled={generating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {tones.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setTone(value)}
                  disabled={generating}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 transition ${
                    tone === value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          {generated && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Generated Caption</span>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Regenerate
                </button>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{generated}</p>
              <div className="text-xs text-gray-500 mt-2">
                {generated.length} characters
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!generated ? (
              <button
                onClick={handleGenerate}
                disabled={generating || !topic.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Caption
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onInsert(generated);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Use This Caption
                </button>
                </>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center">
            Powered by Groq AI • Free forever
          </div>
        </div>
      </div>
    </div>
  );
};

const PostForm = ({ selectedDate, editingPost, onSave, onCancel, userId, connectedAccounts }) => {
  const [content, setContent] = useState(editingPost?.content || '');
  const [platforms, setPlatforms] = useState(editingPost ? [editingPost.platform] : ['instagram']);
  const [platformTimes, setPlatformTimes] = useState(
    editingPost 
      ? { [editingPost.platform]: editingPost.time }
      : { instagram: '09:00' }
  );
  const [saving, setSaving] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(editingPost?.media_url || null);
  const [mediaType, setMediaType] = useState(editingPost?.media_type || null);
  const [uploading, setUploading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const togglePlatform = (platform) => {
    if (platforms.includes(platform)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(p => p !== platform));
        const newTimes = { ...platformTimes };
        delete newTimes[platform];
        setPlatformTimes(newTimes);
      }
    } else {
      setPlatforms([...platforms, platform]);
      setPlatformTimes({
        ...platformTimes,
        [platform]: platformTimes[platforms[0]] || '09:00'
      });
    }
  };

  const updatePlatformTime = (platform, time) => {
    setPlatformTimes({
      ...platformTimes,
      [platform]: time
    });
  };

  const isConnected = (platform) => {
    return connectedAccounts.some(acc => acc.platform === platform);
  };

  // ... rest of the file select and upload functions stay the same ...

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Please select an image or video file');
      return;
    }

    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const uploadMedia = async () => {
    if (!mediaFile) return null;

    setUploading(true);
    
    try {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('post-media')
        .upload(fileName, mediaFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName);

      setUploading(false);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload media. Please try again.');
      setUploading(false);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (content.trim() && platforms.length > 0) {
      setSaving(true);
      
      let mediaUrl = mediaPreview;
      
      if (mediaFile) {
        mediaUrl = await uploadMedia();
        if (!mediaUrl) {
          setSaving(false);
          return;
        }
      }
      
      if (editingPost) {
        await onSave({ 
          ...editingPost, 
          content, 
          time: platformTimes[platforms[0]], 
          platform: platforms[0],
          media_url: mediaUrl,
          media_type: mediaType
        });
      } else {
        for (const platform of platforms) {
          const postData = { 
            date: selectedDate, 
            time: platformTimes[platform] || '09:00', 
            platform, 
            content, 
            status: 'scheduled',
            media_url: mediaUrl,
            media_type: mediaType
          };
          
          await onSave(postData);
        }
      }
      
      setSaving(false);
      setContent('');
      setPlatforms(['instagram']);
      setPlatformTimes({ instagram: '09:00' });
      setMediaFile(null);
      setMediaPreview(null);
    }
  };

  return (
    <>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PLATFORMS.map(({ value, icon: Icon, label }) => {
                  const connected = isConnected(value);
                  
                  return (
                    <button
                      key={value}
                      onClick={() => togglePlatform(value)}
                      disabled={saving || uploading || editingPost}
                      className={`relative flex items-center justify-center gap-1 py-2 px-2 rounded-lg border-2 transition ${
                        platforms.includes(value) 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${editingPost ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon size={16} />
                      <span className="text-xs font-medium">{label.split(' ')[0]}</span>
                      {connected && (
                        <CheckCircle size={12} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                      )}
                      {!connected && platforms.includes(value) && (
                        <AlertCircle size={12} className="absolute -top-1 -right-1 text-orange-500 bg-white rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              {platforms.some(p => !isConnected(p)) && (
                <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Selected platforms without connections will be scheduled but not auto-posted
                </div>
              )}
            </div>

            {!editingPost && platforms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Time{platforms.length > 1 ? 's' : ''}
                </label>
                <div className="space-y-2">
                  {platforms.map(platform => {
                    const platformInfo = PLATFORMS.find(p => p.value === platform);
                    const Icon = platformInfo?.icon || Cloud;
                    const connected = isConnected(platform);
                    
                    return (
                      <div key={platform} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-32">
                          <Icon size={16} className={platformInfo?.color} />
                          <span className="text-sm font-medium capitalize">{platform}</span>
                          {connected && <CheckCircle size={12} className="text-green-500" />}
                        </div>
                        <input
                          type="time"
                          value={platformTimes[platform] || '09:00'}
                          onChange={(e) => updatePlatformTime(platform, e.target.value)}
                          disabled={saving || uploading}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {editingPost && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={platformTimes[platforms[0]] || '09:00'}
                  onChange={(e) => updatePlatformTime(platforms[0], e.target.value)}
                  disabled={saving || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image or Video <span className="text-gray-500">(optional)</span>
              </label>
              
              {!mediaPreview ? (
                <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">Click to upload image or video</p>
                  <p className="text-xs text-gray-500 mt-1">Max 50MB</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    disabled={saving || uploading}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  {mediaType === 'video' ? (
                    <video src={mediaPreview} controls className="w-full rounded-lg" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full rounded-lg" />
                  )}
                  <button
                    onClick={removeMedia}
                    disabled={saving || uploading}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <button
                  onClick={() => setShowAI(true)}
                  disabled={saving || uploading}
                  className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition text-xs disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  AI Generate
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving || uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="6"
                placeholder="What do you want to post?"
              />
              <div className="text-sm text-gray-500 mt-1">{content.length} characters</div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onCancel} 
                disabled={saving || uploading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={saving || uploading || !content.trim() || platforms.length === 0}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : (saving ? 'Saving...' : (editingPost ? 'Update' : `Schedule (${platforms.length})`))}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAI && (
        <AICaptionGenerator
          platform={platforms[0]}
          onInsert={(caption) => setContent(caption)}
          onClose={() => setShowAI(false)}
        />
      )}
    </>
  );
};
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewingDayPosts, setViewingDayPosts] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showConnectedAccounts, setShowConnectedAccounts] = useState(false);

  useEffect(() => {
    // Check for LinkedIn callback
    if (window.location.pathname === '/auth/linkedin/callback') {
      return; // LinkedInCallback component will handle this
    }

    if (window.location.hash === '#reset-password') {
      setShowPasswordReset(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowPasswordReset(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadPosts();
      loadDeletedPosts();
      loadConnectedAccounts();
    }
  }, [user]);

  const loadConnectedAccounts = async () => {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading connected accounts:', error);
    } else {
      setConnectedAccounts(data || []);
    }
  };
const publishPost = async (postId) => {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const account = connectedAccounts.find(acc => acc.platform === post.platform);
  
  if (!account) {
    alert(`No ${post.platform} account connected. Please connect your account first.`);
    return;
  }

  try {
    // Update post status to publishing
    await supabase
      .from('posts')
      .update({ status: 'publishing' })
      .eq('id', postId);

    // Call the Edge Function to publish
    const { data, error } = await supabase.functions.invoke('publish-post', {
      body: {
        postId: postId,
        platform: post.platform,
        content: post.content,
        mediaUrl: post.media_url,
        accountId: account.id
      }
    });

    if (error) throw error;

    if (data.success) {
      // Update post status to published
      await supabase
        .from('posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId);

      alert('Post published successfully!');
      loadPosts();
    } else {
      throw new Error(data.error || 'Failed to publish');
    }
  } catch (error) {
    console.error('Publish error:', error);
    
    // Update post status back to scheduled
    await supabase
      .from('posts')
      .update({ status: 'scheduled' })
      .eq('id', postId);

    alert(`Failed to publish: ${error.message}`);
  }
};
  
  const togglePlatform = (platform) => {
    if (platforms.includes(platform)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(p => p !== platform));
        const newTimes = { ...platformTimes };
        delete newTimes[platform];
        setPlatformTimes(newTimes);
      }
    } else {
      setPlatforms([...platforms, platform]);
      setPlatformTimes({
        ...platformTimes,
        [platform]: platformTimes[platforms[0]] || '09:00'
      });
    }
  };

  const updatePlatformTime = (platform, time) => {
    setPlatformTimes({
      ...platformTimes,
      [platform]: time
    });
  };

  const isConnected = (platform) => {
    return connectedAccounts.some(acc => acc.platform === platform);
  };

  const loadDeletedPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'deleted')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading deleted posts:', error);
    } else {
      setDeletedPosts(data || []);
    }
  };

  const deleteMediaFile = async (mediaUrl) => {
    if (!mediaUrl) return;
    
    try {
      const path = mediaUrl.split('/post-media/')[1];
      if (path) {
        await supabase.storage.from('post-media').remove([path]);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

const handleSavePost = async (post) => {
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    console.log('Post data:', post);

    if (editingPost) {
      const { error } = await supabase
        .from('posts')
        .update({ 
          content: post.content, 
          time: post.time, 
          platform: post.platform,
          media_url: post.media_url,
          media_type: post.media_type
        })
        .eq('id', editingPost.id);

      if (error) {
        console.error('Error updating post:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        alert('Failed to update post. Please try again.');
      } else {
        await loadPosts();
        setEditingPost(null);
        setSelectedDate(null);
        setViewingDayPosts(null);
      }
    } else {
      if (!user || !user.id) {
        console.error('User is not logged in or user.id is missing');
        alert('User session error. Please log out and log back in.');
        return;
      }

      const postToInsert = { 
        ...post, 
        user_id: user.id 
      };

      console.log('Inserting post:', postToInsert);

      const { data, error } = await supabase
        .from('posts')
        .insert([postToInsert])
        .select();

      if (error) {
        console.error('Error saving post:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        alert(`Failed to save post: ${error.message}`);
      } else {
        console.log('Post saved successfully:', data);
        setPosts([...posts, data[0]]);
        setSelectedDate(null);
      }
    }
  };
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Move this post to trash?')) return;

    const { error } = await supabase
      .from('posts')
      .update({ status: 'deleted' })
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } else {
      await loadPosts();
      await loadDeletedPosts();
      setViewingDayPosts(null);
    }
  };

  const handleRestorePost = async (postId) => {
    const { error } = await supabase
      .from('posts')
      .update({ status: 'scheduled' })
      .eq('id', postId);

    if (error) {
      console.error('Error restoring post:', error);
      alert('Failed to restore post. Please try again.');
    } else {
      await loadPosts();
      await loadDeletedPosts();
    }
  };

  const handlePermanentDelete = async (postId) => {
    if (!window.confirm('Permanently delete this post? This cannot be undone.')) return;

    const post = deletedPosts.find(p => p.id === postId);
    
    if (post?.media_url) {
      await deleteMediaFile(post.media_url);
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error permanently deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } else {
      await loadDeletedPosts();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPosts([]);
    setDeletedPosts([]);
  };

  if (loading) {
   return (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
    {loading ? (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    ) : !user ? (
      <AuthForm />
    ) : (
      <>
        <Header 
          user={user} 
          onTrashClick={() => setShowTrash(true)}
          onAccountsClick={() => setShowConnectedAccounts(true)}
        />
        <Calendar
          posts={posts}
          onDateClick={setSelectedDate}
          onDayClick={setViewingDayPosts}
          userId={user.id}
        />

        {selectedDate && (
          <PostForm
            selectedDate={selectedDate}
            editingPost={editingPost}
            onSave={savePost}
            onCancel={() => {
              setSelectedDate(null);
              setEditingPost(null);
            }}
            userId={user.id}
            connectedAccounts={connectedAccounts}
          />
        )}

        {viewingDayPosts && (
          <DayView
            date={viewingDayPosts}
            posts={posts.filter(p => p.date === viewingDayPosts)}
            onClose={() => setViewingDayPosts(null)}
            onEdit={(post) => {
              setEditingPost(post);
              setSelectedDate(post.date);
              setViewingDayPosts(null);
            }}
            onDelete={deletePost}
            onPublish={publishPost}
            connectedAccounts={connectedAccounts}
          />
        )}
        const DayView = ({ date, posts, onClose, onEdit, onDelete, onPublish, connectedAccounts }) => {
  const sortedPosts = [...posts].sort((a, b) => a.time.localeCompare(b.time));

  const isConnected = (platform) => {
    return connectedAccounts.some(acc => acc.platform === platform);
  };

  const canPublish = (post) => {
    return post.status === 'scheduled' && isConnected(post.platform);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Posts for {date}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {sortedPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No posts scheduled for this day</p>
        ) : (
          <div className="space-y-4">
            {sortedPosts.map(post => {
              const platformInfo = PLATFORMS.find(p => p.value === post.platform);
              const Icon = platformInfo?.icon || Cloud;
              const connected = isConnected(post.platform);

              return (
                <div key={post.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={platformInfo?.color} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 capitalize">{post.platform}</span>
                          {connected ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <AlertCircle size={14} className="text-orange-500" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{post.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : post.status === 'publishing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>

                  {post.media_url && (
                    <div className="mb-3">
                      {post.media_type === 'video' ? (
                        <video src={post.media_url} controls className="w-full rounded-lg max-h-48 object-cover" />
                      ) : (
                        <img src={post.media_url} alt="Post media" className="w-full rounded-lg max-h-48 object-cover" />
                      )}
                    </div>
                  )}

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>

                  {!connected && (
                    <div className="mb-3 text-xs text-orange-600 flex items-center gap-1 bg-orange-50 p-2 rounded">
                      <AlertCircle size={14} />
                      Account not connected - cannot auto-publish
                    </div>
                  )}

                  <div className="flex gap-2">
                    {post.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => onEdit(post)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        {canPublish(post) && (
                          <button
                            onClick={() => onPublish(post.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                          >
                            <Send size={14} />
                            Publish Now
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => onDelete(post.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition ml-auto"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

        {showTrash && (
          <TrashBin
            deletedPosts={deletedPosts}
            onClose={() => setShowTrash(false)}
            onRestore={restorePost}
            onPermanentDelete={permanentlyDeletePost}
          />
        )}

        {showConnectedAccounts && (
          <ConnectedAccountsModal
            userId={user.id}
            onClose={() => setShowConnectedAccounts(false)}
            onAccountsUpdated={loadConnectedAccounts}
          />
        )}

        {showPasswordReset && (
          <PasswordResetModal onClose={() => setShowPasswordReset(false)} />
        )}
      </>
    )}
  </div>
);

  if (showPasswordReset && !user) {
    return <PasswordResetPage onBack={() => {
      setShowPasswordReset(false);
      window.location.hash = '';
    }} />;
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
              <button
                onClick={() => setShowTrash(true)}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
                title="Trash"
              >
                <Trash2 size={20} className="text-gray-600" />
                {deletedPosts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {deletedPosts.length}
                  </span>
                )}
              </button>
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
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{PLATFORMS.length}</p>
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
            userId={user.id}
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
            userId={user.id}
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
            onNewPost={() => {
              setSelectedDate(viewingDayPosts.date);
              setViewingDayPosts(null);
            }}
          />
        )}

        {showTrash && (
          <TrashBin
            deletedPosts={deletedPosts}
            onRestore={handleRestorePost}
            onPermanentDelete={handlePermanentDelete}
            onClose={() => setShowTrash(false)}
          />
        )}
      </div>
    </div>
  );
};
const ConnectedAccountsModal = ({ user, onClose }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading accounts:', error);
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  const connectLinkedIn = () => {
    const scope = 'openid profile email w_member_social';
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${linkedinClientId}&` +
      `redirect_uri=${encodeURIComponent(linkedinRedirectUri)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  const disconnectAccount = async (accountId) => {
    if (!window.confirm('Disconnect this account?')) return;

    const { error } = await supabase
      .from('connected_accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      alert('Failed to disconnect account');
    } else {
      loadAccounts();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Connected Accounts</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* LinkedIn */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Linkedin size={24} className="text-blue-700" />
                  <div>
                    <div className="font-medium">LinkedIn</div>
                    {accounts.find(a => a.platform === 'linkedin') ? (
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} />
                        Connected as {accounts.find(a => a.platform === 'linkedin').platform_username}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Not connected</div>
                    )}
                  </div>
                </div>
                {accounts.find(a => a.platform === 'linkedin') ? (
                  <button
                    onClick={() => disconnectAccount(accounts.find(a => a.platform === 'linkedin').id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={connectLinkedIn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Other platforms - Coming soon */}
            <div className="border rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Facebook size={24} className="text-blue-500" />
                  <div>
                    <div className="font-medium">Facebook</div>
                    <div className="text-sm text-gray-500">Coming soon</div>
                  </div>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Instagram size={24} className="text-pink-500" />
                  <div>
                    <div className="font-medium">Instagram</div>
                    <div className="text-sm text-gray-500">Coming soon</div>
                  </div>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;