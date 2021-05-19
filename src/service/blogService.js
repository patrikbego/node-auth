const objectRepository = require('../repository/objectRepository');
const utils = require('../utils');

const blogService = {
  table: 'blog',
  async create(pool, postObject) {
    console.log(`Creating blog: ${postObject.title} ${postObject.lastName}`);

    // data.status = 'draft';
    if (postObject && postObject.title && postObject.userId) {
      if (await objectRepository.exists(pool, { title: postObject.title },
        blogService.table)) {
        return utils.responseObject(400, '',
          'Article with this title already exists!');
      }
      try {
        if (await objectRepository.create(pool, postObject, blogService.table)) {
          const searchRes = await blogService.read(pool, { query: postObject.title });
          return searchRes;
        }
      } catch (err) {
        console.log(`User creation failed: ${err}`);
        return utils.responseObject(500, '', 'Could not create new data!');
      }
    }
    console.log(`Blog creation failed: ${postObject}`);
    return utils.responseObject(400, '', 'cu: Blog creation failed. cu');
  },
  async read(pool, queryObject) {
    try {
      let blogs;
      if (Object.entries(queryObject).length !== 0) {
        const { query } = queryObject;
        console.log(`Retrieving blogs for query: ${query}`);
        // eslint-disable-next-line max-len
        // const blog = (await objectRepository.run(pool, 'SELECT * FROM blog WHERE tokens @@ to_tsquery(\'head\')'));
        blogs = await objectRepository.run(pool, `SELECT *
                                                           FROM blog
                                                           WHERE status not in ('deleted')
                                                             and tokens @@ plainto_tsquery('${query}')`);
      } else {
        blogs = await objectRepository.run(pool,
          'SELECT * FROM blog WHERE status not in (\'deleted\') limit 100');
      }
      return utils.responseObject(200, '', blogs);
    } catch (err) {
      console.log(`Blog creation failed: ${err}`);
      return utils.responseObject(500, '', 'Could not retrieve data!');
    }
  },
  async readById(pool, queryObject) {
    try {
      let blog;
      if (queryObject && queryObject.id) {
        console.log(`Retrieving blogs for query: ${queryObject.id}`);
        blog = await objectRepository.run(pool, `SELECT *
                                                     FROM blog
                                                     WHERE status not in ('deleted')
                                                       and id = ${queryObject.id}`);

        return utils.responseObject(200, '', blog.length > 0 ? blog[0] : blog);
      }
      return utils.responseObject(500, '', 'Could not retrieve data!');
    } catch (err) {
      console.log(`Blog creation failed: ${err}`);
      return utils.responseObject(500, '', 'Could not retrieve data!');
    }
  },
  async update(pool, blog) {
    const blogr = await objectRepository.select(pool, { id: blog.id },
      blogService.table);
    if (blogr.length === 0) {
      return utils.responseObject(500, '', 'Blog does not exist!');
    }
    blog.tokens = null; // tokens get auto generated
    await objectRepository.update(pool, blog, { id: blog.id },
      blogService.table);
    return utils.responseObject(200, '',
      'Blog has been updated successfully!');
  },
  async delete(pool, postObject) {
    const { id } = postObject;
    const blog = await objectRepository.select(pool, { id },
      blogService.table);
    if (blog.length === 0) {
      return utils.responseObject(500, '', 'Blog does not exist!');
    }
    postObject = blog[0];
    postObject.tokens = null; // tokens get auto generated - not really needed, but tokens cant be updated manually
    postObject.status = 'deleted';
    await objectRepository.update(pool, postObject, { id },
      blogService.table);
    return utils.responseObject(200, '',
      'Blog has been updated successfully!');
  }
  ,
};
module.exports = blogService;
