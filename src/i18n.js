import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  fr: {
    translation: {
      "login": "Connexion",
      "username": "Nom d'utilisateur",
      "password": "Mot de passe",
      "login_btn": "Se connecter",
      "admin_dashboard": "Tableau de Bord Administrateur",
      "reception_dashboard": "Tableau de Bord Réception",
      "logout": "Déconnexion",
      "welcome": "Bienvenue",
      "search_patient": "Rechercher un patient...",
      "first_name": "Prénom",
      "last_name": "Nom",
      "chifa_card_status": "Statut de la Carte Chifa",
      "available": "Disponible",
      "not_available": "Non Disponible",
      "actions": "Actions",
      "add_card": "Ajouter une carte",
      "edit": "Modifier",
      "delete": "Supprimer",
      "language": "Langue",
      "pharmacist": "Pharmacien"
    }
  },
  ar: {
    translation: {
      "login": "تسجيل الدخول",
      "username": "اسم المستخدم",
      "password": "كلمة المرور",
      "login_btn": "دخول",
      "admin_dashboard": "لوحة تحكم المسؤول",
      "reception_dashboard": "لوحة تحكم الاستقبال",
      "logout": "تسجيل الخروج",
      "welcome": "مرحباً",
      "search_patient": "ابحث عن مريض...",
      "first_name": "الاسم",
      "last_name": "اللقب",
      "chifa_card_status": "حالة بطاقة الشفاء",
      "available": "متاحة",
      "not_available": "غير متاحة",
      "actions": "إجراءات",
      "add_card": "إضافة بطاقة",
      "edit": "تعديل",
      "delete": "حذف",
      "language": "اللغة",
      "pharmacist": "صيدلي"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "fr", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
