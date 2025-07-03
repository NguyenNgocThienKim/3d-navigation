// --- language.js ---

// 1. Global translations dictionary
window.translations = {
  en: {
    universityTitle: "UNIVERSITY - SAN PABLO CITY",
    universitySubtitle: "Integrity, Professionalism and Innovation",
    welcomeText: "Welcome to our university portal!",
    languageButton: "Switch to Filipino"
  },
  fil: {
    universityTitle: "UNIBERSIDAD - LUNGSOD NG SAN PABLO",
    universitySubtitle: "Integridad, Propesyonalismo at Inobasyon",
    welcomeText: "Maligayang pagdating sa aming portal ng unibersidad!",
    languageButton: "Lumipat sa Ingles"
  },
  ko: {
    universityTitle: "대학교 - 산파블로시",
    universitySubtitle: "정직, 전문성, 혁신",
    welcomeText: "우리 대학 포털에 오신 것을 환영합니다!",
    languageButton: "영어로 전환"
  },
  ja: {
    universityTitle: "大学 - サンパブロ市",
    universitySubtitle: "誠実さ、専門性、革新",
    welcomeText: "大学ポータルへようこそ！",
    languageButton: "英語に切り替え"
  },
  vi: {
    universityTitle: "ĐẠI HỌC - THÀNH PHỐ SAN PABLO",
    universitySubtitle: "Chính trực, Chuyên nghiệp và Đổi mới",
    welcomeText: "Chào mừng đến với cổng thông tin trường đại học!",
    languageButton: "Chuyển sang tiếng Anh"
  },
  zh: {
    universityTitle: "大学 - 圣巴勃罗市",
    universitySubtitle: "诚信、专业和创新",
    welcomeText: "欢迎来到我们的大学门户网站！",
    languageButton: "切换到英文"
  },
  pt: {
    universityTitle: "UNIVERSIDADE - CIDADE DE SAN PABLO",
    universitySubtitle: "Integridade, Profissionalismo e Inovação",
    welcomeText: "Bem-vindo ao nosso portal universitário!",
    languageButton: "Mudar para Inglês"
  },
  es: {
    universityTitle: "UNIVERSIDAD - CIUDAD DE SAN PABLO",
    universitySubtitle: "Integridad, Profesionalismo e Innovación",
    welcomeText: "¡Bienvenido a nuestro portal universitario!",
    languageButton: "Cambiar a Inglés"
  }
};

// 2. Set Language Function
function setLanguage(lang) {
  const trans = window.translations[lang];
  if (!trans) return;

  localStorage.setItem('language', lang);

  // Loop through elements with data-lang-key
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    if (trans[key]) el.textContent = trans[key];
  });

  const langSelect = document.getElementById('languageSelect');
  if (langSelect) langSelect.value = lang;

  // Notify other scripts if needed
  window.dispatchEvent(new CustomEvent('languageChanged'));
}

// 3. Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'en';
  setLanguage(savedLang);

  const langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    langSelect.addEventListener('change', e => {
      setLanguage(e.target.value);
    });
  }
});
