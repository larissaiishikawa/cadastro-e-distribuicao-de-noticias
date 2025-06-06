const moongose = require('mongoose');

const newsSchema = new moongose.Schema({
  Tema: {
    type: String,
    required: true
  },
  Titulo: {
    type: String,
    required: true
  },
  Subtitulo: {
    type: String,
    required: true
  },
  Descricao: {
    type: String,
    required: true
  },
  Autor: {
    type: String,
    required: true
  },
  Local: {
    cidade: { type: String, required: false },
    estado: { type: String, required: false },
    pais: { type: String, required: true }
  },
  dataPublicacao: {
    type: Date,
    required: true,
    default: Date.now
  }
},
{
  timestamps: true
});

module.exports = moongose.model('News', newsSchema);
