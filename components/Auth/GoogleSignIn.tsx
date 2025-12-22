import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Chrome, Loader2 } from 'lucide-react';

export default function GoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl p-12 border border-slate-800">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-600 rounded-2xl mb-6 shadow-lg">
            <Chrome className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-3">Welcome</h2>
          <p className="text-slate-300 text-lg">Sign in to start capturing your best ideas</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-center text-slate-400 mt-8 text-sm">
          One account per person. This helps prevent abuse and keeps the service free for everyone.
        </p>
      </div>
    </div>
  );
}
