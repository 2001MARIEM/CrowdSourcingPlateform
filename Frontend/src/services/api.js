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
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    throw error; // Lancer l'erreur pour la gestion côté appelant
  }
};

// Connexion utilisateur ou admin
export const loginUser = async (email, password) => {
  try {
    // Envoi de la requête POST pour se connecter
    const response = await api.post("/accounts/login/", {
      email,
      password,
    });

    // Vérification de la réponse
    const { access, refresh, userRole } = response.data;
    console.log("Réponse de l'API : ", response.data); // Ajout de log pour la réponse

    // Vérifier si la réponse contient les données nécessaires
    if (!access || !refresh || !userRole) {
      throw new Error("Réponse invalide, informations utilisateur manquantes.");
    }
    // Stockage des tokens dans localStorage
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("userRole", userRole); // Op

    // Renvoie un objet avec les informations pertinentes : tokens + rôle utilisateur
    return {
      access,
      refresh,
      userRole,
    };
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    // Gérer les erreurs de manière propre avec un message d'erreur clair
    throw new Error(
      error.response
        ? error.response.data.error
        : "Échec de la connexion, veuillez vérifier vos identifiants."
    );
  }
};


// Récupération du profil utilisateur
export const getUserProfile = async (accessToken) => {
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
 


export default api;
