const mongoose = require('mongoose');

const participanteSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  edad: { 
    type: Number, 
    required: [true, 'La edad es obligatoria'],
    min: [18, 'La edad mínima es 18 años'],
    max: [100, 'La edad máxima es 100 años']
  },
  grupo: { 
    type: String, 
    enum: {
      values: ['cafe', 'sin_cafe'],
      message: 'El grupo debe ser "cafe" o "sin_cafe"'
    },
    required: [true, 'El grupo es obligatorio']
  },
  puntaje: { 
    type: Number, 
    required: [true, 'El puntaje es obligatorio'],
    min: [0, 'El puntaje mínimo es 0'],
    max: [10, 'El puntaje máximo es 10']
  },
  fechaRegistro: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Método personalizado para obtener descripción del grupo
participanteSchema.methods.getGrupoDescripcion = function() {
  return this.grupo === 'cafe' ? 'Con consumo de café' : 'Sin consumo de café';
};

// Método estático para obtener estadísticas por grupo
participanteSchema.statics.obtenerEstadisticasPorGrupo = async function(tipoGrupo) {
  const participantes = await this.find({ grupo: tipoGrupo });
  
  if (participantes.length === 0) return null;
  
  const puntajes = participantes.map(p => p.puntaje).sort((a, b) => a - b);
  
  // Calcular media
  const media = puntajes.reduce((sum, val) => sum + val, 0) / puntajes.length;
  
  // Calcular mediana
  const medio = Math.floor(puntajes.length / 2);
  const mediana = puntajes.length % 2 === 0
    ? (puntajes[medio - 1] + puntajes[medio]) / 2
    : puntajes[medio];
  
  // Calcular moda
  const frecuencias = {};
  puntajes.forEach(p => {
    frecuencias[p] = (frecuencias[p] || 0) + 1;
  });
  const maxFrecuencia = Math.max(...Object.values(frecuencias));
  const moda = Object.keys(frecuencias)
    .filter(key => frecuencias[key] === maxFrecuencia)
    .map(Number);
  
  // Calcular desviación estándar
  const varianza = puntajes.reduce((sum, val) => 
    sum + Math.pow(val - media, 2), 0) / puntajes.length;
  const desviacionEstandar = Math.sqrt(varianza);
  
  return {
    cantidad: participantes.length,
    media: Number(media.toFixed(2)),
    mediana: Number(mediana.toFixed(2)),
    moda: moda,
    desviacionEstandar: Number(desviacionEstandar.toFixed(2)),
    puntajes: puntajes
  };
};

const Participante = mongoose.model('Participante', participanteSchema);

module.exports = Participante;