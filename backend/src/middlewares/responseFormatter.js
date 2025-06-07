const { generateNewsItemLinks, generateNewsCollectionLinks } = require('../middlewares/linksMiddleware');

const responseFormatter = (req, res, next) => {
  if (res.headersSent) {
    return next();
  }

  const data = res.locals.data;
  let response = {};

  if (data && data.items) {
    const { items, totalCount, page, limit } = data;
    const itemsWithLinks = items.map(item => ({
      ...item.toObject(),
      _links: [{ rel: 'self', href: `/news/${item._id}`, method: 'GET' }]
    }));
    
    response = {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      itemsPerPage: limit,
      news: itemsWithLinks,
      _links: generateNewsCollectionLinks(req, totalCount, page, limit),
    };
  } 
  else if (data && data.item) {
    response = {
      message: res.locals.message || 'Operação realizada com sucesso',
      news: data.item.toObject(),
      _links: generateNewsItemLinks(data.item),
    };
  }
  else {
     response = {
      message: res.locals.message || 'Recurso deletado com sucesso',
      _links: [
        { rel: 'collection', href: '/news', method: 'GET' },
        { rel: 'create', href: '/news', method: 'POST' }
      ]
    };
  }

  const statusCode = res.locals.statusCode || 200;
  return res.status(statusCode).json(response);
};

module.exports = responseFormatter;