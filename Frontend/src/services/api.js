// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Assure-toi que c'est bien la bonne URL backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Enregistrement utilisateur ou admin
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/accounts/register/", userData);
    return { 
      data: response.data, 
      error: false 
    };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    return {
      data: null,
      error: true,
      message: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};
// Connexion utilisateur ou admin
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/accounts/login/", {
      email,
      password,
    });

    const { access, refresh, userRole } = response.data;
    console.log("Réponse de l'API : ", response.data);

    if (!access || !refresh || !userRole) {
      return {
        data: null,
        error: true,
        message: "Réponse invalide, informations utilisateur manquantes.",
      };
    }

    return {
      data: { access, refresh, userRole },
      error: false,
    };
  }  catch (error) {
    console.error("Erreur lors de la connexion:", error);
    
    let errorMessage = "Email ou mot de passe incorrect.";
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Gestion des erreurs Django (non_field_errors)
      if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        errorMessage = errorData.non_field_errors[0];
      }
      // Gestion des autres formats d'erreur
      else if (errorData.error) {
        errorMessage = errorData.error;
      }
      else if (errorData.message) {
        errorMessage = errorData.message;
      }
      else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    }
    
    return {
      data: null,
      error: true,
      message: errorMessage,
      status: error.response?.status
    };
  }
};


// Récupération du profil utilisateur
export const getProfile = async (accessToken) => {
  try {
    const response = await api.get("/accounts/me/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // Ajoute ce log pour vérifier la réponse
    console.log("Données de profil utilisateur:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil utilisateur:",
      error
    );
    throw error;
  }
};

// Mise à jour du profil utilisateur
export const updateUserProfile = async (accessToken, updatedData) => {
  try {
    const response = await api.patch("/accounts/me/", updatedData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du profil utilisateur:",
      error
    );
    throw error;
  }
};

// Récupération des évaluateurs (admin uniquement)
export const getEvaluatorList = async (accessToken) => {
  try {
    const response = await api.get("/accounts/evaluators/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluateurs:", error);
    throw error;
  }
};

// Désactiver un utilisateur (admin uniquement)
export const deactivateUser = async (accessToken, userId) => {
  try {
    const response = await api.post(
      `/accounts/deactivate/${userId}/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la désactivation de l'utilisateur:", error);
    throw error;
  }
};

// Réactiver un utilisateur (admin uniquement)
export const reactivateUser = async (accessToken, userId) => {
  try {
    const response = await api.post(
      `/accounts/reactivate/${userId}/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la réactivation de l'utilisateur:", error);
    throw error;
  }
};

export const fetchRandomImage = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    console.log(token);
if (!token) {
  console.error("Token manquant");
  return;
}
    // Faire la requête avec axios
    const response = await api.get("/evaluation/media/random/image/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Vérifier si la réponse est bien un JSON et si elle contient l'image
    if (response.status === 200) {
      return { error: false, data: response.data };
    } else {
      // Si la réponse n'est pas OK (code 200), afficher un message d'erreur
      return {
        error: true,
        status: response.status,
        message: "Erreur côté serveur.",
      };
    }
  } catch (err) {
    // Gestion des erreurs réseau ou autre problème
    console.error("Erreur lors de la récupération de l'image :", err);
    return {
      error: true,
      status: err.response ? err.response.status : 500,
      message: err.response ? err.response.data : "Erreur réseau",
    };
  }
};
export const fetchRandomVideo = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Token manquant");
      return { error: true, message: "Token manquant" };
    }

    const response = await api.get("/evaluation/media/random/video/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return { error: false, data: response.data };
    } else {
      return {
        error: true,
        status: response.status,
        message: "Erreur côté serveur.",
      };
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de la vidéo :", err);
    return {
      error: true,
      status: err.response ? err.response.status : 500,
      message: err.response ? err.response.data : "Erreur réseau",
    };
  }
};

