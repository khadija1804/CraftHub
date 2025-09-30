/**
 * Utilitaires pour la gestion des ateliers
 */

/**
 * Vérifie si un atelier est expiré
 * @param {string|Date} workshopDate - La date de l'atelier
 * @returns {boolean} - true si l'atelier est expiré, false sinon
 */
export const isWorkshopExpired = (workshopDate) => {
  if (!workshopDate) return false;
  
  const today = new Date();
  const workshopDateObj = new Date(workshopDate);
  
  // Réinitialiser les heures pour comparer seulement les dates
  today.setHours(0, 0, 0, 0);
  workshopDateObj.setHours(0, 0, 0, 0);
  
  // L'atelier est expiré si la date est antérieure ou égale à aujourd'hui
  return workshopDateObj <= today;
};

/**
 * Formate la date d'un atelier pour l'affichage
 * @param {string|Date} workshopDate - La date de l'atelier
 * @returns {string} - La date formatée
 */
export const formatWorkshopDate = (workshopDate) => {
  if (!workshopDate) return 'Date inconnue';
  
  return new Date(workshopDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Obtient le statut d'un atelier
 * @param {string|Date} workshopDate - La date de l'atelier
 * @returns {object} - Objet contenant le statut et les styles
 */
export const getWorkshopStatus = (workshopDate) => {
  const isExpired = isWorkshopExpired(workshopDate);
  
  if (isExpired) {
    return {
      status: 'expired',
      text: 'Atelier expiré',
      icon: '⚠️',
      styles: {
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderColor: 'rgba(220, 38, 38, 0.3)',
        color: '#dc2626',
        textColor: '#dc2626'
      }
    };
  }
  
  return {
    status: 'active',
    text: 'Réservé',
    icon: '✅',
    styles: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      color: '#22c55e',
      textColor: '#22c55e'
    }
  };
};
