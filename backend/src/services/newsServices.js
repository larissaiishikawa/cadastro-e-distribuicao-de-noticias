const newsModel = require('../models/newsModel');

exports.insertNews = async (newsData) => {
  try {
    const newNews = new newsModel(newsData);

    return await newNews.save();
  }
  catch {
    console.error("Erro no serviço ao tentar salvar notícia:", error.message);
    throw error;
  }
}

exports.findNewsById = async (id) => {
  try {
    const news = await newsModel.findById(id);
    if (!news) {
      throw new Error("Notícia não encontrada");
    }
    return news;
  } catch (error) {
    console.error("Erro no serviço ao tentar buscar notícia por ID:", error.message);
    throw error;
  }
};

exports.findAllNews = async (filters = {}) => {
  try {
    const query = {};

    if (filters.tema) {
      query.Tema = { $regex: new RegExp(filters.tema, 'i') };
    }

    if (filters.titulo) {
      query.Titulo = { $regex: new RegExp(filters.titulo, 'i') };
    }

    if (filters.autor) {
      query.Autor = { $regex: new RegExp(filters.autor, 'i') };
    }

    if (filters.q) {
      const searchQuery = { $regex: new RegExp(filters.q, 'i') };
      query.$or = [
        { Titulo: searchQuery },
        { Subtitulo: searchQuery },
        { Descricao: searchQuery },
        { Tema: searchQuery }
      ];
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const newsList = await newsModel.find(query).sort({ dataPublicacao: -1 }).skip(skip).limit(limit);
    const totalCount = await newsModel.countDocuments(query);

    return { newsList, totalCount, page, limit };
  } catch (error) {
    console.error("Erro no serviço ao tentar buscar todas as notícias:", error.message);
    throw error
  }
};

exports.updateNewsById = async (id, newsData) => {
  try {
    const updatedNews = await newsModel.findByIdAndUpdate(id, newsData, { new: true });
    if (!updatedNews) {
      throw new Error("Notícia não encontrada para atualização");
    }
    return updatedNews;
  } catch (error) {
    console.error("Erro no serviço ao tentar atualizar notícia:", error.message);
    throw error;
  }
};

exports.deleteNewsById = async (id) => {
  try {
    const deletedNews = await newsModel.findByIdAndDelete(id);
    if (!deletedNews) {
      throw new Error("Notícia não encontrada para exclusão");
    }
    return deletedNews;
  } catch (error) {
    console.error("Erro no serviço ao tentar deletar notícia:", error.message);
    throw error;
  }
};