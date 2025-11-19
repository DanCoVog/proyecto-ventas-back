const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Participante = require('./models/Participante');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas o local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cafeMemoria:kirito123@trabajo-cafe.fihzlsx.mongodb.net/cafe-memoria?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// ===== RUTAS =====

// 1. Crear nuevo participante
app.post('/api/participantes', async (req, res) => {
  try {
    const participante = new Participante(req.body);
    await participante.save();
    res.status(201).json({ 
      success: true, 
      mensaje: 'Participante registrado exitosamente',
      data: participante 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      mensaje: 'Error al registrar participante', 
      error: error.message 
    });
  }
});

// 2. Obtener todos los participantes
app.get('/api/participantes', async (req, res) => {
  try {
    const participantes = await Participante.find().sort({ fechaRegistro: -1 });
    res.json({ success: true, data: participantes });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error al obtener participantes', 
      error: error.message 
    });
  }
});

// 3. Obtener estadísticas completas
app.get('/api/estadisticas', async (req, res) => {
  try {
    const estadisticasCafe = await Participante.obtenerEstadisticasPorGrupo('cafe');
    const estadisticasSinCafe = await Participante.obtenerEstadisticasPorGrupo('sin_cafe');
    
    res.json({
      success: true,
      data: {
        total: await Participante.countDocuments(),
        grupoCafe: estadisticasCafe,
        grupoSinCafe: estadisticasSinCafe
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error al calcular estadísticas', 
      error: error.message 
    });
  }
});

// 4. Eliminar participante
app.delete('/api/participantes/:id', async (req, res) => {
  try {
    const participante = await Participante.findByIdAndDelete(req.params.id);
    if (!participante) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'Participante no encontrado' 
      });
    }
    res.json({ success: true, mensaje: 'Participante eliminado' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error al eliminar participante', 
      error: error.message 
    });
  }
});

// 5. Limpiar toda la base de datos (útil para testing)
app.delete('/api/participantes', async (req, res) => {
  try {
    const result = await Participante.deleteMany({});
    res.json({ 
      success: true, 
      mensaje: `${result.deletedCount} participantes eliminados` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error al limpiar base de datos', 
      error: error.message 
    });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de Investigación Café y Memoria',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      participantes: '/api/participantes',
      estadisticas: '/api/estadisticas'
    }
  });
});

// Health check para servicios de hosting
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`☁️  Conectado a MongoDB Atlas`);
});