const newsServices = require('../services/newsServices');

const generateNewsLinks = (newsItem) => {
  const baseUrl = '/news';
  return [
    { rel: 'self', href: `${baseUrl}/${newsItem._id}`, method: 'GET' },
    { rel: 'update', href: `${baseUrl}/${newsItem._id}`, method: 'PUT' }
  ];
};

exports.insert = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    const newsData = req.body;
    const newNews = await newsServices.insertNews(newsData);

    const response = {
      message: 'Notícia inserida com sucesso',
      news: newNews.toObject(),
      _links: generateNewsLinks(newNews)
    };

    response._links.push({ rel: 'collection', href: '/news', method: 'GET' });

    return res.status(201).json(response);
  }
  catch (error) {
    console.error('Erro ao inserir notícia:', error);
    return res.status(500).json({ message: 'Erro ao inserir notícia', error: error.message });
  }
}

exports.getById = async (req, res) => {
  try {
    const newsId = req.params.id;
    const newsItem = await newsServices.findNewsById(newsId);

    if (!newsItem) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }

    const response = {
      news: newsItem.toObject(),
      _links: generateNewsLinks(newsItem)
    };
    response._links.push({ rel: 'collection', href: '/news', method: 'GET' });


    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao buscar notícia por ID:', error);
    if (error.message === "Notícia não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Erro ao buscar notícia', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const filters = req.query;
    const { newsList, totalCount, page, limit } = await newsServices.findAllNews(filters);

    const newsWithLinks = newsList.map(news => ({
      ...news.toObject(),
      _links: [
        { rel: 'self', href: `/news/${news._id}`, method: 'GET' }
      ]
    }));

    const selfLinkHref = `/news${req.url.startsWith('/?') ? req.url.substring(1) : req.url}`;


    const responseLinks = [
      { rel: 'self', href: selfLinkHref, method: 'GET' },
      { rel: 'create', href: '/news', method: 'POST' }
    ];

    const totalPages = Math.ceil(totalCount / limit);

    if (page < totalPages) {
      const nextPageQueryParams = new URLSearchParams(filters);
      nextPageQueryParams.set('page', page + 1);
      responseLinks.push({ rel: 'next', href: `/news?${nextPageQueryParams.toString()}`, method: 'GET' });
    }
    if (page > 1) {
      const prevPageQueryParams = new URLSearchParams(filters);
      prevPageQueryParams.set('page', page - 1);
      responseLinks.push({ rel: 'prev', href: `/news?${prevPageQueryParams.toString()}`, method: 'GET' });
    }
     if (totalPages > 0) {
      const firstPageQueryParams = new URLSearchParams(filters);
      firstPageQueryParams.set('page', 1);
      responseLinks.push({ rel: 'first', href: `/news?${firstPageQueryParams.toString()}`, method: 'GET' });

      const lastPageQueryParams = new URLSearchParams(filters);
      lastPageQueryParams.set('page', totalPages);
      responseLinks.push({ rel: 'last', href: `/news?${lastPageQueryParams.toString()}`, method: 'GET' });
    }


    const response = {
      totalItems: totalCount,
      totalPages: totalPages,
      currentPage: page,
      itemsPerPage: limit,
      news: newsWithLinks,
      _links: responseLinks
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao buscar todas as notícias:', error);
    return res.status(500).json({ message: 'Erro ao buscar notícias', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const newsId = req.params.id;
    const newsData = req.body;
    const updatedNews = await newsServices.updateNewsById(newsId, newsData);

    if (!updatedNews) {
      return res.status(404).json({ message: 'Notícia não encontrada para atualização' });
    }

    const response = {
      message: 'Notícia atualizada com sucesso',
      news: updatedNews.toObject(),
      _links: generateNewsLinks(updatedNews)
    };
    response._links.push({ rel: 'collection', href: '/news', method: 'GET' });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error);
    if (error.message.includes("Notícia não encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Erro ao atualizar notícia', error: error.message });
  }
};