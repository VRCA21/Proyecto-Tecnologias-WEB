// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let stacks = {
    "Principal": [] 
};

// Obtener lista de nombres de pilas disponibles
app.get('/stacks', (req, res) => {
    res.json(Object.keys(stacks));
});

// Crear nueva pila
app.post('/stacks', (req, res) => {
    const { name } = req.body;
    if (name && !stacks[name]) {
        stacks[name] = []; 
        res.json({ success: true, message: 'Pila creada' });
    } else {
        res.status(400).json({ error: 'Nombre inválido o ya existe' });
    }
});

// Obtener contenido de UNA pila específica
app.get('/pila/:name', (req, res) => {
    const { name } = req.params;
    const stack = stacks[name] || [];
    res.json(stack);
});

// 4. PUSH 
app.post('/push', (req, res) => {
    const { name, elemento } = req.body;
    if (stacks[name] && elemento) {
        stacks[name].push(elemento);
        res.json({ success: true, stack: stacks[name] });
    } else {
        res.status(400).json({ error: 'Pila no encontrada o elemento vacío' });
    }
});

// POP
app.post('/pop', (req, res) => {
    const { name } = req.body;
    if (stacks[name]) {
        if (stacks[name].length > 0) stacks[name].pop();
        res.json({ success: true, stack: stacks[name] });
    } else {
        res.status(400).json({ error: 'Pila no encontrada' });
    }
});

// CLEAR
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

// --- LÓGICA DE COLAS  ---

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

// ENQUEUE
app.post('/enqueue', (req, res) => {
    const { name, elemento } = req.body;
    if (queues[name] && elemento) {
        queues[name].push(elemento);
        res.json({ success: true });
    }
});

// DEQUEUE
app.post('/dequeue', (req, res) => {
    const { name } = req.body;
    if (queues[name]) {
        if (queues[name].length > 0) {
            queues[name].shift();
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

// --- LÓGICA DE LISTAS ENLAZADAS ---

let lists = {
    "Principal": [] 
};

// Listar listas disponibles
app.get('/lists', (req, res) => {
    res.json(Object.keys(lists));
});

// Crear nueva lista
app.post('/lists', (req, res) => {
    const { name } = req.body;
    if (name && !lists[name]) {
        lists[name] = [];
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Nombre inválido' });
    }
});

// Obtener contenido
app.get('/list/:name', (req, res) => {
    const { name } = req.params;
    res.json(lists[name] || []);
});

// NSERTAR AL INICIO (Add Head)
app.post('/list/addHead', (req, res) => {
    const { name, elemento } = req.body;
    if (lists[name] && elemento) {
        lists[name].unshift(elemento);
        res.json({ success: true });
    }
});

// INSERTAR AL FINAL (Add Tail)
app.post('/list/addTail', (req, res) => {
    const { name, elemento } = req.body;
    if (lists[name] && elemento) {
        lists[name].push(elemento);
        res.json({ success: true });
    }
});

// ELIMINAR DEL INICIO (Remove Head)
app.post('/list/removeHead', (req, res) => {
    const { name } = req.body;
    if (lists[name] && lists[name].length > 0) {
        lists[name].shift();
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Lista vacía o no encontrada' });
    }
});

// ELIMINAR DEL FINAL (Remove Tail)
app.post('/list/removeTail', (req, res) => {
    const { name } = req.body;
    if (lists[name] && lists[name].length > 0) {
        lists[name].pop();
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Lista vacía o no encontrada' });
    }
});

// ACIAR LISTA
app.post('/clearList', (req, res) => {
    const { name } = req.body;
    if (lists[name]) {
        lists[name] = [];
        res.json({ success: true });
    }
});