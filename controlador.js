/* Multi-stack controller (limpio) */
const LS_KEY_PILAS = "mis_pilas_v1";
const LS_KEY_PILA_ACTUAL = "mis_pila_actual_v1";
const LEGACY_KEY_DATOS = "mis_registros_datos_v1";

let pilas = {};
let pilaActual = null;

function guardarPilas(){
  try {
    localStorage.setItem(LS_KEY_PILAS, JSON.stringify(pilas));
    localStorage.setItem(LS_KEY_PILA_ACTUAL, pilaActual ?? '');
  } catch(e){
    console.error('Error guardando en localStorage:', e);
  }
}

function cargarPilas(){
  pilas = {};
  const raw = localStorage.getItem(LS_KEY_PILAS);
  if (raw) {
    try { pilas = JSON.parse(raw) || {}; } catch(e){ console.warn('LS mis_pilas_v1 corrupto, se ignorará.'); pilas = {}; }
  } else {
    const legacy = localStorage.getItem(LEGACY_KEY_DATOS);
    if (legacy){
      try{
        const arr = JSON.parse(legacy);
        if (Array.isArray(arr)) pilas = { 'default': arr };
      }catch(e){ /* ignore */ }
    }
  }
  const sel = localStorage.getItem(LS_KEY_PILA_ACTUAL);
  if (sel && pilas[sel]) pilaActual = sel;
  else pilaActual = Object.keys(pilas)[0] || null;
  actualizarListaPilas();
  actualizarVistaPila();
}

function crearPila(nombre){
  if (!nombre) return;
  if (pilas[nombre]){ alert('Ya existe una pila con ese nombre.'); return; }
  pilas[nombre] = [];
  pilaActual = nombre;
  guardarPilas();
  actualizarListaPilas();
  actualizarVistaPila();
}

function eliminarPila(nombre){
  if (!nombre || !pilas[nombre]) return;
  if (!confirm('Eliminar la pila "' + nombre + '"?')) return;
  delete pilas[nombre];
  const keys = Object.keys(pilas);
  pilaActual = keys[0] || null;
  guardarPilas();
  actualizarListaPilas();
  actualizarVistaPila();
}

function seleccionarPila(nombre){
  if (!nombre || !pilas[nombre]) return;
  pilaActual = nombre;
  guardarPilas();
  actualizarVistaPila();
}

function añadirElemento(valor){
  if (!pilaActual){ alert('No hay pila seleccionada. Crea o selecciona una pila primero.'); return; }
  if (typeof valor === 'undefined'){
    const input = document.getElementById('inputElemento');
    if (input && input.value.trim() !== ''){ valor = input.value.trim(); input.value = ''; }
    else { valor = prompt('Valor para añadir a la pila:'); if (valor === null || valor === '') return; }
  }
  pilas[pilaActual].push(valor);
  guardarPilas();
  actualizarVistaPila();
}

function eliminarElemento(){
  if (!pilaActual){ alert('No hay pila seleccionada.'); return null; }
  const arr = pilas[pilaActual] || [];
  if (arr.length === 0){ alert('Pila vacía'); return null; }
  const eliminado = arr.pop();
  guardarPilas();
  actualizarVistaPila();
  return eliminado;
}

function vaciarPila(){
  if (!pilaActual) return;
  if (!confirm('Vaciar la pila "' + pilaActual + '"?')) return;
  pilas[pilaActual] = [];
  guardarPilas();
  actualizarVistaPila();
}

function actualizarListaPilas(){
  const sel = document.getElementById('selectPilas'); if (!sel) return;
  sel.innerHTML = '';
  const keys = Object.keys(pilas);
  if (keys.length === 0){
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- sin pilas --';
    sel.appendChild(opt);
    return;
  }
  for (const k of keys){
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    sel.appendChild(opt);
  }
  if (pilaActual) sel.value = pilaActual;
}

function actualizarVistaPila(){
  const cont = document.getElementById('stackView'); if (!cont) return; cont.innerHTML = '';
  if (!pilaActual){ cont.textContent = 'No hay pila seleccionada.'; return; }
  const arr = pilas[pilaActual] || [];
  const title = document.createElement('div'); title.className = 'title';
  title.textContent = 'Pila: ' + pilaActual + ' (tamaño: ' + arr.length + ')';
  cont.appendChild(title);
  if (arr.length === 0){
    const empty = document.createElement('div'); empty.textContent = 'La pila está vacía.'; cont.appendChild(empty); return;
  }
  // Mostrar tope primero (último elemento en el array)
  for (let i = arr.length - 1; i >= 0; i--){
    const el = document.createElement('div');
    el.className = 'stack-item';
    el.textContent = arr[i];
    cont.appendChild(el);
  }
}

/* Inicialización (única) */
function inicializar(){
  // botones y eventos
  document.getElementById('btnCreatePila')?.addEventListener('click', () => {
    const input = document.getElementById('inputNewPila');
    let nombre = input && input.value.trim();
    if (!nombre) nombre = prompt('Nombre de la nueva pila:');
    if (!nombre) return;
    if (input) input.value = '';
    crearPila(nombre);
  });

  document.getElementById('btnLoadPilas')?.addEventListener('click', () => {
    cargarPilas();
    alert('Pilas recargadas desde localStorage.');
  });

  document.getElementById('btnDeletePila')?.addEventListener('click', () => {
    const sel = document.getElementById('selectPilas'); if (!sel) return;
    const nombre = sel.value; if (!nombre) return;
    eliminarPila(nombre);
  });

  document.getElementById('btnPush')?.addEventListener('click', () => añadirElemento());
  document.getElementById('btnPop')?.addEventListener('click', () => {
    const e = eliminarElemento();
    if (e !== null) alert('Eliminado: ' + e);
  });

  document.getElementById('btnClearPila')?.addEventListener('click', () => vaciarPila());

  document.getElementById('selectPilas')?.addEventListener('change', (ev) => seleccionarPila(ev.target.value));

  // cargar desde storage al inicio
  cargarPilas();
}

document.addEventListener('DOMContentLoaded', inicializar);