/* =========================================================
   ENG.JS — Language dictionary: English
   Registers itself with YB_I18N (defined in i18n.js) under
   the code "eng" as soon as this file loads.
   ========================================================= */
(function(){
  if(typeof window.YB_I18N === 'undefined'){
    console.error('eng.js loaded before i18n.js — check your <script> order.');
    return;
  }

  window.YB_I18N.register('eng', {
    meta: { name: 'English', flag: '🇬🇧', htmlLang: 'en' },

    'app.subtitle': 'a compendium of creatures, all your own',

    'io.save': '💾 Save',
    'io.load': '📂 Load ▾',
    'io.load.bestiary': 'Bestiary',
    'io.load.beast': 'Beast',

    'index.title': 'Beast index',
    'search.placeholder': 'Search by name...',
    'search.hint': 'Start with # to search by type, e.g. "#dragon"',
    'beast.add': '+ Add beast',
    'list.empty.none': 'No beasts yet.',
    'list.empty.noMatch': 'No beast matches your search.',
    'beast.noNameShort': '(no name)',
    'beast.delete': 'Delete beast',
    'reorder.up': 'Move up',
    'reorder.down': 'Move down',

    'look.noBeastSelected': 'Choose a beast from the index to look at it, or create a new one in the EDIT tab.',
    'beast.noName': 'No name',
    'desc.title': 'Description',
    'desc.empty': 'No description sections yet. Add them in EDIT.',
    'desc.untitled': 'Untitled',
    'types.label.default': 'TYPES',
    'types.empty': 'No types assigned.',

    'edit.noBeastSelected': 'Select a beast from the index, or create a new one with "{addLabel}" to start editing it.',
    'field.name': 'Name',
    'field.name.placeholder': "Beast's name",
    'field.thumb.label': 'Thumbnail (a single image, for the index)',
    'field.thumb.change': '🖼 Change thumbnail',
    'field.thumb.upload': '🖼 Upload thumbnail',
    'field.thumb.remove': 'Remove thumbnail',
    'field.sides.label': 'Illustrations (ordered, each with its own name)',
    'field.sides.placeholder': 'Name for this illustration (e.g. Young, Enraged...)',
    'field.sides.remove': 'Remove illustration',
    'field.sides.add': '🖼 Add illustration(s)',
    'field.stat.namePlaceholder': 'Stat name',
    'field.stat.valuePlaceholder': 'Value',
    'field.stat.remove': 'Remove stat',
    'field.stat.add': '+ Add stat',
    'field.desc.label': 'Description boxes',
    'field.desc.titlePlaceholder': 'Section title',
    'field.desc.remove': 'Remove box',
    'field.desc.textPlaceholder': 'Write here...',
    'field.desc.add': '+ Add description box',
    'field.types.sectionLabel': 'Name of this section:',
    'field.type.namePlaceholder': 'Type name',
    'field.type.remove': 'Remove type',
    'field.type.add': '+ Add type',
    'field.type.commonTitle': 'Frequent types',
    'field.type.commonEmpty': 'No suggestions yet.',

    'ctx.duplicate': '⎘ Duplicate',
    'ctx.exportSingle': '📤 Export this beast only',

    'confirm.deleteBeast': 'Delete "{name}" from the bestiary?',
    'beast.thisBeast': 'this beast',
    'beast.newDefault': 'New beast',
    'beast.defaultName': 'Beast',
    'beast.copySuffix': ' (copy)',
    'desc.newSection': 'New section',

    'toast.bestiaryLoaded': 'Bestiary loaded ✓',
    'toast.invalidBestiaryFile': 'Invalid file: only bestiaries from this page are accepted.',
    'toast.beastLoaded': 'Beast loaded ✓',
    'toast.invalidBeastFile': 'Invalid file: only beasts from this page are accepted.',
    'toast.beastDuplicated': 'Beast duplicated ✓',
    'toast.beastExported': 'Beast exported ✓',
    'toast.exportBeastError': 'Could not export the beast.',
    'toast.bestiarySaved': 'Bestiary saved ✓',
    'toast.saveBestiaryError': 'Could not save the bestiary.',

    'lang.switchTitle': 'Change language',
    'lang.saveWarning': 'Your bestiary is too large and could not be automatically preserved for the language switch.\n\nIf you continue, the page will reload and you will lose any changes you haven\'t saved. Use "Save" first if you want to keep them.\n\nSwitch language anyway?'
  });
})();
