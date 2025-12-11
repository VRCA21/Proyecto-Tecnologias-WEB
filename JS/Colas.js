const API_URL = 'http://localhost:3000';
let colaActual = 'Principal';

document.addEventListener('DOMContentLoaded', function() {
    cargarListaColas();
    actualizarVista();

    // Referencias DOM
    const btnPush = document.getElementById('btnPush');       // Enqueue
    const btnPop = document.getElementById('btnPop');         // Dequeue
    const btnClear = document.getElementById('btnClearCola'); // Vaciar
    const inputElemento = document.getElementById('inputElemento');
    const selectCola = document.getElementById('selectCola');
    const btnCrear = document.getElementById('btnCrearCola');
    const inputNueva = document.getElementById('inputNuevaCola');

    // --- 1. EVENTO ENQUEUE (Push) ---
    btnPush.addEventListener('click', async () => {
        const valor = inputElemento.value.trim();
        if (valor) {
            await fetch(`${API_URL}/enqueue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: colaActual, elemento: valor })
            });
            inputElemento.value = '';
            
            // true = activar animación de entrada para el nuevo elemento
            actualizarVista(true); 
            generarCodigoC('enqueue', valor);
        }
    });

    // --- 2. EVENTO DEQUEUE (Pop con Animación) ---
    btnPop.addEventListener('click', async () => {
        const stackView = document.getElementById('stackView');
        // En una Cola visualizada de arriba a abajo, el primero es el 'firstChild'
        const elementoFrente = stackView.firstElementChild;

        if (elementoFrente && elementoFrente.tagName === "DIV") {
            elementoFrente.classList.add("saliendo-pop");
            setTimeout(async () => {
                await fetch(`${API_URL}/dequeue`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: colaActual })
                });
                actualizarVista();
                generarCodigoC('dequeue');
            }, 500); 
        } else {
            await fetch(`${API_URL}/dequeue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: colaActual })
            });
            actualizarVista();
            generarCodigoC('dequeue');
        }
    });

    // --- 3. EVENTO VACIAR ---
    btnClear.addEventListener('click', async () => {
        await fetch(`${API_URL}/clearQueue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: colaActual })
        });
        actualizarVista();
        generarCodigoC('clear');
    });

    // --- 4. CREAR NUEVA COLA ---
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

    // --- 5. CAMBIAR DE COLA ---
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

async function actualizarVista(animarNuevo = false) {
    const res = await fetch(`${API_URL}/queue/${colaActual}`);
    const cola = await res.json();
    
    const view = document.getElementById('stackView'); 
    view.innerHTML = '';
    view.style.flexDirection = 'column'; 
    view.style.justifyContent = 'flex-start';

    if (cola.length === 0) {
        view.innerHTML = '<p>Cola vacía</p>';
        return;
    }
    cola.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('elemento-pila'); 
        
        let texto = item;
        if (index === 0) {
            div.style.borderLeft = "5px solid #2ecc71"; 
            texto += " (FRENTE)";
        } else if (index === cola.length - 1) {
            div.style.borderLeft = "5px solid #f1c40f";
            texto += " (FINAL)";
            if (animarNuevo) {
                div.classList.add("nuevo-push");
            }
        }

        div.textContent = texto;
        view.appendChild(div);
    });
}

function generarCodigoC(accion, valor = '') {
    const view = document.getElementById('codigoC');
    let codigo = '';
    const varName = colaActual.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    switch(accion) {
        case 'enqueue':
            codigo = `// Enqueue: Agregando '${valor}' al final\n` +
                     `if (rear < MAX) {\n` +
                     `    ${varName}[rear++] = "${valor}";\n` +
                     `} else printf("Overflow");`;
            break;
        case 'dequeue': 
            codigo = `// Dequeue: Sacando del frente\n` +
                     `if (front == rear) printf("Underflow");\n` +
                     `else elemento = ${varName}[front++];`;
            break;
        case 'switch':
            codigo = `// Seleccionando cola: ${varName}`;
            break;
        case 'clear':
            codigo = `front = 0; rear = 0; // Reiniciar punteros`;
            break;
    }
    view.innerText = codigo;
}