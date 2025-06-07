const { URLSearchParams } = require('url');

const baseUrl = '/news';

exports.generateNewsItemLinks = (newsItem) => {
  return [
    { rel: 'self', href: `${baseUrl}/${newsItem._id}`, method: 'GET' },
    { rel: 'create', href: baseUrl, method: 'POST' },
    { rel: 'update', href: `${baseUrl}/${newsItem._id}`, method: 'PUT' },
    { rel: 'delete', href: `${baseUrl}/${newsItem._id}`, method: 'DELETE' },
    { rel: 'collection', href: baseUrl, method: 'GET' },
  ];
};

exports.generateNewsCollectionLinks = (req, totalCount, page, limit) => {
  const links = [
    { rel: 'self', href: `${baseUrl}${req.url}`, method: 'GET' },
    { rel: 'create', href: baseUrl, method: 'POST' },
  ];

  const totalPages = Math.ceil(totalCount / limit);
  const queryParams = new URLSearchParams(req.query);

  if (totalPages > 0) {
    queryParams.set('page', 1);
    links.push({ rel: 'first', href: `${baseUrl}?${queryParams.toString()}`, method: 'GET' });

    if (page > 1) {
      queryParams.set('page', page - 1);
      links.push({ rel: 'prev', href: `${baseUrl}?${queryParams.toString()}`, method: 'GET' });
    }

    if (page < totalPages) {
      queryParams.set('page', page + 1);
      links.push({ rel: 'next', href: `${baseUrl}?${queryParams.toString()}`, method: 'GET' });
    }
    
    queryParams.set('page', totalPages);
    links.push({ rel: 'last', href: `${baseUrl}?${queryParams.toString()}`, method: 'GET' });
  }

  return links;
};