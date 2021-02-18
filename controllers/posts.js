const Post = require('../models/post');
const User = require('../models/user');

module.exports = (app) => {
  app.get('/', (req, res) => {
    const currentUser = req.user;
    Post.find()
      .populate('author')
      .lean()
      .then((posts) => {
        res.render('posts-index', { posts, currentUser });
      })
      .catch((err) => {
        console.log(err.message);
      });
  });

  app.get('/posts/new', (req, res) => {
    const currentUser = req.user;
    res.render('posts-new.hbs', { currentUser });
  });

  // CREATE
  app.post('/posts/new', (req, res) => {
    if (req.user) {
      const post = new Post(req.body);
      post.author = req.user._id;
      post.upVotes = [];
      post.downVotes = [];
      post.voteScore = 0;

      post
        .save()
        .then((post) => {
          return User.findById(req.user._id);
        })
        .then((user) => {
          user.posts.unshift(post);
          user.save();
          // REDIRECT TO THE NEW POST
          return res.redirect(`/posts/${post._id}`);
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      return res.status(401); // UNAUTHORIZED
    }
  });

  // SHOW
  app.get('/posts/:id', function (req, res) {
    const currentUser = req.user;
    Post.findById(req.params.id)
      .populate({ path: 'comments', populate: { path: 'author' } })
      .populate('author')
      .lean()
      .then((post) => {
        res.render('posts-show', { post, currentUser });
      })
      .catch((err) => {
        console.log(err.message);
      });
  });

  // SUBREDDIT
  app.get('/n/:subreddit', function (req, res) {
    const currentUser = req.user;
    Post.find({ subreddit: req.params.subreddit })
      .populate('author')
      .lean()
      .then((posts) => {
        res.render('posts-index', { posts, currentUser });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.put('/posts/:id/vote-up', function (req, res) {
    Post.findById(req.params.id).exec(function (err, post) {
      post.upVotes.push(req.user._id);
      post.voteScore = post.voteScore + 1;
      post.save();

      res.status(200);
    });
  });

  app.put('/posts/:id/vote-down', function (req, res) {
    Post.findById(req.params.id).exec(function (err, post) {
      post.downVotes.push(req.user._id);
      post.voteScore = post.voteScore - 1;
      post.save();

      res.status(200);
    });
  });
};
