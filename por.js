/* =========================================================
   POR.JS — Dicionário de idioma: Português
   Registra-se no YB_I18N (definido em i18n.js) sob o
   código "por" assim que este arquivo é carregado.
   ========================================================= */
(function(){
  if(typeof window.YB_I18N === 'undefined'){
    console.error('por.js carregado antes de i18n.js — verifique a ordem dos <script>.');
    return;
  }

  window.YB_I18N.register('por', {
    meta: { name: 'Português', flag: '🇧🇷', htmlLang: 'pt' },

    'app.subtitle': 'um compêndio de criaturas, todo seu',

    'io.save': '💾 Salvar',
    'io.load': '📂 Carregar ▾',
    'io.load.bestiary': 'Bestiário',
    'io.load.beast': 'Fera',

    'index.title': 'Índice de feras',
    'search.placeholder': 'Buscar por nome...',
    'search.hint': 'Comece com # para buscar por tipo, ex. "#dragão"',
    'beast.add': '+ Adicionar fera',
    'list.empty.none': 'Nenhuma fera ainda.',
    'list.empty.noMatch': 'Nenhuma fera corresponde à busca.',
    'beast.noNameShort': '(sem nome)',
    'beast.delete': 'Excluir fera',
    'reorder.up': 'Mover para cima',
    'reorder.down': 'Mover para baixo',

    'look.noBeastSelected': 'Escolha uma fera do índice para visualizá-la ou crie uma nova na aba EDITAR.',
    'beast.noName': 'Sem nome',
    'desc.title': 'Descrição',
    'desc.empty': 'Nenhuma seção de descrição ainda. Adicione em EDITAR.',
    'desc.untitled': 'Sem título',
    'types.label.default': 'TIPOS',
    'types.empty': 'Nenhum tipo atribuído.',

    'edit.noBeastSelected': 'Selecione uma fera do índice ou crie uma nova com "{addLabel}" para começar a editá-la.',
    'field.name': 'Nome',
    'field.name.placeholder': 'Nome da fera',
    'field.thumb.label': 'Miniatura (uma única imagem, para o índice)',
    'field.thumb.change': '🖼 Alterar miniatura',
    'field.thumb.upload': '🖼 Enviar miniatura',
    'field.thumb.remove': 'Remover miniatura',
    'field.sides.label': 'Ilustrações (ordenadas, cada uma com seu próprio nome)',
    'field.sides.placeholder': 'Nome para esta ilustração (ex. Jovem, Enraivecida...)',
    'field.sides.remove': 'Remover ilustração',
    'field.sides.add': '🖼 Adicionar ilustração(ões)',
    'field.stat.namePlaceholder': 'Nome do atributo',
    'field.stat.valuePlaceholder': 'Valor',
    'field.stat.remove': 'Remover atributo',
    'field.stat.add': '+ Adicionar atributo',
    'field.desc.label': 'Caixas de descrição',
    'field.desc.titlePlaceholder': 'Título da seção',
    'field.desc.remove': 'Remover caixa',
    'field.desc.textPlaceholder': 'Escreva aqui...',
    'field.desc.add': '+ Adicionar caixa de descrição',
    'field.types.sectionLabel': 'Nome desta seção:',
    'field.type.namePlaceholder': 'Nome do tipo',
    'field.type.remove': 'Remover tipo',
    'field.type.add': '+ Adicionar tipo',
    'field.type.commonTitle': 'Tipos frequentes',
    'field.type.commonEmpty': 'Nenhuma sugestão ainda.',

    'ctx.duplicate': '⎘ Duplicar',
    'ctx.exportSingle': '📤 Exportar apenas esta fera',

    'confirm.deleteBeast': 'Excluir "{name}" do bestiário?',
    'beast.thisBeast': 'esta fera',
    'beast.newDefault': 'Nova fera',
    'beast.defaultName': 'Fera',
    'beast.copySuffix': ' (cópia)',
    'desc.newSection': 'Nova seção',

    'toast.bestiaryLoaded': 'Bestiário carregado ✓',
    'toast.invalidBestiaryFile': 'Arquivo inválido: apenas bestiários desta página são aceitos.',
    'toast.beastLoaded': 'Fera carregada ✓',
    'toast.invalidBeastFile': 'Arquivo inválido: apenas feras desta página são aceitas.',
    'toast.beastDuplicated': 'Fera duplicada ✓',
    'toast.beastExported': 'Fera exportada ✓',
    'toast.exportBeastError': 'Não foi possível exportar a fera.',
    'toast.bestiarySaved': 'Bestiário salvo ✓',
    'toast.saveBestiaryError': 'Não foi possível salvar o bestiário.',

    'lang.switchTitle': 'Mudar idioma',
    'lang.saveWarning': 'Seu bestiário é muito grande e não pôde ser preservado automaticamente para a mudança de idioma.\n\nSe você continuar, a página será recarregada e perderá quaisquer alterações não salvas. Use "Salvar" primeiro se quiser mantê-las.\n\nMudar de idioma mesmo assim?'
  });
})();