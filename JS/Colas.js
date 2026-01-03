// --- CONFIGURACIÓN INICIAL ---
const API_URL = 'http://localhost:3000'; // Servidor backend
let colaActual = 'Principal'; // Cola seleccionada por defecto

// Se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarListaColas(); // Llena el selector
    actualizarVista();  // Dibuja la cola inicial

    // Referencias a elementos del DOM
    const btnPush = document.getElementById('btnPush');       // Botón "Formarse" (Enqueue)
    const btnPop = document.getElementById('btnPop');         // Botón "Atender/Salir" (Dequeue)
    const btnClear = document.getElementById('btnClearCola'); // Botón Vaciar
    const inputElemento = document.getElementById('inputElemento');
    const selectCola = document.getElementById('selectCola');
    const btnCrear = document.getElementById('btnCrearCola');
    const inputNueva = document.getElementById('inputNuevaCola');

    // EVENTO ENQUEUE (PUSH ) ---
    // En una cola, los nuevos elementos siempre van al FINAL.
    btnPush.addEventListener('click', async () => {
        const valor = inputElemento.value.trim();
        
        if (valor) {
            // Petición al servidor para agregar al final
            await fetch(`${API_URL}/enqueue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: colaActual, elemento: valor })
            });
            
            inputElemento.value = '';
            
            // Actualizamos vista activando la animación para el nuevo elemento (que estará abajo)
            actualizarVista(true); 
            
            // Mostramos el código C de "enqueue"
            generarCodigoC('enqueue', valor);
        }
    });

    // --- EVENTO DEQUEUE (POP / ATENDER) ---
    // En una cola, el que sale es el del FRENTE (el primero que llegó).
    btnPop.addEventListener('click', async () => {
        const stackView = document.getElementById('stackView');
        // Seleccionamos visualmente el primer elemento (el de hasta arriba)
        const elementoFrente = stackView.firstElementChild;

        if (elementoFrente && elementoFrente.tagName === "DIV") {
            // 1. Animación: Se pone rojo y sale
            elementoFrente.classList.add("saliendo-pop");
            
            // 2. Esperamos a que termine la animación
            setTimeout(async () => {
                // 3. Petición al servidor para eliminar el primero (shift)
                await fetch(`${API_URL}/dequeue`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: colaActual })
                });
                
                actualizarVista(); // Redibujamos la fila (todos avanzan un lugar)
                generarCodigoC('dequeue');
            }, 500); 
        } else {
            // Si estaba vacía, mandamos la petición directo
            await fetch(`${API_URL}/dequeue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: colaActual })
            });
            actualizarVista();
            generarCodigoC('dequeue');
        }
    });

    // --- VACIAR COLA ---
    btnClear.addEventListener('click', async () => {
        await fetch(`${API_URL}/clearQueue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: colaActual })
        });
        actualizarVista();
        generarCodigoC('clear');
    });

    // --- CREAR NUEVA COLA ---
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

    // --- CAMBIAR DE COLA ---
    selectCola.addEventListener('change', (e) => {
        colaActual = e.target.value;
        if(document.getElementById('tituloColaActual')) {
            document.getElementById('tituloColaActual').innerText = `Trabajando en: ${colaActual}`;
        }
        actualizarVista();
        generarCodigoC('switch');
    });
});

// --- FUNCIONES VISUALES  ---

// Carga las colas disponibles en el select
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

// Dibuja la cola
async function actualizarVista(animarNuevo = false) {
    const res = await fetch(`${API_URL}/queue/${colaActual}`);
    const cola = await res.json(); // Array con los datos [A, B, C]
    
    const view = document.getElementById('stackView'); 
    view.innerHTML = '';
    
    // Configuramos CSS para que sea una columna normal (de arriba a abajo)
    // El elemento 0 (Frente) queda arriba.
    view.style.flexDirection = 'column'; 
    view.style.justifyContent = 'flex-start';

    if (cola.length === 0) {
        view.innerHTML = '<p>Cola vacía</p>';
        return;
    }
    
    // Recorremos el array en orden normal (0 al final)
    cola.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('elemento-pila'); // Reusamos estilos
        
        let texto = item;
        
        // Marcamos el FRENTE (índice 0) con verde
        if (index === 0) {
            div.style.borderLeft = "5px solid #2ecc71"; 
            texto += " (FRENTE)";
        
        // Marcamos el FINAL (último índice) con amarillo
        } else if (index === cola.length - 1) {
            div.style.borderLeft = "5px solid #f1c40f";
            texto += " (FINAL)";
            
            // Si es nuevo, animamos SOLO el elemento final
            if (animarNuevo) {
                div.classList.add("nuevo-push");
            }
        }

        div.textContent = texto;
        view.appendChild(div);
    });
}

// --- GENERADOR DE CÓDIGO C ---
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