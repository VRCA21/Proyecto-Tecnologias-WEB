const API_URL = "http://localhost:3000";
let pilaActual = "Principal"; // Pila por defecto

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
      cargarListaPilas(); // Recargar el select
    }
  });

  // --- LÓGICA EXISTENTE MODIFICADA (Push/Pop/Clear) ---
  // Ahora enviamos { name: pilaActual, ... } en el body

  document.getElementById("btnPush").addEventListener("click", async () => {
    const valor = document.getElementById("inputElemento").value.trim();
    if (valor) {
      await fetch(`${API_URL}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pilaActual, elemento: valor }),
      });
      document.getElementById("inputElemento").value = "";
      actualizarVista();
      generarCodigoC("push", valor); // <--- ACTUALIZAR CÓDIGO C
    }
  });

  document.getElementById("btnPop").addEventListener("click", async () => {
    await fetch(`${API_URL}/pop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pilaActual }),
    });
    actualizarVista();
    generarCodigoC("pop"); // <--- ACTUALIZAR CÓDIGO C
  });

  document
    .getElementById("btnClearPila")
    .addEventListener("click", async () => {
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

async function actualizarVista() {
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
    div.style.cssText =
      "border: 1px solid #ccc; padding: 10px; margin: 5px 0; background-color: #f9f9f9;";
    if (i === pila.length - 1) {
      div.style.cssText +=
        "font-weight: bold; background-color: #e3f2fd; border-color: #2196F3;";
      div.textContent = pila[i] + " (TOPE)";
    } else {
      div.textContent = pila[i];
    }
    stackView.appendChild(div);
  }
}

// --- GENERADOR DE CÓDIGO C (Simulado) ---
function generarCodigoC(accion, valor = "") {
  const view = document.getElementById("codigoC");
  let codigo = "";

  // Nombre de variable seguro para C (sin espacios)
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

  // Efecto de mecanografía simple
  view.innerText = codigo;
}
