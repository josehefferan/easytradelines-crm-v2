import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (profile?.role === 'admin') {
          navigate("/panel");
        } else {
          navigate("/mi-cuenta");
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (profile?.role === 'admin') {
            navigate("/panel");
          } else {
            navigate("/mi-cuenta");
          }
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/panel`
          }
        });

        if (error) {
          setMessage(`Error: ${error.message}`);
        } else if (data.user && !data.session) {
          setMessage("Check your email for the confirmation link!");
        } else if (data.session) {
          setMessage("Account created successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(`Error: ${error.message}`);
        }
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Password reset link sent to your email!");
        setShowForgotPassword(false);
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-green-600 text-white p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center text-xl font-bold">
            ET
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">EasyTradelines</h1>
          <p className="text-gray-600">Professional CRM Platform</p>
          <p className="text-sm text-green-600 font-medium">
            {showForgotPassword ? "Reset Password" : 
             isSignUp ? "Create Account" : "Welcome Back"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={showForgotPassword ? handleForgotPassword : handleAuth}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          {!showForgotPassword && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              showForgotPassword ? "Send Reset Link" :
              isSignUp ? "Create Account" : "Sign In to CRM"
            )}
          </button>
        </form>

        {/* Navigation Links */}
        <div className="text-center space-y-2">
          {!showForgotPassword ? (
            <>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage("");
                }}
                className="block w-full text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
              
              {!isSignUp && (
                <button
                  onClick={() => {
                    setShowForgotPassword(true);
                    setMessage("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xs underline"
                >
                  Forgot your password?
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setMessage("");
              }}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              ← Back to Sign In
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes("Error") 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {message}
          </div>
        )}

        {/* Admin Info */}
        <div className="mt-6 p-3 bg-green-50 rounded-lg text-xs text-green-700 border border-green-200">
          <div className="font-semibold">Admin Access</div>
          <div>Use josehefferan@gmail.com to access admin panel</div>
        </div>
      </div>
    </div>
  );
}
