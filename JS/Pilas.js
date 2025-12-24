const API_URL = "http://localhost:3000";
let pilaActual = "Principal";

document.addEventListener("DOMContentLoaded", function () {
  cargarListaPilas();
  actualizarVista();

  // Referencias DOM
  const btnCrear = document.getElementById("btnCrearPila");
  const selectPila = document.getElementById("selectPila");

  // CAMBIAR DE PILA
  selectPila.addEventListener("change", (e) => {
    pilaActual = e.target.value;
    document.getElementById(
      "tituloPilaActual"
    ).innerText = `Trabajando en: ${pilaActual}`;
    actualizarVista();
    generarCodigoC("switch", pilaActual);
  });

  // CREAR NUEVA PILA
  btnCrear.addEventListener("click", async () => {
    const nombre = document.getElementById("inputNuevaPila").value.trim();
    if (nombre) {
      await fetch(`${API_URL}/stacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre }),
      });
      document.getElementById("inputNuevaPila").value = "";
      cargarListaPilas();
    }
  });
  
  document.getElementById("btnPush").addEventListener("click", async () => {
    const valor = document.getElementById("inputElemento").value.trim();
    if (valor) {
      await fetch(`${API_URL}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pilaActual, elemento: valor }),
      });
      document.getElementById("inputElemento").value = "";
      actualizarVista(true); 
      
      generarCodigoC("push", valor);
    }
  });

  // --- LÓGICA DE POP ---
  document.getElementById("btnPop").addEventListener("click", async () => {
    const stackView = document.getElementById("stackView");
    const topeVisual = stackView.firstElementChild;

    // Si hay un elemento real (div) para animar
    if (topeVisual && topeVisual.tagName === "DIV") {
        topeVisual.classList.add("saliendo-pop");
        setTimeout(async () => {
            await fetch(`${API_URL}/pop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: pilaActual }),
            });
            actualizarVista(); 
            generarCodigoC("pop");
        }, 500); 

    } else {
        await fetch(`${API_URL}/pop`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: pilaActual }),
        });
        actualizarVista();
        generarCodigoC("pop");
    }
  });

  document.getElementById("btnClearPila").addEventListener("click", async () => {
      await fetch(`${API_URL}/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pilaActual }),
      });
      actualizarVista();
      generarCodigoC("clear");
  });
});

// --- FUNCIONES AUXILIARES ---

async function cargarListaPilas() {
  const res = await fetch(`${API_URL}/stacks`);
  const lista = await res.json();
  const select = document.getElementById("selectPila");
  select.innerHTML = "";

  lista.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.innerText = nombre;
    if (nombre === pilaActual) option.selected = true;
    select.appendChild(option);
  });
}

async function actualizarVista(animarNuevo = false) {
  const res = await fetch(`${API_URL}/pila/${pilaActual}`);
  const pila = await res.json();

  const stackView = document.getElementById("stackView");
  stackView.innerHTML = "";

  if (pila.length === 0) {
    stackView.innerHTML = "<p>Pila vacía</p>";
    return;
  }

  for (let i = pila.length - 1; i >= 0; i--) {
    const div = document.createElement("div");
    div.classList.add("elemento-pila"); 
    
    div.style.cssText +=
      "border: 1px solid #ccc; padding: 10px; margin: 5px 0; background-color: #f9f9f9;";
    if (i === pila.length - 1) {
      div.style.cssText +=
        "font-weight: bold; background-color: #e3f2fd; border-color: #2196F3;";
      div.textContent = pila[i] + " (TOPE)";
      if (animarNuevo) {
          div.classList.add("nuevo-push");
      }

    } else {
      div.textContent = pila[i];
    }
    stackView.appendChild(div);
  }
}

// --- GENERADOR DE CÓDIGO C  ---
function generarCodigoC(accion, valor = "") {
  const view = document.getElementById("codigoC");
  let codigo = "";
  const varName = pilaActual.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  switch (accion) {
    case "push":
      codigo =
        `// Añadiendo '${valor}' a la pila '${pilaActual}'\n` +
        `if (top < MAX_SIZE) {\n` +
        `    ${varName}[++top] = "${valor}";\n` +
        `} else {\n` +
        `    printf("Error: Stack Overflow\\n");\n` +
        `}`;
      break;
    case "pop":
      codigo =
        `// Eliminando tope de '${pilaActual}'\n` +
        `if (top >= 0) {\n` +
        `    elemento = ${varName}[top--];\n` +
        `} else {\n` +
        `    printf("Error: Stack Underflow\\n");\n` +
        `}`;
      break;
    case "switch":
      codigo =
        `// Cambiando contexto\n` +
        `struct Stack *pilaActual = &${varName};\n` +
        `printf("Pila seleccionada: %s", "${pilaActual}");`;
      break;
    case "clear":
      codigo = `// Vaciando pila\n` + `top = -1; // Reiniciar índice del tope`;
      break;
  }
  view.innerText = codigo;
}