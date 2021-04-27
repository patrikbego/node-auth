const objectRepository = require('../repository/objectRepository');
const utils = require('../utils');

const blogService = {
  table: 'blog',
  async create(pool, data) {
    console.log(`Creating blog: ${data.title} ${data.lastName}`);

    data.status = 'draft';
    if (data.title && data.body && data.userId) {
      if (await objectRepository.exists(pool, { title: data.title }, blogService.table)) {
        return utils.responseObject(400, '',
          'Blog with this title already exists!');
      }
      try {
        if (await objectRepository.create(pool, data, blogService.table)) {
          const searchRes = await blogService.read(pool, { query: data.title });
          return searchRes;
        }
      } catch (err) {
        console.log(`User creation failed: ${err}`);
        return utils.responseObject(500, '', 'Could not create new data!');
      }
    }
    console.log(`Blog creation failed: ${data}`);
    return utils.responseObject(400, '', 'cu: Blog creation failed. cu');
  },
  async read(pool, queryObject) {
    if (queryObject) {
      try {
        const { query } = queryObject;
        console.log(`Retrieving blogs for query: ${query}`);
        // eslint-disable-next-line max-len
        // const blog = (await objectRepository.run(pool, 'SELECT * FROM blog WHERE tokens @@ to_tsquery(\'head\')'));
        const blog = await objectRepository.run(pool, `SELECT * FROM blog WHERE status not in ('deleted') and tokens @@ plainto_tsquery('${query}')`);
        return utils.responseObject(200, '', blog);
      } catch (err) {
        console.log(`Blog creation failed: ${err}`);
        return utils.responseObject(500, '', 'Could not retrieve data!');
      }
    }
    return utils.responseObject(500, '', 'Blog not found');
  },
  async update(pool, object) {
    const blog = await objectRepository.select(pool, { id: object.id }, blogService.table);
    if (blog.length === 0) {
      return utils.responseObject(500, '', 'Blog does not exist!');
    }
    object.tokens = null; // tokens get auto generated
    await objectRepository.update(pool, object, { id: object.id }, blogService.table);
    return utils.responseObject(200, '', 'Blog has been updated successfully!');
  },
  async delete(pool, object) {
    object.status = 'deleted';
    const res = await blogService.update(pool, object);
    if (res.code === 200) {
      res.clientData = 'Blog has been successfully deleted!';
      return res;
    }
    return res;
  },
};
module.exports = blogService;
