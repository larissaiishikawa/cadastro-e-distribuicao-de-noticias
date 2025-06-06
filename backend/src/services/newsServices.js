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
