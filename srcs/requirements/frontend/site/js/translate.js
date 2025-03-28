import { authFetchJson, fetchJson } from "./api.js"

export function loadTranslations(language) {
  fetch(`../language/${language}.json`)
    .then(response => response.json())
    .then(translations => {
      updateTextContent(translations, language);
    })
    .catch(err => console.error('Erreur de chargement des traductions :', err));
}


function updateButtonTranslations(button, translations, editKey) {
  button.dataset.editText = translations[editKey];       // Mise à jour de "EDIT"
  button.dataset.saveText = translations[editKey + "_save"]; // On utilise une clé commune "saveGeneral"
}

function updateTextContent(translations, language) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (element.hasAttribute("data-edit-text") && element.hasAttribute("data-save-text")) {
      updateButtonTranslations(element, translations, key);
    }
    if (translations[key] || key === "pending")
    {
      if (key === "pending")
      {
        const variable = document.getElementById("pending1");
        if (language === "fr")
          variable.firstChild.textContent = 'EN ATTENTE';
        else if (language === "es")
          variable.firstChild.textContent = 'EN ESPERA';
        else if (language === "en")
          variable.firstChild.textContent = 'PENDING';
      }
      else if (element.placeholder !== undefined)
      {
        element.placeholder = translations[key];
      }
      else
      {
        element.textContent = translations[key];
      }
    }
  });
}

async function getUserId() {
  try {
    const user = await authFetchJson("api/profile/", { method: "GET" });
    return user.id;
  } catch (error) {
    // console.error("Erreur lors de la récupération de l'utilisateur", error);
    return null;
  }
}

function setLanguageInCookie(language, userId) {
  document.cookie = `language_${userId}=${language}; path=/; max-age=31536000`;
  loadTranslations(language);
}

function getLanguageFromCookie(userId) {
  let cookies = document.cookie.split('; ');
  for (let cookie of cookies)
  {
    let [name, value] = cookie.split('=');
    if (name === `language_${userId}`)
    {
      return value;
    }
  }
  return 'en';
}

async function changeLanguage(language) {
  const userId = await getUserId();
  if (userId)
  {
    setLanguageInCookie(language, userId);
  }
  else
  {
    loadTranslations(language);
    localStorage.setItem('lang', language);
  }
}

async function applySavedLanguage() {
  const userId = await getUserId();
  if (userId)
  {
    let savedLanguage = getLanguageFromCookie(userId);
    if (!savedLanguage)
    {
      savedLanguage = 'en';
    }  
    setLanguageInCookie(savedLanguage, userId);
    loadTranslations(savedLanguage);
  }
  else
  {
    const savedLang = localStorage.getItem('lang');
    if (savedLang)
      loadTranslations(savedLang);
    else
      loadTranslations('en')
  }
}

function handleFrench() {
  changeLanguage('fr');
}

function handleEnglish() {
  changeLanguage('en');
}

function handleEspagnol() {
  changeLanguage('es');
}

function rmButton() {
  const french = document.getElementById('french');
  const english = document.getElementById('english');
  const espagnol = document.getElementById('espagnol');

  if (french) french.removeEventListener("click", handleFrench);
  if (english) english.removeEventListener("click", handleEnglish);
  if (espagnol) espagnol.removeEventListener("click", handleEspagnol);
}

function addButton() {
  const french = document.getElementById('french');
  const english = document.getElementById('english');
  const espagnol = document.getElementById('espagnol');

  if (french) french.addEventListener("click", handleFrench);
  if (english) english.addEventListener("click", handleEnglish);
  if (espagnol) espagnol.addEventListener("click", handleEspagnol);
}


export async function doLanguage()
{
  applySavedLanguage();
  rmButton();
  addButton();
}

export default doLanguage