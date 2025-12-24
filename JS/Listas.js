const API_URL = "http://localhost:3000";
let listaActual = "Principal";

document.addEventListener("DOMContentLoaded", function () {
  cargarListas();
  actualizarVista();

  // Referencias DOM
  const selectLista = document.getElementById("selectLista");
  const inputElemento = document.getElementById("inputElemento");

  // --- BOTONES ---
  
  // Agregar al Inicio (Head)
  document.getElementById("btnAddHead").addEventListener("click", async () => {
    const valor = inputElemento.value.trim();
    if (valor) {
      await fetch(`${API_URL}/list/addHead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listaActual, elemento: valor }),
      });
      inputElemento.value = "";
      actualizarVista(true, "head"); // true = animar, 'head' = lugar
      generarCodigoC("addHead", valor);
    }
  });

  // Agregar al Final (Tail)
  document.getElementById("btnAddTail").addEventListener("click", async () => {
    const valor = inputElemento.value.trim();
    if (valor) {
      await fetch(`${API_URL}/list/addTail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listaActual, elemento: valor }),
      });
      inputElemento.value = "";
      actualizarVista(true, "tail");
      generarCodigoC("addTail", valor);
    }
  });

  // Eliminar Inicio
  document.getElementById("btnRemoveHead").addEventListener("click", async () => {
    const view = document.getElementById("listView");
    const primerNodo = view.querySelector(".nodo-wrapper"); 

    if (primerNodo) {
        primerNodo.classList.add("saliendo-pop");
        setTimeout(async () => {
            await fetch(`${API_URL}/list/removeHead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: listaActual }),
            });
            actualizarVista();
            generarCodigoC("removeHead");
        }, 500);
    }
  });

  // Eliminar Final
  document.getElementById("btnRemoveTail").addEventListener("click", async () => {
    const view = document.getElementById("listView");
    const nodos = view.querySelectorAll(".nodo-wrapper");
    const ultimoNodo = nodos[nodos.length - 1];

    if (ultimoNodo) {
        ultimoNodo.classList.add("saliendo-pop");
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

  // Vaciar y Crear
  document.getElementById("btnClearList").addEventListener("click", async () => {
      await fetch(`${API_URL}/clearList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listaActual }),
      });
      actualizarVista();
      generarCodigoC("clear");
  });

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

  // Cambio de lista
  selectLista.addEventListener("change", (e) => {
    listaActual = e.target.value;
    document.getElementById("tituloListaActual").innerText = `Trabajando en: ${listaActual}`;
    actualizarVista();
    generarCodigoC("switch");
  });
});

// --- FUNCIONES VISUALES ---

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

async function actualizarVista(animar = false, lugar = "tail") {
  const res = await fetch(`${API_URL}/list/${listaActual}`);
  const datos = await res.json();
  const view = document.getElementById("listView");
  view.innerHTML = "";

  if (datos.length === 0) {
    view.innerHTML = "<p>Lista vacía (NULL)</p>";
    return;
  }

  // Renderizar nodos
  datos.forEach((valor, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "nodo-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";

    // El Nodo 
    const nodo = document.createElement("div");
    nodo.className = "elemento-pila"; 
    nodo.style.margin = "0 5px";
    nodo.style.width = "auto";
    nodo.style.minWidth = "60px";
    
    // Contenido del nodo
    let html = `<div>${valor}</div>`;
    if(index === 0) html += `<small style='color:green; font-weight:bold'>HEAD</small>`;
    if(index === datos.length -1) html += `<br><small style='color:blue'>TAIL</small>`;
    nodo.innerHTML = html;

    wrapper.appendChild(nodo);

    // La Flecha (excepto si es el último visualmente, aunque añadiremos NULL al final)
    const flecha = document.createElement("div");
    flecha.innerHTML = "➜";
    flecha.style.fontSize = "24px";
    flecha.style.color = "#555";
    flecha.style.margin = "0 5px";
    wrapper.appendChild(flecha);

    // Animación de entrada
    if (animar) {
        if (lugar === "head" && index === 0) {
            wrapper.classList.add("nuevo-push");
        }
        if (lugar === "tail" && index === datos.length - 1) {
            wrapper.classList.add("nuevo-push");
        }
    }

    view.appendChild(wrapper);
  });

  // Agregar NULL al final
  const nullDiv = document.createElement("div");
  nullDiv.className = "nodo-null";
  nullDiv.innerHTML = "NULL";
  nullDiv.style.cssText = "border: 2px dashed #999; padding: 5px; border-radius: 5px; color: #777; font-weight: bold;";
  view.appendChild(nullDiv);
}

// --- Generador C ---
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