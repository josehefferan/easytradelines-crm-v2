import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setAuthenticated(true);
          
          // Obtener datos del usuario
          const userEmail = session.user.email;
          
          // Intentar obtener datos de cada tabla
          const { data: brokerData } = await supabase
            .from('brokers')
            .select('*')
            .eq('email', userEmail)
            .single();
          
          const { data: affiliateData } = await supabase
            .from('affiliates')
            .select('*')
            .eq('email', userEmail)
            .single();
          
          // Determinar rol y construir currentUser
          if (brokerData) {
            setCurrentUser({
              id: brokerData.user_id,
              email: brokerData.email,
              role: 'broker',
              name: `${brokerData.first_name} ${brokerData.last_name}`,
              brokerData: brokerData
            });
          } else if (affiliateData) {
            setCurrentUser({
              id: affiliateData.user_id,
              email: affiliateData.email,
              role: 'affiliate',
              name: `${affiliateData.first_name} ${affiliateData.last_name}`,
              affiliateData: affiliateData
            });
          } else {
            // Admin o usuario sin rol específico
            setCurrentUser({
              id: session.user.id,
              email: userEmail,
              role: 'admin',
              name: userEmail.split('@')[0]
            });
          }
        } else {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setAuthenticated(false);
        setCurrentUser(null);
        navigate("/login", { replace: true });
      } else if (event === 'SIGNED_IN' && session) {
        setAuthenticated(true);
        checkAuth(); // Re-cargar datos del usuario
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !currentUser) {
    return null;
  }

  // Clonar el elemento hijo y pasarle currentUser como prop
  return typeof children === 'function' 
    ? children(currentUser) 
    : children.type 
      ? { ...children, props: { ...children.props, currentUser } }
      : children;
}
