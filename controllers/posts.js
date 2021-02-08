const Post = require('../models/post');

module.exports = (app) => {
  app.post('/posts/new', (req, res) => {
    const post = new Post(req.body);
    post.save((err, post) => {
      return res.redirect(`/`);
    });
  });

  app.get('/posts/:id', function (req, res) {
    Post.findById(req.params.id)
      .lean()
      .then((post) => {
        res.render('posts-show', { post });
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
};