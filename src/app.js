/* Amigo Secreto - lógica principal (vanilla JS) */
const STORAGE_KEY = "amigoSecreto.participants";
const RESULT_KEY = "amigoSecreto.results";

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const state = {
  participants: loadParticipants(),
  results: loadResults()
};

function loadParticipants(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch(e){ return []; }
}
function saveParticipants(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.participants));
  updateCount();
}
function loadResults(){
  try { return JSON.parse(localStorage.getItem(RESULT_KEY)) ?? []; }
  catch(e){ return []; }
}
function saveResults(){
  localStorage.setItem(RESULT_KEY, JSON.stringify(state.results));
}

function updateCount(){
  const n = state.participants.length;
  $('#countBadge').textContent = `${n} participante${n===1?'':'s'}`;
}

function renderList(){
  const ul = $('#list');
  ul.innerHTML = "";
  state.participants.forEach((name, idx)=>{
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'name';
    span.textContent = name;
    const btn = document.createElement('button');
    btn.className = 'remove';
    btn.type = 'button';
    btn.textContent = 'Eliminar';
    btn.addEventListener('click', ()=>{
      state.participants.splice(idx,1);
      saveParticipants();
      renderList();
    });
    li.appendChild(span);
    li.appendChild(btn);
    ul.appendChild(li);
  });
  updateCount();
}

function showMessage(text, type="info"){
  const el = $('#message');
  el.textContent = text || "";
  el.style.color = (type === "error") ? "#fca5a5" : "#94a3b8";
}

function normalizeName(s){ return s.trim().replace(/\s+/g,' '); }

// Agregar participante
$('#addForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const input = $('#nameInput');
  let name = normalizeName(input.value);
  if(!name){ showMessage("Escribe un nombre válido.", "error"); return; }
  // evitar duplicados (case-insensitive)
  const exists = state.participants.some(n => n.toLowerCase() === name.toLowerCase());
  if(exists){ showMessage(`"${name}" ya está en la lista.`, "error"); return; }
  state.participants.push(name);
  input.value = "";
  saveParticipants();
  renderList();
  showMessage("");
});

// Importar lista (pegar texto separado por comas o saltos de línea)
$('#importBtn').addEventListener('click', ()=>{
  const text = prompt("Pega aquí nombres separados por comas o saltos de línea:");
  if(text == null) return;
  const parts = text.split(/[,\n]/).map(normalizeName).filter(Boolean);
  if(parts.length === 0){ showMessage("No se encontraron nombres.", "error"); return; }
  let added = 0, skipped = 0;
  for(const name of parts){
    const exists = state.participants.some(n => n.toLowerCase() === name.toLowerCase());
    if(!exists){ state.participants.push(name); added++; }
    else skipped++;
  }
  saveParticipants();
  renderList();
  showMessage(`Importados: ${added}. Omitidos (duplicados): ${skipped}.`);
});

// Limpiar lista
$('#clearBtn').addEventListener('click', ()=>{
  if(confirm("¿Seguro que quieres borrar todos los participantes?")){
    state.participants = [];
    saveParticipants();
    renderList();
    state.results = [];
    saveResults();
    renderResults();
    showMessage("Lista vacía.");
  }
});

// Exportar CSV
$('#exportBtn').addEventListener('click', ()=>{
  if(state.results.length === 0){
    if(state.participants.length === 0){ showMessage("No hay datos para exportar.", "error"); return; }
    const csv = 'Nombre\n' + state.participants.map(n => `"${n}"`).join('\n');
    downloadFile('participantes.csv', csv, 'text/csv;charset=utf-8');
  }else{
    const csv = 'De,Para\n' + state.results.map(p => `"${p.from}","${p.to}"`).join('\n');
    downloadFile('sorteo.csv', csv, 'text/csv;charset=utf-8');
  }
});

function downloadFile(filename, content, mime){
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Algoritmo de derangement (nadie se asigna a sí mismo)
function derangement(items){
  const n = items.length;
  if(n === 1) return null; // imposible
  // Permutación aleatoria
  const idx = Array.from({length:n}, (_,i)=>i);
  // Fisher-Yates
  for(let i=n-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  // Arreglar puntos fijos
  for(let i=0;i<n;i++){
    if(idx[i] === i){
      const swapWith = (i+1) % n;
      [idx[i], idx[swapWith]] = [idx[swapWith], idx[i]];
    }
  }
  // Validar
  for(let i=0;i<n;i++){ if(idx[i] === i) return null; }
  return idx.map(j => items[j]);
}

function draw(){
  const names = [...state.participants];
  if(names.length < 2){
    showMessage("Necesitas al menos 2 participantes para sortear.", "error");
    return;
  }
  let attempts = 0, result = null;
  while(attempts < 50 && !result){
    const toList = derangement(names);
    if(toList){
      result = names.map((from, i) => ({from, to: toList[i]}));
      // Garantizar que nadie se asigna a sí mismo (doble check)
      if(result.some(p => p.from === p.to)){ result = null; }
    }
    attempts++;
  }
  if(!result){
    showMessage("No se pudo generar un sorteo válido. Intenta de nuevo.", "error");
    return;
  }
  state.results = result;
  saveResults();
  renderResults();
  showMessage(`¡Sorteo generado para ${names.length} participante(s)!`);
}

function renderResults(){
  const ol = $('#results');
  ol.innerHTML = "";
  state.results.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.from} → ${p.to}`;
    ol.appendChild(li);
  });
}

// Copiar resultados
$('#copyBtn').addEventListener('click', async ()=>{
  if(state.results.length === 0){ showMessage("Aún no hay resultados que copiar.", "error"); return; }
  const text = state.results.map(p => `${p.from} → ${p.to}`).join('\n');
  try{
    await navigator.clipboard.writeText(text);
    showMessage("Resultados copiados al portapapeles.");
  }catch(e){
    showMessage("No se pudo copiar automáticamente. Descarga el CSV.", "error");
  }
});

// Borrar resultados
$('#clearResultsBtn').addEventListener('click', ()=>{
  state.results = [];
  saveResults();
  renderResults();
  showMessage("Resultados borrados.");
});

// Sorteo
$('#drawBtn').addEventListener('click', draw);

// Inicializar
renderList();
renderResults();
updateCount();
