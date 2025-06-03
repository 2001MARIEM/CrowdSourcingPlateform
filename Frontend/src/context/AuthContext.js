import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, getProfile } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Commencez avec loading=true
  const navigate = useNavigate();

  // Récupérer les informations de l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const userRole = localStorage.getItem("userRole");
    console.log("🔍 Debug AuthContext - Token:", !!accessToken);
    console.log("🔍 Debug AuthContext - Role:", userRole);

    if (accessToken && userRole) {
      // Récupérer le profil pour TOUS les utilisateurs (admin et évaluateur)
      const fetchUserProfile = async () => {
        try {
          console.log(`Récupération du profil pour ${userRole}`);
          // Récupérer le profil utilisateur
          console.log(`🔍 Récupération du profil pour ${userRole}`);
          const profile = await getProfile(accessToken);
          console.log("🔍 Profil récupéré:", profile);
          const userData = { role: userRole, ...profile };
          console.log("🔍 userData final:", userData);
          setUser(userData);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération du profil utilisateur",
            error
          );
          // En cas d'erreur, on définit quand même l'utilisateur avec son rôle
          setUser({ role: userRole });
        } finally {
          setLoading(false);
        }
      };
      fetchUserProfile();
    } else {
      // Pas de token ou de rôle, utilisateur non connecté
      setLoading(false);
    }
  }, []);

  // Fonction de login
  // Fonction de login
  const login = async (email, password) => {
    try {
      setLoading(true);

      // 1. Appel API de connexion
      const res = await loginUser(email, password);
      console.log("Réponse de l'API après connexion:", res);

      // 2. Vérifier s'il y a une erreur
      if (res.error) {
        throw new Error(res.message); // ← Laisser remonter l'erreur
      }

      // 3. Extraire les données de la réponse
      const { access, refresh, userRole } = res.data;

      // 4. Stocker les tokens + rôle
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("userRole", userRole);

      console.log("Rôle utilisateur:", userRole);

      // 5. Récupérer profil
      let userData = { role: userRole };
      try {
        const profile = await getProfile(access);
        userData = { ...userData, ...profile };
      } catch (profileError) {
        console.log("Erreur profil, continue avec rôle seulement");
      }

      // 6. Mise à jour de l'état utilisateur
      setUser(userData);

      // 7. Redirection
      if (userRole === "admin") {
        console.log("Redirection vers /admin/dashboard");
        navigate("/admin/dashboard");
      } else if (userRole === "chercheur") {
        console.log("Redirection vers /chercheur/evaluations");
        navigate("/chercheur/evaluations");
      } else {
        console.log("Redirection vers /evaluator/dashboard");
        navigate("/evaluator/dashboard");
      }
    } catch (error) {
      console.error("Erreur login :", error);
      throw error; // ← NE PAS faire alert() ici, laisser remonter
    } finally {
      setLoading(false);
    }
  };
  // Fonction d'inscription
  const register = async (formData) => {
    try {
      setLoading(true);
      await registerUser(formData);
      alert("Inscription réussie !");
      navigate("/auth/login");
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      alert("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userRole");
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
