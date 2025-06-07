const newsServices = require('../services/newsServices');

const prepareResponse = (res, next, data, message, statusCode) => {
  res.locals.data = data;
  res.locals.message = message;
  res.locals.statusCode = statusCode;
  next(); 
};

exports.insert = async (req, res, next) => {
  try {
    const newNews = await newsServices.insertNews(req.body);
    prepareResponse(res, next, { item: newNews }, 'Notícia inserida com sucesso', 201);
  } catch (error) {
    console.error('Erro ao inserir notícia:', error);
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const newsItem = await newsServices.findNewsById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    prepareResponse(res, next, { item: newsItem });
  } catch (error) {
    console.error('Erro ao buscar notícia por ID:', error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { newsList, totalCount, page, limit } = await newsServices.findAllNews(req.query);
    prepareResponse(res, next, { items: newsList, totalCount, page, limit });
  } catch (error) {
    console.error('Erro ao buscar todas as notícias:', error);
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedNews = await newsServices.updateNewsById(req.params.id, req.body);
    if (!updatedNews) {
      return res.status(404).json({ message: 'Notícia não encontrada para atualização' });
    }
    prepareResponse(res, next, { item: updatedNews }, 'Notícia atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error);
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await newsServices.deleteNewsById(req.params.id);
    prepareResponse(res, next, null, 'Notícia deletada com sucesso');
  } catch (error) {
    console.error('Erro ao deletar notícia:', error);
    next(error);
  }
};