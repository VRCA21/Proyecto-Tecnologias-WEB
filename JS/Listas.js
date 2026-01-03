// --- CONFIGURACIÓN INICIAL ---
const API_URL = "http://localhost:3000"; // Conexión con el servidor
let listaActual = "Principal"; // Nombre de la lista que estamos editando

// Se ejecuta al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  cargarListas(); // Llena el selector con las listas disponibles
  actualizarVista(); // Dibuja la lista inicial en pantalla

  // Referencias a elementos del HTML
  const selectLista = document.getElementById("selectLista");
  const inputElemento = document.getElementById("inputElemento");

  // --- BOTONES DE ACCIÓN ---
  
  // AGREGAR AL INICIO (HEAD)
  document.getElementById("btnAddHead").addEventListener("click", async () => {
    const valor = inputElemento.value.trim();
    if (valor) {
      // Petición al servidor para agregar al principio
      await fetch(`${API_URL}/list/addHead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listaActual, elemento: valor }),
      });
      
      inputElemento.value = ""; // Limpiar
      
      // Actualizamos la vista indicando que la animación debe ser en el 'head'
      actualizarVista(true, "head"); 
      
      // Mostramos el código C correspondiente a esta operación
      generarCodigoC("addHead", valor);
    }
  });

  // AGREGAR AL FINAL (TAIL)
  // Aquí tendríamos que recorrer toda la lista hasta encontrar el último nodo.
  document.getElementById("btnAddTail").addEventListener("click", async () => {
    const valor = inputElemento.value.trim();
    
    if (valor) {
      // Petición al servidor para agregar al final
      await fetch(`${API_URL}/list/addTail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listaActual, elemento: valor }),
      });
      
      inputElemento.value = "";
      
      // Actualizamos indicando que la animación es en la cola ('tail')
      actualizarVista(true, "tail");
      generarCodigoC("addTail", valor);
    }
  });

  // ELIMINAR EL PRIMERO (HEAD)
  document.getElementById("btnRemoveHead").addEventListener("click", async () => {
    const view = document.getElementById("listView");
    // Buscamos visualmente el primer nodo
    const primerNodo = view.querySelector(".nodo-wrapper"); 

    if (primerNodo) {
        // 1. Animación: Se pone rojo y sale volando
        primerNodo.classList.add("saliendo-pop");
        
        // 2. Esperamos a que termine la animación visual
        setTimeout(async () => {
            // 3. Borramos realmente del almacenamiento
            await fetch(`${API_URL}/list/removeHead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: listaActual }),
            });
            actualizarVista(); // Recargamos
            generarCodigoC("removeHead");
        }, 500);
    }
  });

  // ELIMINAR EL ÚLTIMO (TAIL)
  document.getElementById("btnRemoveTail").addEventListener("click", async () => {
    const view = document.getElementById("listView");
    const nodos = view.querySelectorAll(".nodo-wrapper");
    // Buscamos visualmente el último nodo de la lista
    const ultimoNodo = nodos[nodos.length - 1];

    if (ultimoNodo) {
        // 1. Animación de salida
        ultimoNodo.classList.add("saliendo-pop");
        
        // 2. Espera y borrado lógico
        setTimeout(async () => {
            await fetch(`${API_URL}/list/removeTail`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: listaActual }),
            });
            actualizarVista();
            generarCodigoC("removeTail");
        }, 500);
    }
  });

  // VACIAR LISTA COMPLETA
  document.getElementById("btnClearList").addEventListener("click", async () => {
      await fetch(`${API_URL}/clearList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listaActual }),
      });
      actualizarVista();
      generarCodigoC("clear");
  });

  // CREAR NUEVA LISTA
  document.getElementById("btnCrearLista").addEventListener("click", async () => {
    const nombre = document.getElementById("inputNuevaLista").value.trim();
    if (nombre) {
      await fetch(`${API_URL}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre }),
      });
      document.getElementById("inputNuevaLista").value = "";
      cargarListas();
    }
  });

  // --- CAMBIAR DE LISTA ---
  selectLista.addEventListener("change", (e) => {
    listaActual = e.target.value;
    document.getElementById("tituloListaActual").innerText = `Trabajando en: ${listaActual}`;
    actualizarVista();
    generarCodigoC("switch");
  });
});

// --- FUNCIONES VISUALES (DIBUJAR LA LISTA) ---

// Obtiene todas las listas creadas para el menú desplegable
async function cargarListas() {
  const res = await fetch(`${API_URL}/lists`);
  const lista = await res.json();
  const select = document.getElementById("selectLista");
  select.innerHTML = "";
  lista.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.innerText = nombre;
    if (nombre === listaActual) option.selected = true;
    select.appendChild(option);
  });
}

// Dibuja los nodos horizontalmente con flechas
async function actualizarVista(animar = false, lugar = "tail") {
  const res = await fetch(`${API_URL}/list/${listaActual}`);
  const datos = await res.json();
  const view = document.getElementById("listView");
  view.innerHTML = ""; // Limpiamos pantalla

  if (datos.length === 0) {
    view.innerHTML = "<p>Lista vacía (NULL)</p>";
    return;
  }

  // --- RENDERIZADO DE NODOS ---
  datos.forEach((valor, index) => {
    // Creamos un contenedor "wrapper" que agrupa: [NODO] + [FLECHA]
    const wrapper = document.createElement("div");
    wrapper.className = "nodo-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";

    //  Dibujamos la caja del NODO
    const nodo = document.createElement("div");
    nodo.className = "elemento-pila"; 
    nodo.style.margin = "0 5px";
    nodo.style.width = "auto";
    nodo.style.minWidth = "60px";
    
    // Agregamos etiquetas visuales HEAD y TAIL
    let html = `<div>${valor}</div>`;
    if(index === 0) html += `<small style='color:green; font-weight:bold'>HEAD</small>`;
    if(index === datos.length -1) html += `<br><small style='color:blue'>TAIL</small>`;
    nodo.innerHTML = html;

    wrapper.appendChild(nodo);

    // Dibujamos la FLECHA (pointer)
    const flecha = document.createElement("div");
    flecha.innerHTML = "➜";
    flecha.style.fontSize = "24px";
    flecha.style.color = "#555";
    flecha.style.margin = "0 5px";
    wrapper.appendChild(flecha);

    // --- LOGICA DE ANIMACIÓN ---
    // Si estamos animando, decidimos a quién ponerle el efecto "rebote"
    if (animar) {
        // Si insertamos al inicio, animamos el índice 0
        if (lugar === "head" && index === 0) {
            wrapper.classList.add("nuevo-push");
        }
        // Si insertamos al final, animamos el último índice
        if (lugar === "tail" && index === datos.length - 1) {
            wrapper.classList.add("nuevo-push");
        }
    }

    view.appendChild(wrapper);
  });

  // Agregamos el NULL al final visualmente para completar el diagrama
  const nullDiv = document.createElement("div");
  nullDiv.className = "nodo-null";
  nullDiv.innerHTML = "NULL";
  nullDiv.style.cssText = "border: 2px dashed #999; padding: 5px; border-radius: 5px; color: #777; font-weight: bold;";
  view.appendChild(nullDiv);
}

// --- GENERADOR DE CÓDIGO C  ---
// Muestra cómo se haría esto en programación estructurada en C
function generarCodigoC(accion, valor = "") {
  const view = document.getElementById("codigoC");
  let codigo = "";
  const varName = listaActual.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  switch (accion) {
    case "addHead":
      codigo = `// Insertar al inicio\nstruct Node* nuevo = crearNodo(${valor});\nnuevo->next = head;\nhead = nuevo;`;
      break;
    case "addTail":
      codigo = `// Insertar al final\nstruct Node* nuevo = crearNodo(${valor});\nif(!head) head = nuevo;\nelse {\n  Node* temp = head;\n  while(temp->next) temp = temp->next;\n  temp->next = nuevo;\n}`;
      break;
    case "removeHead":
      codigo = `// Eliminar inicio\nif(head) {\n  Node* temp = head;\n  head = head->next;\n  free(temp);\n}`;
      break;
    case "removeTail":
      codigo = `// Eliminar final\nif(head->next == NULL) free(head);\nelse {\n  while(temp->next->next) temp = temp->next;\n  free(temp->next);\n  temp->next = NULL;\n}`;
      break;
    case "clear":
      codigo = `while(head != NULL) removeHead();`;
      break;
    default:
      codigo = `// Operación en lista: ${varName}`;
  }
  view.innerText = codigo;
}