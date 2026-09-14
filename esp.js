/* =========================================================
   ESP.JS — Diccionario de idioma: Español
   Este archivo se "enlista" solo: al cargarlo, se registra
   ante YB_I18N (definido en i18n.js) bajo el código "esp".
   ========================================================= */
(function(){
  if(typeof window.YB_I18N === 'undefined'){
    console.error('esp.js cargado antes que i18n.js — revisa el orden de los <script>.');
    return;
  }

  window.YB_I18N.register('esp', {
    meta: { name: 'Español', flag: '🇪🇸', htmlLang: 'es' },

    'app.subtitle': 'un compendio de criaturas propio',

    'io.save': '💾 Guardar',
    'io.load': '📂 Cargar ▾',
    'io.load.bestiary': 'Bestiario',
    'io.load.beast': 'Bestia',

    'index.title': 'Índice de bestias',
    'search.placeholder': 'Buscar por nombre...',
    'search.hint': 'Empieza con # para buscar por tipo, p. ej. "#dragón"',
    'beast.add': '+ Añadir bestia',
    'list.empty.none': 'No hay bestias todavía.',
    'list.empty.noMatch': 'Ninguna bestia coincide con la búsqueda.',
    'beast.noNameShort': '(sin nombre)',
    'beast.delete': 'Eliminar bestia',
    'reorder.up': 'Subir',
    'reorder.down': 'Bajar',

    'look.noBeastSelected': 'Elige una bestia del índice para observarla, o crea una nueva en la pestaña EDIT.',
    'beast.noName': 'Sin nombre',
    'desc.title': 'Descripción',
    'desc.empty': 'Sin secciones de descripción. Añádelas en EDIT.',
    'desc.untitled': 'Sin título',
    'types.label.default': 'TIPOS',
    'types.empty': 'Sin tipos asignados.',

    'edit.noBeastSelected': 'Selecciona una bestia del índice, o crea una nueva con "{addLabel}" para empezar a editarla.',
    'field.name': 'Nombre',
    'field.name.placeholder': 'Nombre de la bestia',
    'field.thumb.label': 'Miniatura (una sola imagen, para el índice)',
    'field.thumb.change': '🖼 Cambiar miniatura',
    'field.thumb.upload': '🖼 Subir miniatura',
    'field.thumb.remove': 'Quitar miniatura',
    'field.sides.label': 'Ilustraciones (ordenadas, con nombre propio para cada una)',
    'field.sides.placeholder': 'Nombre de esta ilustración (ej. Joven, Furiosa...)',
    'field.sides.remove': 'Quitar ilustración',
    'field.sides.add': '🖼 Añadir ilustración(es)',
    'field.stat.namePlaceholder': 'Nombre del stat',
    'field.stat.valuePlaceholder': 'Valor',
    'field.stat.remove': 'Quitar stat',
    'field.stat.add': '+ Añadir stat',
    'field.desc.label': 'Cajas de descripción',
    'field.desc.titlePlaceholder': 'Título de la sección',
    'field.desc.remove': 'Quitar caja',
    'field.desc.textPlaceholder': 'Escribe aquí...',
    'field.desc.add': '+ Añadir caja de descripción',
    'field.types.sectionLabel': 'Nombre de esta sección:',
    'field.type.namePlaceholder': 'Nombre del tipo',
    'field.type.remove': 'Quitar tipo',
    'field.type.add': '+ Añadir tipo',
    'field.type.commonTitle': 'Tipos frecuentes',
    'field.type.commonEmpty': 'Sin sugerencias todavía.',

    'ctx.duplicate': '⎘ Duplicar',
    'ctx.exportSingle': '📤 Exportar bestia sola',

    'confirm.deleteBeast': '¿Eliminar a "{name}" del bestiario?',
    'beast.thisBeast': 'esta bestia',
    'beast.newDefault': 'Nueva bestia',
    'beast.defaultName': 'Bestia',
    'beast.copySuffix': ' (copia)',
    'desc.newSection': 'Nueva sección',

    'toast.bestiaryLoaded': 'Bestiario cargado ✓',
    'toast.invalidBestiaryFile': 'Archivo inválido: solo se aceptan bestiarios de esta página.',
    'toast.beastLoaded': 'Bestia cargada ✓',
    'toast.invalidBeastFile': 'Archivo inválido: solo se aceptan bestias de esta página.',
    'toast.beastDuplicated': 'Bestia duplicada ✓',
    'toast.beastExported': 'Bestia exportada ✓',
    'toast.exportBeastError': 'No se pudo exportar la bestia.',
    'toast.bestiarySaved': 'Bestiario guardado ✓',
    'toast.saveBestiaryError': 'No se pudo guardar el bestiario.',

    'lang.switchTitle': 'Cambiar idioma',
    'lang.saveWarning': 'El bestiario es demasiado grande y no se pudo conservar automáticamente para el cambio de idioma.\n\nSi continúas, la página se recargará y perderás los cambios que no hayas guardado. Usa "Guardar" antes de continuar si quieres conservarlos.\n\n¿Cambiar de idioma de todas formas?'
  });
})();
