import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const REPERTORIO_PATH = path.join(__dirname, 'repertorio.json');

function ensureRepertorio() {
  if (!fs.existsSync(REPERTORIO_PATH)) {
    fs.writeFileSync(REPERTORIO_PATH, '[]', 'utf-8');
  }
}

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/canciones', (req, res) => {
  try {
    ensureRepertorio();
    const data = fs.readFileSync(REPERTORIO_PATH, 'utf-8');
    const canciones = JSON.parse(data);
    res.json(canciones);
  } catch (error) {
    console.error('Error al leer el archivo:', error);
    res.status(500).json({ error: 'Error al leer las canciones' });
  }
});

app.post('/canciones', (req, res) => {
  try {
    const { id, titulo, artista, tono } = req.body;
    if (!id || !titulo || !artista || !tono) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    ensureRepertorio();
    const data = fs.readFileSync(REPERTORIO_PATH, 'utf-8');
    const canciones = JSON.parse(data);
    if (canciones.find(c => c.id === id)) {
      return res.status(400).json({ error: 'El id ya existe' });
    }
    const nuevaCancion = { id, titulo, artista, tono };
    canciones.push(nuevaCancion);
    fs.writeFileSync(REPERTORIO_PATH, JSON.stringify(canciones, null, 2), 'utf-8');
    res.status(201).json({ mensaje: 'Canción agregada', cancion: nuevaCancion });
  } catch (error) {
    console.error('Error al agregar canción:', error);
    res.status(500).json({ error: 'Error al agregar la canción' });
  }
});

app.put('/canciones/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, artista, tono } = req.body;
    if (!titulo || !artista || !tono) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    ensureRepertorio();
    const data = fs.readFileSync(REPERTORIO_PATH, 'utf-8');
    const canciones = JSON.parse(data);
    const cancionIndex = canciones.findIndex(cancion => String(cancion.id) === String(id));
    if (cancionIndex === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }
    canciones[cancionIndex] = { id: canciones[cancionIndex].id, titulo, artista, tono };
    fs.writeFileSync(REPERTORIO_PATH, JSON.stringify(canciones, null, 2), 'utf-8');
    res.json({ mensaje: 'Canción actualizada', cancion: canciones[cancionIndex] });
  } catch (error) {
    console.error('Error al actualizar canción:', error);
    res.status(500).json({ error: 'Error al actualizar la canción' });
  }
});

app.delete('/canciones/:id', (req, res) => {
  try {
    const { id } = req.params;
    ensureRepertorio();
    const data = fs.readFileSync(REPERTORIO_PATH, 'utf-8');
    const canciones = JSON.parse(data);
    const cancionIndex = canciones.findIndex(cancion => String(cancion.id) === String(id));
    if (cancionIndex === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }
    const [cancionEliminada] = canciones.splice(cancionIndex, 1);
    fs.writeFileSync(REPERTORIO_PATH, JSON.stringify(canciones, null, 2), 'utf-8');
    res.json({ mensaje: 'Canción eliminada', cancion: cancionEliminada });
  } catch (error) {
    console.error('Error al eliminar canción:', error);
    res.status(500).json({ error: 'Error al eliminar la canción' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
