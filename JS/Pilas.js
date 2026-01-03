// --- CONFIGURACIÓN INICIAL ---
const API_URL = "http://localhost:3000"; // Dirección de nuestro servidor
let pilaActual = "Principal"; // Nombre de la pila por default

// Se ejecuta cuando la página termina de cargar
document.addEventListener("DOMContentLoaded", function () {
  cargarListaPilas(); // Carga los nombres de las pilas en el selector
  actualizarVista();  // Muestra los elementos de la pila actual

  // Referencias a elementos del HTML (Botones y Selectores)
  const btnCrear = document.getElementById("btnCrearPila");
  const selectPila = document.getElementById("selectPila");

  // --- EVENTO: CAMBIAR DE PILA ---
  // Se dispara cuando el usuario elige otra pila en el menú desplegable
  selectPila.addEventListener("change", (e) => {
    pilaActual = e.target.value; // Guardamos el nuevo nombre
    
    // Actualizamos la vista del titulo
    document.getElementById("tituloPilaActual").innerText = `Trabajando en: ${pilaActual}`;
    
    actualizarVista(); // Recargamos la vista con los datos de la nueva pila
    generarCodigoC("switch", pilaActual); // Mostramos el código C equivalente
  });

  // --- EVENTO: CREAR NUEVA PILA ---
  btnCrear.addEventListener("click", async () => {
    const nombre = document.getElementById("inputNuevaPila").value.trim();
    
    if (nombre) {
      // Enviamos la petición al servidor para crear la pila
      await fetch(`${API_URL}/stacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre }),
      });
      
      // Limpiamos el input y recargamos la lista del selector
      document.getElementById("inputNuevaPila").value = "";
      cargarListaPilas();
    }
  });
  
  // --- EVENTO: PUSH (AGREGAR ELEMENTO) ---
  document.getElementById("btnPush").addEventListener("click", async () => {
    const valor = document.getElementById("inputElemento").value.trim();
    
    if (valor) {
      // Enviamos el dato al servidor
      await fetch(`${API_URL}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pilaActual, elemento: valor }),
      });
      
      document.getElementById("inputElemento").value = ""; // Limpiamos input
      
      //Actualizamos la vista pasando 'true' para activar la animación de entrada
      actualizarVista(true); 
      
      // Generamos el código didáctico en C
      generarCodigoC("push", valor);
    }
  });

  // --- EVENTO: POP (ELIMINAR ELEMENTO) ---
  document.getElementById("btnPop").addEventListener("click", async () => {
    const stackView = document.getElementById("stackView");
    const topeVisual = stackView.firstElementChild; // El elemento visual de hasta arriba (Tope)

    // Si existe un elemento visual (div) para animar...
    if (topeVisual && topeVisual.tagName === "DIV") {
        
        // 1. Le ponemos la clase CSS que lo pone rojo y lo mueve a la derecha
        topeVisual.classList.add("saliendo-pop");
        
        // 2. Esperamos lo que dura la animación CSS
        setTimeout(async () => {
            // Solicitamos al servidor que lo borre
            await fetch(`${API_URL}/pop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: pilaActual }),
            });
            
            actualizarVista(); // Repintamos la pila limpia
            generarCodigoC("pop");
        }, 500); 

    } else {
        // Si la pila ya estaba vacía, mandamos la petición directo (para manejar errores)
        await fetch(`${API_URL}/pop`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: pilaActual }),
        });
        actualizarVista();
        generarCodigoC("pop");
    }
  });

  // --- EVENTO: VACIAR PILA (CLEAR) ---
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

// --- FUNCIONES AUXILIARES (LOGICA VISUAL) ---

// Obtiene todas las pilas creadas y rellena el <select>
async function cargarListaPilas() {
  const res = await fetch(`${API_URL}/stacks`);
  const lista = await res.json();
  const select = document.getElementById("selectPila");
  select.innerHTML = ""; // Limpia opciones anteriores

  lista.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.innerText = nombre;
    // Si es la pila actual, la marcamos como seleccionada
    if (nombre === pilaActual) option.selected = true;
    select.appendChild(option);
  });
}

// Dibuja los cuadros de la pila en la pantalla
async function actualizarVista(animarNuevo = false) {
  // 1. Pedimos los datos actuales de la pila
  const res = await fetch(`${API_URL}/pila/${pilaActual}`);
  const pila = await res.json();

  const stackView = document.getElementById("stackView");
  stackView.innerHTML = ""; // Borramos todo lo visual para redibujarlo

  if (pila.length === 0) {
    stackView.innerHTML = "<p>Pila vacía</p>";
    return;
  }

  // 2. Recorremos el arreglo AL REVÉS (del final al principio)
  for (let i = pila.length - 1; i >= 0; i--) {
    const div = document.createElement("div");
    div.classList.add("elemento-pila"); // Clase base para estilos
    
    // Estilos básicos en línea
    div.style.cssText +=
      "border: 1px solid #ccc; padding: 10px; margin: 5px 0; background-color: #f9f9f9;";
    
    // Si es el último elemento del array, es el TOPE
    if (i === pila.length - 1) {
      div.style.cssText +=
        "font-weight: bold; background-color: #e3f2fd; border-color: #2196F3;";
      div.textContent = pila[i] + " (TOPE)";
      
      // Si acabamos de hacer push, le agregamos la animación de rebote
      if (animarNuevo) {
          div.classList.add("nuevo-push");
      }

    } else {
      div.textContent = pila[i]; // Elementos normales
    }
    stackView.appendChild(div);
  }
}

// --- GENERADOR DE CÓDIGO C (Solo Texto) ---
// Crea un string con código C simulado basado en la acción realizada
function generarCodigoC(accion, valor = "") {
  const view = document.getElementById("codigoC");
  let codigo = "";
  // Creamos un nombre de variable válido para C
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