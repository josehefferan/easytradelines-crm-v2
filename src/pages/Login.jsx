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

  // EasyTradelines Logo Component
  const EasyTradeLinesLogo = () => (
    <div className="flex flex-col items-center mb-8">
      <svg width="160" height="80" viewBox="0 0 160 80" className="mb-4">
        {/* Chart bars with gradient effects */}
        <defs>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#FF8A50', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#FF6B35', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#FFD93D', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#FFB800', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#8BC34A', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#7CB342', stopOpacity:1}} />
          </linearGradient>
        </defs>
        
        {/* Chart bars */}
        <rect x="15" y="45" width="18" height="30" fill="url(#orangeGrad)" rx="3"/>
        <rect x="38" y="35" width="18" height="40" fill="url(#yellowGrad)" rx="3"/>
        <rect x="61" y="20" width="18" height="55" fill="url(#greenGrad)" rx="3"/>
        
        {/* Growth arrow with animation */}
        <g className="animate-pulse">
          <path d="M70 12 L95 12 L88 5 M95 12 L88 19" 
                stroke="#2E7D32" 
                strokeWidth="4" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
        </g>
        
        {/* Text - EASY */}
        <text x="105" y="35" 
              fill="#2E7D32" 
              fontSize="20" 
              fontWeight="bold" 
              fontFamily="system-ui, sans-serif">EASY</text>
        
        {/* Text - TRADELINES */}
        <text x="105" y="58" 
              fill="#2E7D32" 
              fontSize="20" 
              fontWeight="bold" 
              fontFamily="system-ui, sans-serif">TRADELINES</text>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-green-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-blue-800/90"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <EasyTradeLinesLogo />
            <h1 className="text-4xl font-bold mb-2 text-white">Professional CRM Suite</h1>
            <p className="text-green-100 text-lg">Advanced Tradeline Management Platform</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-green-500 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Tradeline Management</h3>
              </div>
              <p className="text-green-100">Complete platform for managing authorized user tradelines with advanced tracking and real-time reporting.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-blue-500 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Multi-Role Access</h3>
              </div>
              <p className="text-blue-100">Specialized dashboards for Administrators, Brokers, and Affiliates with comprehensive role-based permissions.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-500 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Real-Time Analytics</h3>
              </div>
              <p className="text-yellow-100">Advanced reporting, commission tracking, and automated payment processing with detailed analytics.</p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white"></div>
              </div>
              <p className="text-green-200 text-sm">Trusted by financial professionals worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <EasyTradeLinesLogo />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {showForgotPassword ? "Reset Password" :
                 isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-600">
                {showForgotPassword ? "Enter your email to receive a reset link" :
                 isSignUp ? "Join the EasyTradelines platform" : "Sign in to your CRM account"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={showForgotPassword ? handleForgotPassword : handleAuth} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white hover:bg-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {!showForgotPassword && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white hover:bg-white"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  showForgotPassword ? "Send Reset Link" :
                  isSignUp ? "Create Account" : "Sign In to CRM"
                )}
              </button>
            </form>

            {/* Navigation Links */}
            <div className="mt-6 text-center space-y-3">
              {!showForgotPassword ? (
                <>
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setMessage("");
                    }}
                    className="block w-full text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                  </button>
                  
                  {!isSignUp && (
                    <button
                      onClick={() => {
                        setShowForgotPassword(true);
                        setMessage("");
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xs underline transition-colors"
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
                  className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                >
                  ← Back to Sign In
                </button>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`mt-4 p-3 rounded-xl text-sm border ${
                message.includes("Error") 
                  ? "bg-red-50 text-red-700 border-red-200" 
                  : "bg-green-50 text-green-700 border-green-200"
              }`}>
                {message}
              </div>
            )}

            {/* Admin Info */}
            <div className="mt-6 p-4 bg-green-50 rounded-xl text-xs text-green-700 border border-green-200">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 mt-0.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">Admin Access</p>
                  <p>Use josehefferan@gmail.com to access the administrative panel</p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Protected by enterprise-grade security. Your data is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
