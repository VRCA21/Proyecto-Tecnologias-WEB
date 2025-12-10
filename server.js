// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ALMACÉN DE PILAS (Diccionario)
// Clave: Nombre de la pila, Valor: Array de elementos
let stacks = {
    "Principal": [] 
};

// 1. Obtener lista de nombres de pilas disponibles
app.get('/stacks', (req, res) => {
    res.json(Object.keys(stacks));
});

// 2. Crear nueva pila
app.post('/stacks', (req, res) => {
    const { name } = req.body;
    if (name && !stacks[name]) {
        stacks[name] = []; // Inicializar vacía
        res.json({ success: true, message: 'Pila creada' });
    } else {
        res.status(400).json({ error: 'Nombre inválido o ya existe' });
    }
});

// 3. Obtener contenido de UNA pila específica
app.get('/pila/:name', (req, res) => {
    const { name } = req.params;
    const stack = stacks[name] || [];
    res.json(stack);
});

// 4. PUSH (Ahora recibe el nombre de la pila)
app.post('/push', (req, res) => {
    const { name, elemento } = req.body;
    if (stacks[name] && elemento) {
        stacks[name].push(elemento);
        res.json({ success: true, stack: stacks[name] });
    } else {
        res.status(400).json({ error: 'Pila no encontrada o elemento vacío' });
    }
});

// 5. POP
app.post('/pop', (req, res) => {
    const { name } = req.body;
    if (stacks[name]) {
        if (stacks[name].length > 0) stacks[name].pop();
        res.json({ success: true, stack: stacks[name] });
    } else {
        res.status(400).json({ error: 'Pila no encontrada' });
    }
});

// 6. CLEAR
app.post('/clear', (req, res) => {
    const { name } = req.body;
    if (stacks[name]) {
        stacks[name] = [];
        res.json({ success: true, stack: [] });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor mult-pila corriendo en http://localhost:${PORT}`);
});

// --- LÓGICA DE COLAS (Backend) ---

let queues = {
    "Principal": [] 
};

// Listar colas disponibles
app.get('/queues', (req, res) => {
    res.json(Object.keys(queues));
});

// Crear nueva cola
app.post('/queues', (req, res) => {
    const { name } = req.body;
    if (name && !queues[name]) {
        queues[name] = [];
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Nombre inválido' });
    }
});

// Ver una cola
app.get('/queue/:name', (req, res) => {
    const { name } = req.params;
    res.json(queues[name] || []);
});

// ENQUEUE (Usaremos tu botón 'Push' para esto)
app.post('/enqueue', (req, res) => {
    const { name, elemento } = req.body;
    if (queues[name] && elemento) {
        queues[name].push(elemento); // Entra al final
        res.json({ success: true });
    }
});

// DEQUEUE (Usaremos tu botón 'Pop' para esto)
app.post('/dequeue', (req, res) => {
    const { name } = req.body;
    if (queues[name]) {
        if (queues[name].length > 0) {
            queues[name].shift(); // Saca del inicio (FIFO)
        }
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Cola no encontrada' });
    }
});

// CLEAR COLA
app.post('/clearQueue', (req, res) => {
    const { name } = req.body;
    if (queues[name]) {
        queues[name] = [];
        res.json({ success: true });
    }
});