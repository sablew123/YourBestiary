/* =========================================================
   I18N.JS — Motor de idiomas de YourBestiary
   ---------------------------------------------------------
   Este archivo NO contiene textos traducidos. Solo:
     1) Lleva la lista de idiomas disponibles (qué otros .js
        "son idiomas" y se pueden registrar aquí).
     2) Ofrece YB_I18N.register(codigo, diccionario) para que
        esp.js / eng.js se anoten solos al cargarse.
     3) Ofrece t(clave, variables) para usar en el resto del
        código de la página.
     4) Dibuja y maneja el botoncito 🌐 de la esquina inferior
        derecha para cambiar de idioma.

   Para añadir un idioma nuevo (ej. fra.js para francés):
     - Copia eng.js, tradúcelo, y en su register() usa 'fra'.
     - Añádelo a la lista LANGUAGES de abajo.
     - Añade <script src="fra.js"></script> en el HTML,
       después de i18n.js.
   ========================================================= */
(function(){

  // Idiomas que este sitio "conoce". Cada entrada aquí es una
  // promesa de que existe un archivo .js que llama a
  // YB_I18N.register(code, {...}) con ese mismo código.
  const LANGUAGES = [
    { code: 'esp', file: 'esp.js' },
    { code: 'eng', file: 'eng.js' },
    { code: 'por', file: 'por.js' }
  ];

  const STORAGE_KEY = 'yourbestiary-lang';
  const PENDING_STATE_KEY = 'yourbestiary-pending-state';

  const YB_I18N = {
    current: 'esp',
    fallback: 'esp',
    dictionaries: {},
    languages: LANGUAGES,

    register(code, dict){
      this.dictionaries[code] = dict;
      // Si el usuario ya había elegido este idioma en una visita
      // anterior y aún no estaba cargado, lo activamos ahora.
      let saved = null;
      try{ saved = localStorage.getItem(STORAGE_KEY); }catch(e){}
      if(saved === code && this.current !== code){
        this.current = code;
      }
      renderLangMenu();
      applyStaticTranslations();
    },

    t(key, vars){
      const dict = this.dictionaries[this.current] || {};
      const fb = this.dictionaries[this.fallback] || {};
      let str = (key in dict) ? dict[key] : ((key in fb) ? fb[key] : key);
      if(vars){
        Object.keys(vars).forEach(function(k){
          str = str.split('{' + k + '}').join(vars[k]);
        });
      }
      return str;
    },

    setLanguage(code){
      if(!this.dictionaries[code] || code === this.current){
        closeLangMenu();
        return;
      }

      // La página necesita recargarse para que TODO quede bien traducido
      // (incluye cosas que solo se dibujan una vez). Antes de recargar,
      // guardamos el bestiario actual para restaurarlo apenas vuelva a
      // cargar, así el cambio de idioma no borra nada.
      let snapshotSaved = true;
      try{
        if(typeof state !== 'undefined'){
          const snapshot = {
            appState: state,
            tab: (typeof currentTab !== 'undefined' ? currentTab : 'look')
          };
          sessionStorage.setItem(PENDING_STATE_KEY, JSON.stringify(snapshot));
        }
      }catch(e){
        snapshotSaved = false;
      }

      if(!snapshotSaved){
        const proceed = confirm(this.t('lang.saveWarning'));
        if(!proceed){
          closeLangMenu();
          return;
        }
      }

      try{ localStorage.setItem(STORAGE_KEY, code); }catch(e){}
      location.reload();
    }
  };

  window.YB_I18N = YB_I18N;
  window.t = function(key, vars){ return YB_I18N.t(key, vars); };
  // Alias idéntico a t(), para usarlo dentro de closures donde la letra
  // "t" ya está ocupada como variable (ej. b.types.forEach((t, i) => ...)).
  window.T = window.t;

  /* ---------------------------------------------------------
     Traducciones "estáticas": cualquier elemento del HTML con
     data-i18n / data-i18n-placeholder / data-i18n-title se
     actualiza solo cuando cambia el idioma. El resto del texto
     (generado dinámicamente por la app) se traduce llamando a
     t('clave') dentro de las funciones render* de la página.
     --------------------------------------------------------- */
  function applyStaticTranslations(){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      el.textContent = YB_I18N.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      el.setAttribute('placeholder', YB_I18N.t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el){
      el.setAttribute('title', YB_I18N.t(el.getAttribute('data-i18n-title')));
    });

    const dict = YB_I18N.dictionaries[YB_I18N.current];
    if(dict && dict.meta && dict.meta.htmlLang){
      document.documentElement.setAttribute('lang', dict.meta.htmlLang);
    }

    // El texto de "(sin nombre)" en la lista de bestias viene de
    // un ::before en CSS (para no pisar el valor real mientras el
    // usuario escribe). Se traduce vía variable CSS.
    document.documentElement.style.setProperty(
      '--i18n-noname',
      JSON.stringify(YB_I18N.t('beast.noNameShort'))
    );

    const langBtn = document.getElementById('lang-btn');
    if(langBtn) langBtn.title = YB_I18N.t('lang.switchTitle');
  }

  /* ---------------------------------------------------------
     Selector de idioma: botón planeta 🌐 abajo a la derecha.
     --------------------------------------------------------- */
  function renderLangMenu(){
    const dd = document.getElementById('lang-dropdown');
    if(!dd) return;
    const codes = Object.keys(YB_I18N.dictionaries);
    if(codes.length === 0){ dd.innerHTML = ''; return; }
    dd.innerHTML = LANGUAGES
      .filter(function(l){ return YB_I18N.dictionaries[l.code]; })
      .map(function(l){
        const meta = YB_I18N.dictionaries[l.code].meta || {};
        const active = l.code === YB_I18N.current;
        return '<button type="button" class="lang-option' + (active ? ' active' : '') + '" ' +
          'onclick="YB_I18N.setLanguage(\'' + l.code + '\')">' +
          '<span class="lang-flag">' + (meta.flag || '🏳️') + '</span>' +
          '<span class="lang-name">' + (meta.name || l.code) + '</span>' +
          (active ? '<span class="lang-check">✓</span>' : '') +
          '</button>';
      }).join('');
  }

  function toggleLangMenu(e){
    if(e) e.stopPropagation();
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.toggle('show');
  }
  function closeLangMenu(){
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
  }
  window.toggleLangMenu = toggleLangMenu;
  window.closeLangMenu = closeLangMenu;

  document.addEventListener('click', function(e){
    if(!e.target.closest('#lang-corner-zone')) closeLangMenu();
  });

  // Recupera el idioma guardado (si existe) antes de que carguen
  // los diccionarios, para activarlo en cuanto estén disponibles.
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) YB_I18N.current = saved;
  }catch(e){}

})();
