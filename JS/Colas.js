const API_URL = 'http://localhost:3000';
let colaActual = 'Principal';

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a los IDs exactos de tu HTML
    const btnPush = document.getElementById('btnPush');       // Funciona como Enqueue
    const btnPop = document.getElementById('btnPop');         // Funciona como Dequeue
    const btnClear = document.getElementById('btnClearCola'); // Tu botón de vaciar
    const inputElemento = document.getElementById('inputElemento');
    const selectCola = document.getElementById('selectCola');
    const btnCrear = document.getElementById('btnCrearCola');
    const inputNueva = document.getElementById('inputNuevaCola');

    // Carga inicial
    cargarListaColas();
    actualizarVista();

    // 1. EVENTO PUSH (En realidad es Enqueue)
    btnPush.addEventListener('click', async () => {
        const valor = inputElemento.value.trim();
        if (valor) {
            await fetch(`${API_URL}/enqueue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: colaActual, elemento: valor })
            });
            inputElemento.value = '';
            actualizarVista();
            generarCodigoC('enqueue', valor);
        }
    });

    // 2. EVENTO POP (En realidad es Dequeue)
    btnPop.addEventListener('click', async () => {
        await fetch(`${API_URL}/dequeue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: colaActual })
        });
        actualizarVista();
        generarCodigoC('dequeue');
    });

    // 3. EVENTO VACIAR
    btnClear.addEventListener('click', async () => {
        await fetch(`${API_URL}/clearQueue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: colaActual })
        });
        actualizarVista();
        generarCodigoC('clear');
    });

    // 4. CREAR NUEVA COLA
    btnCrear.addEventListener('click', async () => {
        const nombre = inputNueva.value.trim();
        if(nombre) {
            await fetch(`${API_URL}/queues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nombre })
            });
            inputNueva.value = '';
            cargarListaColas();
        }
    });

    // 5. CAMBIAR DE COLA
    selectCola.addEventListener('change', (e) => {
        colaActual = e.target.value;
        if(document.getElementById('tituloColaActual')) {
            document.getElementById('tituloColaActual').innerText = `Trabajando en: ${colaActual}`;
        }
        actualizarVista();
        generarCodigoC('switch');
    });
});

// --- FUNCIONES AUXILIARES ---

async function cargarListaColas() {
    const res = await fetch(`${API_URL}/queues`);
    const lista = await res.json();
    const select = document.getElementById('selectCola');
    select.innerHTML = '';
    
    lista.forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        option.innerText = nombre;
        if(nombre === colaActual) option.selected = true;
        select.appendChild(option);
    });
}

async function actualizarVista() {
    const res = await fetch(`${API_URL}/queue/${colaActual}`);
    const cola = await res.json();
    
    // Usamos 'stackView' porque así se llama en tu HTML
    const view = document.getElementById('stackView'); 
    view.innerHTML = '';
    
    // Forzamos estilo horizontal para que parezca Cola, no Pila
    view.style.display = 'flex';
    view.style.flexWrap = 'wrap';
    view.style.gap = '10px';
    view.style.marginTop = '20px';

    if (cola.length === 0) {
        view.innerHTML = '<p style="width:100%">Cola vacía</p>';
        return;
    }

    cola.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9; min-width: 50px; text-align: center;';
        
        // Identificar Frente y Final
        if (index === 0) {
            div.style.backgroundColor = '#e8f5e9'; // Verde claro para el que va a salir
            div.style.fontWeight = 'bold';
            div.innerHTML = `${item}<br><small>(Frente)</small>`;
        } else if (index === cola.length - 1) {
            div.innerHTML = `${item}<br><small>(Final)</small>`;
        } else {
            div.textContent = item;
        }
        
        view.appendChild(div);
    });
}

function generarCodigoC(accion, valor = '') {
    const view = document.getElementById('codigoC');
    let codigo = '';
    const varName = colaActual.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    switch(accion) {
        case 'enqueue': // Botón Push
            codigo = `// Enqueue: Agregando '${valor}' al final\n` +
                     `cola[final] = "${valor}";\n` +
                     `final++;`;
            break;
        case 'dequeue': // Botón Pop
            codigo = `// Dequeue: Sacando del frente\n` +
                     `elemento = cola[frente];\n` +
                     `frente++;`;
            break;
        case 'switch':
            codigo = `// Seleccionando cola: ${varName}`;
            break;
        case 'clear':
            codigo = `frente = 0; final = 0;`;
            break;
    }
    view.innerText = codigo;
}