// Fonction pour soumettre l'évaluation d'une image
export const submitEvaluation = async (mediaId, ratings, comment) => {
  try {
    const token = localStorage.getItem("accessToken");
    
    const data = {
      ...ratings,
      comment: comment,
    };

    console.log(
      "Tentative de soumettre l'évaluation avec les données suivantes:",
      data
    );

    // Faire la requête POST pour soumettre l'évaluation
    const response = await api.post(`/evaluation/media/evaluate/${mediaId}/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Vérifier si la réponse est bien OK (201 Created)
    if (response.status === 201) {
      console.log("Évaluation enregistrée avec succès");
      return { error: false, message: "Évaluation enregistrée." };
    } else {
      return { error: true, message: "Erreur lors de l'enregistrement de l'évaluation." };
    }
  } catch (err) {
    console.error("Erreur lors de la soumission de l'évaluation :", err);
    return {
      error: true,
      status: err.response ? err.response.status : 500,
      message: err.response ? err.response.data : "Erreur réseau",
    };
  }
};
export const getUserEvaluationHistory = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("Token manquant");
      return {
        error: true,
        message: "Token manquant, veuillez vous reconnecter.",
      };
    }

    // Envoi de la requête GET avec les en-têtes d'authentification
    const response = await api.get("/evaluation/media/evaluation_history/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { data: response.data, error: false };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique :", error);
    return {
      error: true,
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        "Erreur lors de la récupération de l’historique.",
    };
  }
};

export const updateEvaluation = async (evaluationId, ratings, comment) => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("Token manquant !");
      return {
        error: true,
        message: "Token d'accès introuvable. Veuillez vous reconnecter.",
      };
    }

    const payload = {
      ...ratings,
      comment: comment || "", // Assure qu'on n'envoie jamais `undefined`
    };

    const response = await api.patch(
      `/evaluation/media/evaluation_update/${evaluationId}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { error: false, message: response.data.message };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l’évaluation :", error);
    return {
      error: true,
      status: error.response?.status,
      message:
        error.response?.data?.error ||
        "Erreur lors de la mise à jour de l’évaluation.",
    };
  }
};
// Dans api.js
export const fetchMapDataByYear = async (year) => {
  try {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem("access_token");
    
    // Vérifier si le token existe
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }
    
    // Envoyer la requête avec le token dans l'en-tête Authorization
    const response = await axios.get(`http://127.0.0.1:8000/api/evaluation/map/composite/${year}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données de carte:", error);
    throw error;
  }
};
// Fonction pour récupérer les évaluations admin
export const getAdminEvaluations = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `http://127.0.0.1:8000/api/evaluation/view_evaluations_admin/?download=false`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Erreur récupération évaluations admin:", error);
    return { 
      error: true, 
      message: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Fonction pour télécharger les évaluations au format JSON
export const downloadAdminEvaluations = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `http://127.0.0.1:8000/api/evaluation/view_evaluations_admin/?download=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important pour télécharger le fichier
      }
    );
    
    // Créer un blob et télécharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'evaluations.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { error: false };
  } catch (error) {
    console.error("Erreur téléchargement évaluations:", error);
    return { 
      error: true, 
      message: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};
export const getEvaluatorsList = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await api.get(
      `http://127.0.0.1:8000/api/accounts/admin/evaluateurs/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluateurs:", error);
    return {
      error: true,
      message:
        error.response?.data?.message ||
        "Une erreur est survenue lors de la récupération des évaluateurs.",
    };
  }
};
export const DisableUser = async (userId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await api.post(
      `/accounts/admin/desactiver/${userId}/`,
      {}, // Le deuxième paramètre est le corps de la requête (même vide)
      {
        headers: {
          // Le troisième paramètre est pour les options, y compris les headers
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Erreur lors de la désactivation de l'utilisateur:", error);
    return {
      error: true,
      message:
        error.response?.data?.message ||
        "Une erreur est survenue lors de la désactivation de l'utilisateur.",
    };
  }
};

export const ActivateUser = async (userId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await api.post(
      `/accounts/admin/reactiver/${userId}/`,
      {}, // Corps vide
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { error: false, data: response.data };
  } catch (error) {
    console.error("Erreur lors de la réactivation de l'utilisateur:", error);
    return {
      error: true,
      message:
        error.response?.data?.message ||
        "Une erreur est survenue lors de la réactivation de l'utilisateur.",
    };
  }
};
export const createChercheurUser = async (userData) => {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return {
        error: true,
        message:
          "Token d'authentification manquant. Veuillez vous reconnecter.",
      };
    }

    const response = await api.post("accounts/admin/chercheurs/", userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      error: false,
      data: response.data,
      message:
        "Compte chercheur créé avec succès. Un email a été envoyé à l'utilisateur avec ses identifiants.",
    };
  } catch (error) {
    console.error("Erreur lors de la création du compte chercheur:", error);

    return {
      error: true,
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Une erreur est survenue lors de la création du compte chercheur.",
    };
  }
};
export const getStats = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return {
        error: true,
        message:
          "Token d'authentification manquant. Veuillez vous reconnecter.",
      };
    }

    const response = await api.get(
      "http://127.0.0.1:8000/api/accounts/admin/stats/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

     
    return {
      data: response.data,
      error: false,
    };
  } catch (error) {
    console.error("Erreur API:", error);

    // Gestion des erreurs HTTP avec axios
    if (error.response) {
      return {
        data: null,
        error: true,
        message:
          error.response.data?.message || `Erreur ${error.response.status}`,
      };
    } else {
      return {
        data: null,
        error: true,
        message: "Erreur de connexion",
      };
    }
  }
};
// Demande de réinitialisation de mot de passe
export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/accounts/forgot-password/", { email });
    return { 
      data: response.data, 
      error: false 
    };
  } catch (error) {
    return {
      data: null,
      error: true,
      message: error.response?.data?.detail || "Erreur lors de l'envoi de l'email",
      status: error.response?.status
    };
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/accounts/reset-password/${token}/`, { password });
    return { 
      data: response.data, 
      error: false 
    };
  } catch (error) {
    return {
      data: null,
      error: true,
      message: error.response?.data?.password || error.response?.data?.detail || "Erreur lors de la réinitialisation",
      status: error.response?.status
    };
  }
};

export default api;
