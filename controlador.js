// Controlador para Pilas con visualización

let pila = [];

function actualizarVista() {
  const stackView = document.getElementById('stackView');
  stackView.innerHTML = '';
  
  if (pila.length === 0) {
    stackView.innerHTML = '<p>Pila vacía</p>';
    return;
  }
  
  // Mostrar elementos de arriba hacia abajo (el último es el tope)
  for (let i = pila.length - 1; i >= 0; i--) {
    const div = document.createElement('div');
    div.style.cssText = 'border: 1px solid #ccc; padding: 10px; margin: 5px 0; background-color: #f9f9f9;';
    if (i === pila.length - 1) {
      div.style.cssText += 'font-weight: bold; background-color: #e3f2fd; border-color: #2196F3;';
      div.textContent = pila[i] + ' (TOPE)';
    } else {
      div.textContent = pila[i];
    }
    stackView.appendChild(div);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const btnPush = document.getElementById('btnPush');
  const btnPop = document.getElementById('btnPop');
  const btnClearPila = document.getElementById('btnClearPila');
  const inputElemento = document.getElementById('inputElemento');

  btnPush.addEventListener('click', function() {
    const valor = inputElemento.value.trim();
    if (valor !== '') {
      pila.push(valor);
      inputElemento.value = '';
      actualizarVista();
    }
  });

  btnPop.addEventListener('click', function() {
    if (pila.length > 0) {
      pila.pop();
      actualizarVista();
    }
  });

  btnClearPila.addEventListener('click', function() {
    pila = [];
    actualizarVista();
  });
  
  // Mostrar vista inicial
  actualizarVista();
});
