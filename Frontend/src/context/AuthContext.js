import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, getUserProfile } from "../services/api";

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

    if (accessToken && userRole) {
      // Si l'utilisateur est un admin, pas besoin de récupérer le profil
      if (userRole === "admin") {
        console.log("Utilisateur admin, pas besoin de récupérer le profil");
        setUser({ role: userRole });
        setLoading(false);
      } else {
        // Pour les évaluateurs, récupérer le profil
        const fetchUserProfile = async () => {
          try {
            // Récupérer le profil utilisateur
            const profile = await getUserProfile(accessToken);
            const userData = { role: userRole, ...profile };
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
      }
    } else {
      // Pas de token ou de rôle, utilisateur non connecté
      setLoading(false);
    }
  }, []);

  // Fonction de login
  const login = async (email, password) => {
    try {
      setLoading(true);

      // 1. Appel API de connexion
      const res = await loginUser(email, password);
      console.log("Réponse de l'API après connexion:", res);

      // 2. Extraire les données de la réponse
      const { access, refresh, userRole } = res;

      if (!access || !refresh || !userRole) {
        throw new Error("Données utilisateur manquantes dans la réponse.");
      }

      // 3. Stocker les tokens + rôle
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("userRole", userRole);

      console.log("Rôle utilisateur:", userRole);

      // 4. Récupérer profil SEULEMENT si évaluateur
      let userData = { role: userRole };
      if (userRole === "evaluator") {
        const profile = await getUserProfile(access);
        userData = { ...userData, ...profile };
      }

      // 5. Mise à jour de l'état utilisateur
      setUser(userData);

      // 6. Redirection
      if (userRole === "admin") {
        console.log("Redirection vers /admin/dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("Redirection vers /evaluator/dashboard");
        navigate("/evaluator/dashboard");
      }
    } catch (error) {
      console.error("Erreur login :", error);
      alert("Email ou mot de passe incorrect.");
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
