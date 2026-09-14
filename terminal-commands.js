/* =========================================================
   YourBestiary — "/do" terminal commands
   =========================================================
   Commands implemented so far:
     - Help / Help me / Help do    -> in-terminal usage guides
     - Limited On / Limited Off   -> toggles access to "limited" commands
     - Clear all                  -> wipes the workspace (limited)
     - Add <n> [Name(...)] [Stats(...)] [Info(...)] [Type(...)]
     - Del(#1,#2,#3) / Del(#1_#3) / Del(#1_#3,#6_#9,#11)
     - Edit #1,#2,#3 [Name(...)] [Stats(...)] [Info(...)] [Type(...)]
     - EditInfo #1 ("Box1","Box2") -> multi-line box-text capture, ends on "._."
     - ChangeID #a #b / ChangeIDin #a +n/-n -> swap beast positions
     - Question #1,#2 Name Stats(...) Info(...) Type(...) -> read out data

   "Limited" always starts OFF on page load.
   ========================================================= */

(function(){

  let limitedEnabled = false;

  // Holds the in-progress state for a multi-line text capture started by
  // EditInfo (e.g. writing a description box's text across several lines,
  // finished by a lone "._." line). Null when no capture is active.
  let multilineSession = null;

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const NULL_HTML = '<span class="term-null">null</span>';

  /* ---------- low-level parsing helpers ---------- */

  // Finds the matching ')' for the '(' at openIdx, ignoring parens inside quotes.
  function extractBalanced(str, openIdx){
    let depth = 0;
    let inQuotes = false;
    for(let i = openIdx; i < str.length; i++){
      const ch = str[i];
      if(ch === '"'){ inQuotes = !inQuotes; continue; }
      if(inQuotes) continue;
      if(ch === '('){ depth++; }
      else if(ch === ')'){
        depth--;
        if(depth === 0){
          return { content: str.slice(openIdx + 1, i), end: i };
        }
      }
    }
    return null; // unbalanced parens
  }

  // Finds "Keyword(...)" in str and returns the inner content, or null if absent.
  function extractKeywordBlock(str, keyword){
    const re = new RegExp('\\b' + keyword + '\\s*\\(', 'i');
    const m = re.exec(str);
    if(!m) return null;
    const openIdx = m.index + m[0].length - 1;
    const res = extractBalanced(str, openIdx);
    if(!res) return null;
    return res.content;
  }

  // Splits a string by top-level commas (ignores commas inside quotes or nested parens).
  function splitTopLevel(str){
    const parts = [];
    let depth = 0, inQuotes = false, cur = '';
    for(let i = 0; i < str.length; i++){
      const ch = str[i];
      if(ch === '"'){ inQuotes = !inQuotes; cur += ch; continue; }
      if(inQuotes){ cur += ch; continue; }
      if(ch === '('){ depth++; cur += ch; continue; }
      if(ch === ')'){ depth--; cur += ch; continue; }
      if(ch === ',' && depth === 0){ parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    if(cur.trim() !== '') parts.push(cur);
    return parts.map(s => s.trim()).filter(s => s.length > 0);
  }

  function stripQuotes(s){
    const t = (s || '').trim();
    if(t.length >= 2 && t[0] === '"' && t[t.length - 1] === '"'){
      return t.slice(1, -1);
    }
    return t;
  }

  // "#1,#2,#3" / "#1_#3" / "#1_#3,#6_#9,#11" -> [1,2,3] (1-based, order preserved, deduped)
  function parseIndexList(str){
    const tokens = str.split(',').map(s => s.trim()).filter(Boolean);
    const result = [];
    const seen = new Set();
    const add = n => { if(Number.isFinite(n) && !seen.has(n)){ seen.add(n); result.push(n); } };
    tokens.forEach(tok => {
      const clean = tok.replace(/^#/, '').trim();
      if(clean.includes('_')){
        const [aRaw, bRaw] = clean.split('_');
        const a = parseInt(aRaw.replace(/^#/, ''), 10);
        const b = parseInt(bRaw.replace(/^#/, ''), 10);
        if(Number.isFinite(a) && Number.isFinite(b)){
          const lo = Math.min(a, b), hi = Math.max(a, b);
          for(let n = lo; n <= hi; n++) add(n);
        }
      } else {
        add(parseInt(clean, 10));
      }
    });
    return result;
  }

  // '"HP"(Emoji("🔥"),Name("Salud"),Value("10"))' -> { key:'HP', inner:'Emoji("🔥"),Name("Salud"),Value("10")' }
  function splitKeyAndInner(entry){
    const m = entry.match(/^"((?:[^"\\]|\\.)*)"\s*\(/);
    if(!m) return null;
    const key = m[1];
    const openIdx = m[0].length - 1;
    const res = extractBalanced(entry, openIdx);
    if(!res) return null;
    return { key, inner: res.content };
  }


  // Scans a string at the top level and extracts consecutive parenthesized
  // groups, regardless of whether they're separated by commas, whitespace,
  // or nothing at all. Returns null if the string isn't purely a sequence
  // of top-level "(...)" groups (i.e. it's shorthand content instead).
  function extractTopLevelParenGroups(str){
    const groups = [];
    let i = 0;
    let sawAnyGroup = false;
    while(i < str.length){
      const ch = str[i];
      if(ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === ','){
        i++; continue;
      }
      if(ch === '('){
        const res = extractBalanced(str, i);
        if(!res) return null; // unbalanced parens -> bail out
        groups.push(res.content);
        sawAnyGroup = true;
        i = res.end + 1;
        continue;
      }
      // Any other character means this isn't a pure sequence of groups
      // (e.g. shorthand like HP("🔥")("12") where "HP" sits outside parens).
      return null;
    }
    return sawAnyGroup ? groups : null;
  }

  // Turns a block's content into an array of "groups" (one per beast, wrapping around).
  // Prefers reading it as a sequence of top-level "(...)" groups (comma-separated
  // or not); falls back to treating the whole content as a single shorthand group.
  function parseGroups(blockContent){
    const grouped = extractTopLevelParenGroups(blockContent);
    if(grouped) return grouped;
    return [blockContent.trim()];
  }

  /* ---------- per-field parsers ---------- */

  // 'HP("🔥")("12"),XP("🟢")("85")' -> [{emoji,label,value}, ...]
  function parseStatsGroup(group){
    const entries = splitTopLevel(group);
    return entries.map(e => {
      const m = e.match(/^([^\s(]+)\s*\(([^()]*)\)\s*\(([^()]*)\)$/);
      if(m){
        return { emoji: stripQuotes(m[2]), label: m[1].trim(), value: stripQuotes(m[3]) };
      }
      return { emoji: '', label: e.trim(), value: '' };
    });
  }

  // '"Description","History"' -> [{title,text:''}, ...]
  function parseInfoGroup(group){
    const entries = splitTopLevel(group);
    return entries.map(e => ({ title: stripQuotes(e), text: '' }));
  }

  // '("🔥")("Wizard"),("🌊")("Sailor")' -> [{id,emoji,name}, ...]
  function parseTypeGroup(group){
    const entries = splitTopLevel(group);
    return entries.map(e => {
      const m = e.match(/^\(([^()]*)\)\s*\(([^()]*)\)$/);
      if(m){
        return { id: uid(), emoji: stripQuotes(m[1]), name: stripQuotes(m[2]) };
      }
      return { id: uid(), emoji: '', name: e.trim() };
    });
  }

  /* ---------- Add command ---------- */

  function handleAdd(trimmed, ctx){
    const rest = trimmed.replace(/^add\s*/i, '');
    const countMatch = rest.match(/^(\d+)/);
    if(!countMatch){
      return 'Add needs a count right after it, e.g.: Add 1 Name("Fox")';
    }
    let count = parseInt(countMatch[1], 10);
    if(!Number.isFinite(count) || count < 1) count = 1;
    if(count > 200) count = 200; // safety cap

    const afterCount = rest.slice(countMatch[0].length);

    const nameBlock = extractKeywordBlock(afterCount, 'Name');
    const statsBlock = extractKeywordBlock(afterCount, 'Stats');
    const infoBlock = extractKeywordBlock(afterCount, 'Info');
    const typeBlock = extractKeywordBlock(afterCount, 'Type');

    const names = nameBlock !== null ? splitTopLevel(nameBlock).map(stripQuotes) : [];
    const statGroups = statsBlock !== null ? parseGroups(statsBlock) : [];
    const infoGroups = infoBlock !== null ? parseGroups(infoBlock) : [];
    const typeGroups = typeBlock !== null ? parseGroups(typeBlock) : [];

    let lastId = null;
    for(let i = 0; i < count; i++){
      const beast = {
        id: uid(),
        name: names.length ? names[i % names.length] : '',
        thumb: null,
        sides: [],
        stats: statGroups.length ? parseStatsGroup(statGroups[i % statGroups.length]) : [],
        desc: infoGroups.length ? parseInfoGroup(infoGroups[i % infoGroups.length]) : [],
        typesLabel: 'TIPOS',
        types: typeGroups.length ? parseTypeGroup(typeGroups[i % typeGroups.length]) : []
      };
      ctx.state.beasts.push(beast);
      lastId = beast.id;
    }
    if(lastId) ctx.state.selectedId = lastId;
    ctx.renderAll();
    return `Added ${count} beast${count === 1 ? '' : 's'}.`;
  }

  /* ---------- Del command ---------- */

  function handleDel(trimmed, ctx){
    const m = trimmed.match(/^del\s*\(/i);
    if(!m) return 'Del needs parentheses, e.g.: Del(#1,#2,#3)';
    const openIdx = m[0].length - 1;
    const res = extractBalanced(trimmed, openIdx);
    if(!res) return "Del: parentheses don't match up.";

    const indices = parseIndexList(res.content); // 1-based, as shown in EDIT
    if(indices.length === 0) return 'Del: no valid indices given.';

    const zeroBased = indices
      .map(n => n - 1)
      .filter(idx => idx >= 0 && idx < ctx.state.beasts.length);
    if(zeroBased.length === 0) return "Del: none of those beasts exist.";

    const uniqueDesc = Array.from(new Set(zeroBased)).sort((a, b) => b - a);
    const removedIds = [];
    uniqueDesc.forEach(idx => {
      const removed = ctx.state.beasts.splice(idx, 1)[0];
      if(removed) removedIds.push(removed.id);
    });

    if(removedIds.includes(ctx.state.selectedId)){
      ctx.state.selectedId = ctx.state.beasts.length ? ctx.state.beasts[0].id : null;
    }
    ctx.renderAll();
    return `Deleted ${uniqueDesc.length} beast${uniqueDesc.length === 1 ? '' : 's'}.`;
  }

  /* ---------- Edit command ---------- */

  // Applies name-edits within Stats: matches an existing stat by its current
  // label (case-insensitive). Only given subfields (Emoji/Name/Value) change;
  // if no stat has that label, a new one is added using whatever was given.
  function applyStatsEdits(beast, group){
    splitTopLevel(group).forEach(entry => {
      const parsed = splitKeyAndInner(entry);
      if(!parsed) return;
      const { key, inner } = parsed;
      const emojiRaw = extractKeywordBlock(inner, 'Emoji');
      const nameRaw = extractKeywordBlock(inner, 'Name');
      const valueRaw = extractKeywordBlock(inner, 'Value');
      const idx = beast.stats.findIndex(s => (s.label || '').trim().toLowerCase() === key.trim().toLowerCase());
      if(idx > -1){
        if(emojiRaw !== null) beast.stats[idx].emoji = stripQuotes(emojiRaw);
        if(nameRaw !== null) beast.stats[idx].label = stripQuotes(nameRaw);
        if(valueRaw !== null) beast.stats[idx].value = stripQuotes(valueRaw);
      } else {
        beast.stats.push({
          emoji: emojiRaw !== null ? stripQuotes(emojiRaw) : '',
          label: nameRaw !== null ? stripQuotes(nameRaw) : key,
          value: valueRaw !== null ? stripQuotes(valueRaw) : ''
        });
      }
    });
  }

  // Same idea as Stats, but for Type entries (matches by current type name;
  // only Emoji/Name subfields exist).
  function applyTypeEdits(beast, group){
    splitTopLevel(group).forEach(entry => {
      const parsed = splitKeyAndInner(entry);
      if(!parsed) return;
      const { key, inner } = parsed;
      const emojiRaw = extractKeywordBlock(inner, 'Emoji');
      const nameRaw = extractKeywordBlock(inner, 'Name');
      const idx = beast.types.findIndex(t => (t.name || '').trim().toLowerCase() === key.trim().toLowerCase());
      if(idx > -1){
        if(emojiRaw !== null) beast.types[idx].emoji = stripQuotes(emojiRaw);
        if(nameRaw !== null) beast.types[idx].name = stripQuotes(nameRaw);
      } else {
        beast.types.push({
          id: uid(),
          emoji: emojiRaw !== null ? stripQuotes(emojiRaw) : '',
          name: nameRaw !== null ? stripQuotes(nameRaw) : key
        });
      }
    });
  }

  // Info entries only rename a box's title (matches by current title); the
  // description text itself is never touched from the terminal.
  function applyInfoEdits(beast, group){
    splitTopLevel(group).forEach(entry => {
      const parsed = splitKeyAndInner(entry);
      if(!parsed) return;
      const { key, inner } = parsed;
      const newTitle = stripQuotes(inner);
      const idx = beast.desc.findIndex(d => (d.title || '').trim().toLowerCase() === key.trim().toLowerCase());
      if(idx > -1){
        beast.desc[idx].title = newTitle;
      } else {
        beast.desc.push({ title: newTitle, text: '' });
      }
    });
  }

  // Sets (or creates) a description box's text by title, matching the
  // first box whose current title matches case-insensitively.
  function applyInfoText(beast, title, text){
    const idx = beast.desc.findIndex(d => (d.title || '').trim().toLowerCase() === title.trim().toLowerCase());
    if(idx > -1){
      beast.desc[idx].text = text;
    } else {
      beast.desc.push({ title, text });
    }
  }

  /* ---------- EditInfo command (multi-line box text capture) ---------- */

  function handleEditInfo(trimmed, ctx){
    const rest = trimmed.replace(/^editinfo\s*/i, '');
    const selMatch = rest.match(/^#(\d+)/);
    if(!selMatch){
      return 'EditInfo needs a single beast right after it, e.g.: EditInfo #1 ("Description")';
    }
    const idx = parseInt(selMatch[1], 10);
    const beast = ctx.state.beasts[idx - 1];
    if(!beast) return `EditInfo: beast #${idx} doesn't exist.`;

    const afterSel = rest.slice(selMatch[0].length);
    const openIdx = afterSel.indexOf('(');
    if(openIdx === -1){
      return 'EditInfo needs a parenthesized list of box names, e.g.: EditInfo #1 ("Description","History")';
    }
    const res = extractBalanced(afterSel, openIdx);
    if(!res) return "EditInfo: parentheses don't match up.";

    const boxNames = splitTopLevel(res.content).map(stripQuotes).filter(n => n.length > 0);
    if(boxNames.length === 0) return 'EditInfo: no box names given.';

    multilineSession = {
      beast,
      boxNames,
      currentIndex: 0,
      buffer: []
    };

    return 'Finish writing by putting ONLY ._. on the last line to be sent.';
  }

  // Called by the page for every Enter press while a multiline capture is
  // active. Returns a status string (or '' for "keep typing, no message").
  window.terminalIsAwaitingMultiline = function(){
    return multilineSession !== null;
  };

  window.runTerminalMultilineLine = function(line, ctx){
    if(!multilineSession) return '';

    if(line.trim() === '._.'){
      const session = multilineSession;
      const text = session.buffer.join('\n');
      applyInfoText(session.beast, session.boxNames[session.currentIndex], text);
      session.currentIndex++;
      session.buffer = [];

      if(session.currentIndex >= session.boxNames.length){
        multilineSession = null;
        if(ctx && typeof ctx.renderAll === 'function') ctx.renderAll();
        return 'EditInfo: all boxes updated.';
      }
      return 'Finish writing by putting ONLY ._. on the last line to be sent.';
    }

    multilineSession.buffer.push(line);
    return '';
  };

  /* ---------- ChangeID / ChangeIDin commands ---------- */

  function swapBeasts(ctx, aId, bId){
    const aIdx = aId - 1, bIdx = bId - 1;
    const len = ctx.state.beasts.length;
    if(aIdx < 0 || aIdx >= len || bIdx < 0 || bIdx >= len){
      return "ChangeID: one of those IDs doesn't exist.";
    }
    const tmp = ctx.state.beasts[aIdx];
    ctx.state.beasts[aIdx] = ctx.state.beasts[bIdx];
    ctx.state.beasts[bIdx] = tmp;
    ctx.renderAll();
    return `Swapped #${aId} and #${bId}.`;
  }

  function handleChangeID(trimmed, ctx){
    const m = trimmed.match(/^changeid\s+#?(\d+)\s+#?(\d+)\s*$/i);
    if(!m) return 'ChangeID needs two IDs, e.g.: ChangeID #2 #6';
    const aId = parseInt(m[1], 10);
    const bId = parseInt(m[2], 10);
    return swapBeasts(ctx, aId, bId);
  }

  function handleChangeIDin(trimmed, ctx){
    const m = trimmed.match(/^changeidin\s+#?(\d+)\s+([+-])\s*(\d+)\s*$/i);
    if(!m) return 'ChangeIDin needs an ID and an offset, e.g.: ChangeIDin #2 +3';
    const aId = parseInt(m[1], 10);
    const sign = m[2] === '-' ? -1 : 1;
    const n = parseInt(m[3], 10);
    const bId = aId + sign * n;
    return swapBeasts(ctx, aId, bId);
  }

  /* ---------- Question command ---------- */

  function handleQuestion(trimmed, ctx){
    const rest = trimmed.replace(/^question\s*/i, '');
    const selMatch = rest.match(/^((?:#\d+(?:_\d+)?)(?:\s*,\s*#\d+(?:_\d+)?)*)/);
    if(!selMatch){
      return 'Question needs a selection right after it, e.g.: Question #1 Name';
    }
    const afterSel = rest.slice(selMatch[0].length);
    const targets = parseIndexList(selMatch[1]).map(n => ({ n, beast: ctx.state.beasts[n - 1] }));
    if(targets.every(t => !t.beast)) return "Question: none of those beasts exist.";

    // Scan left-to-right so results come back in the order they were asked.
    const queries = [];
    const re = /\b(Name|Stats|Info|Type)\b\s*(\()?/gi;
    let m;
    while((m = re.exec(afterSel)) !== null){
      const type = m[1].toLowerCase();
      if(m[2]){
        const openIdx = m.index + m[0].length - 1;
        const bal = extractBalanced(afterSel, openIdx);
        if(bal){
          queries.push({ type, content: bal.content });
          re.lastIndex = bal.end + 1;
        } else {
          queries.push({ type, content: null });
        }
      } else {
        queries.push({ type, content: null });
      }
    }
    if(queries.length === 0){
      return 'Question: ask for at least one of Name / Stats(...) / Info(...) / Type(...).';
    }

    if(!ctx.appendRichLine){
      return "Question: this view can't render answers.";
    }

    targets.forEach(({ n, beast }) => {
      if(!beast){
        ctx.appendRichLine(`#${n}: doesn't exist.`, 'err');
        return;
      }
      ctx.appendRichLine(`#${n} ${escapeHtml(beast.name || '(sin nombre)')}:`);
      queries.forEach(q => {
        if(q.type === 'name'){
          const val = beast.name && beast.name.length ? escapeHtml(beast.name) : NULL_HTML;
          ctx.appendRichLine(`&nbsp;&nbsp;Name: ${val}`);
        } else if(q.type === 'stats'){
          const labels = q.content !== null ? splitTopLevel(q.content).map(stripQuotes) : [];
          if(labels.length === 0){
            if(beast.stats.length === 0){ ctx.appendRichLine(`&nbsp;&nbsp;Stats: ${NULL_HTML}`); }
            else beast.stats.forEach(s => {
              const val = s.value !== '' ? escapeHtml(s.value) : NULL_HTML;
              ctx.appendRichLine(`&nbsp;&nbsp;Stats.${escapeHtml(s.label)}: ${val}`);
            });
          } else {
            labels.forEach(label => {
              const stat = beast.stats.find(s => (s.label || '').trim().toLowerCase() === label.trim().toLowerCase());
              const val = stat && stat.value !== '' ? escapeHtml(stat.value) : NULL_HTML;
              ctx.appendRichLine(`&nbsp;&nbsp;Stats.${escapeHtml(label)}: ${val}`);
            });
          }
        } else if(q.type === 'info'){
          const titles = q.content !== null ? splitTopLevel(q.content).map(stripQuotes) : [];
          if(titles.length === 0){
            if(beast.desc.length === 0){ ctx.appendRichLine(`&nbsp;&nbsp;Info: ${NULL_HTML}`); }
            else beast.desc.forEach(d => {
              const val = d.text !== '' ? escapeHtml(d.text) : NULL_HTML;
              ctx.appendRichLine(`&nbsp;&nbsp;Info.${escapeHtml(d.title)}: ${val}`);
            });
          } else {
            titles.forEach(title => {
              const info = beast.desc.find(d => (d.title || '').trim().toLowerCase() === title.trim().toLowerCase());
              const val = info && info.text !== '' ? escapeHtml(info.text) : NULL_HTML;
              ctx.appendRichLine(`&nbsp;&nbsp;Info.${escapeHtml(title)}: ${val}`);
            });
          }
        } else if(q.type === 'type'){
          const names = q.content !== null ? splitTopLevel(q.content).map(stripQuotes) : [];
          if(names.length === 0){
            if(beast.types.length === 0){ ctx.appendRichLine(`&nbsp;&nbsp;Type: ${NULL_HTML}`); }
            else beast.types.forEach(t => {
              const val = t.emoji ? escapeHtml(t.emoji) : NULL_HTML;
              ctx.appendRichLine(`&nbsp;&nbsp;Type.${escapeHtml(t.name)}: ${val}`);
            });
          } else {
            names.forEach(name => {
              const type = beast.types.find(t => (t.name || '').trim().toLowerCase() === name.trim().toLowerCase());
              const val = type && type.emoji ? escapeHtml(type.emoji) : NULL_HTML;
              ctx.appendRichLine(`&nbsp;&nbsp;Type.${escapeHtml(name)}: ${val}`);
            });
          }
        }
      });
    });

    return '';
  }

  function handleEdit(trimmed, ctx){
    const rest = trimmed.replace(/^edit\s*/i, '');
    const selMatch = rest.match(/^((?:#\d+(?:_\d+)?)(?:\s*,\s*#\d+(?:_\d+)?)*)/);
    if(!selMatch){
      return 'Edit needs a selection right after it, e.g.: Edit #1,#2 Name("...")';
    }
    const afterSel = rest.slice(selMatch[0].length);
    const targets = parseIndexList(selMatch[1])
      .map(n => ctx.state.beasts[n - 1])
      .filter(b => !!b);
    if(targets.length === 0) return "Edit: none of those beasts exist.";

    const nameBlock = extractKeywordBlock(afterSel, 'Name');
    const statsBlock = extractKeywordBlock(afterSel, 'Stats');
    const infoBlock = extractKeywordBlock(afterSel, 'Info');
    const typeBlock = extractKeywordBlock(afterSel, 'Type');

    const names = nameBlock !== null ? splitTopLevel(nameBlock).map(stripQuotes) : [];
    const statGroups = statsBlock !== null ? parseGroups(statsBlock) : [];
    const infoGroups = infoBlock !== null ? parseGroups(infoBlock) : [];
    const typeGroups = typeBlock !== null ? parseGroups(typeBlock) : [];

    if(!names.length && !statGroups.length && !infoGroups.length && !typeGroups.length){
      return 'Edit: nothing to change (add Name/Stats/Info/Type blocks).';
    }

    targets.forEach((beast, i) => {
      if(names.length) beast.name = names[i % names.length];
      if(statGroups.length) applyStatsEdits(beast, statGroups[i % statGroups.length]);
      if(infoGroups.length) applyInfoEdits(beast, infoGroups[i % infoGroups.length]);
      if(typeGroups.length) applyTypeEdits(beast, typeGroups[i % typeGroups.length]);
    });

    ctx.renderAll();
    return `Edited ${targets.length} beast${targets.length === 1 ? '' : 's'}.`;
  }

  /* ---------- Help command ---------- */

  const HELP_ME_TEXT =
`YourBestiary — quick guide
- Two tabs: LOOK (browse beast cards) and EDIT (edit their fields). Switch with the LOOK/EDIT buttons up top.
- Click "+ Añadir bestia" at the end of the list to create a new beast. Click a beast to select it.
- Use the ▲/▼ arrows (or right-click a beast) to reorder, duplicate, export, or delete it; the ✕ also deletes.
- In EDIT: set the name, upload a thumbnail and illustrations, add stats (emoji + value), description boxes, and type tags via their "+ Añadir ..." buttons.
- Use "💾 Guardar" to save the whole bestiary, and "📂 Cargar" to load a saved bestiary or a single beast file.
- A hidden terminal lives in the bottom-left corner (hover there, then click it) for fast bulk edits via /do commands. Type 'help do' for those.`;

  const HELP_DO_TEXT =
`/do terminal — command reference
- Limited On / Limited Off: turns access to "limited" (destructive) commands on/off. Starts OFF on page load.
- Clear all: wipes the whole workspace. Requires Limited On.
- Add <n> [Name(...)] [Stats(...)] [Info(...)] [Type(...)]: creates n beasts, cycling through the given Name/Stats/Info/Type blocks if fewer are given than n.
- Del(#1,#2,#3) / Del(#1_#3) / Del(#1_#3,#6_#9,#11): deletes beasts by their current #ID, supports lists and ranges.
- Edit #1,#2,#3 [Name(...)] [Stats(...)] [Info(...)] [Type(...)]: edits the given beasts' fields; existing Stats/Info/Type entries are matched by their current label/title, unmatched ones are added.
- EditInfo #1 ("Box1","Box2"): edits ONE beast's description box text. Opens a multi-line writing mode — everything you type goes into the current box until you send a line with only "._.", then it moves to the next box name given (creating it if it doesn't exist yet).
- ChangeID #2 #6: swaps the position of two beasts by their #ID.
- ChangeIDin #2 +n / #2 -n: swaps that beast with the one n positions ahead (+n) or behind (-n).
- Question #1,#2 Name Stats("HP","XP") Info("Descripcion") Type("Wizard"): asks for specific data from the given beasts, in the order asked; missing values are shown as null in red. Stats/Info/Type without parentheses list everything in that category.`;

  function handleHelp(trimmed){
    if(/^help\s+me$/i.test(trimmed)) return HELP_ME_TEXT;
    if(/^help\s+do$/i.test(trimmed)) return HELP_DO_TEXT;
    return "Use 'help me' to get general assistance, and 'help do' to get /do terminal assistance";
  }

  /* ---------- dispatcher ---------- */

  window.runTerminalCommand = function(cmd, ctx){
    const trimmed = cmd.trim();

    if(/^help\b/i.test(trimmed)){
      return handleHelp(trimmed);
    }

    if(/^limited\s+on$/i.test(trimmed)){
      limitedEnabled = true;
      return 'Limited commands are now ON.';
    }
    if(/^limited\s+off$/i.test(trimmed)){
      limitedEnabled = false;
      return 'Limited commands are now OFF.';
    }
    if(/^limited$/i.test(trimmed)){
      return `Limited commands are currently ${limitedEnabled ? 'ON' : 'OFF'}.`;
    }

    if(/^clear\s+all$/i.test(trimmed)){
      if(!limitedEnabled) return "You can't do that";
      ctx.state.beasts = [];
      ctx.state.selectedId = null;
      ctx.renderAll();
      return 'Workspace cleared.';
    }

    if(/^add\b/i.test(trimmed)){
      return handleAdd(trimmed, ctx);
    }

    if(/^del\s*\(/i.test(trimmed)){
      return handleDel(trimmed, ctx);
    }

    if(/^editinfo\b/i.test(trimmed)){
      return handleEditInfo(trimmed, ctx);
    }

    if(/^edit\b/i.test(trimmed)){
      return handleEdit(trimmed, ctx);
    }

    if(/^changeidin\b/i.test(trimmed)){
      return handleChangeIDin(trimmed, ctx);
    }

    if(/^changeid\b/i.test(trimmed)){
      return handleChangeID(trimmed, ctx);
    }

    if(/^question\b/i.test(trimmed)){
      return handleQuestion(trimmed, ctx);
    }

    return `Unknown command: "${cmd}"`;
  };

})();
