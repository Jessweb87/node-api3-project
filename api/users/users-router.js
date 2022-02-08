const express = require('express');
// Bring in middleware functions
const { 
  validateUserId, 
  validateUser, 
  validatePost 
} = require('../middleware/middleware')

// You will need `users-model.js` and `posts-model.js` both
// The middleware functions also need to be required

const User = require('./users-model')
const Post = require('../posts/posts-model');


const router = express.Router();

// RETURN AN ARRAY WITH ALL THE USERS
//   [GET] /api/users                                                                                    
// √ [1] can get the correct number of users (54 ms)                                                 
// √ [2] can get all the correct users (29 ms) 
router.get('/', (req, res, next) => {
   User.get()
    .then(users => {
      res.json(users)
    })
    .catch(next)
});

// RETURN THE USER OBJECT
// this needs a middleware to verify user id
// [GET] /api/users/:id                                                                                
// √ [3] can get the correct user (30 ms)                                                            
// √ [4] responds with a 404 if id does not exist (28 ms)                                            
// √ [5] responds with the correct error message if id does not exist (28 ms)
router.get('/:id', validateUserId, (req, res) => {
  res.json(req.user)
});

// RETURN THE NEWLY CREATED USER OBJECT
// this needs a middleware to check that the request body is valid
//    [POST] /api/users                                                                                   
// √ [6] creates a new user in the database (48 ms)                                                  
// √ [7] responds with the newly created user (36 ms)                                                
// √ [8] responds with a 400 if missing name (25 ms)                                                 
// √ [9] responds with the correct error message if missing name (27 ms)
router.post('/', validateUser, (req, res, next) => {
  User.insert({ name: req.name})
    .then(newUser => {
      res.status(201).json(newUser)
    })
    .catch(next)
});

// RETURN THE FRESHLY UPDATED USER OBJECT
// this needs a middleware to verify user id
// and another middleware to check that the request body is valid
// [PUT] /api/users/:id                                                                                
// √ [10] writes the updates in the database (36 ms)                                                 
// √ [11] responds with the newly updated user (35 ms)
// √ [12] responds with a 404 if user id does not exist (30 ms)                                      
// √ [13] responds with a 400 if missing name (32 ms)                                                
// √ [14] responds with the correct error message if missing name (29 ms)
router.put('/:id', validateUserId, validateUser, (req, res, next) => {
  User.update(req.params.id, { name: req.name })
    .then(() => {
      return User.getById(req.params.id)
    })
    .then(user => {
      res.json(user)
    })
    .catch(next)
});

// RETURN THE FRESHLY DELETED USER OBJECT
// this needs a middleware to verify user 
// [DELETE] /api/users/:id                                                                             
// √ [15] deletes the user from the database (34 ms)                                                 
// √ [16] responds with the newly deleted user (33 ms)
// √ [17] responds with a 404 if user id does not exist (30 ms)
router.delete('/:id', validateUserId, async (req, res, next) => {
  try {
    await User.remove(req.params.id)
    res.json(req.user)
  } catch (err) {
    next(err)
  }
});

// RETURN THE ARRAY OF USER POSTS
// this needs a middleware to verify user id
// [GET] /api/users/:id/posts                                                                          
// √ [18] gets the correct number of user posts (33 ms)                                              
// √ [19] responds with a 404 if user id does not exist (33 ms)  
router.get('/:id/posts', validateUserId, async (req, res, next) => {
  try {
    const result = await User.getUserPosts(req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
});

// RETURN THE NEWLY CREATED USER POST
// this needs a middleware to verify user id
// and another middleware to check that the request body is valid
// [POST] /api/users/:id/posts                                                                         
// √ [20] creates a new user post in the database (52 ms)                                            
// √ [21] responds with the newly created user post (36 ms)                                          
// √ [22] responds with a 404 if user id does not exist (30 ms)                                      
// √ [23] responds with a 400 if missing text (30 ms)                                                
// √ [24] responds with the correct error message if missing text (29 ms)
router.post('/:id/posts', validateUserId, validatePost, async (req, res, next) => {
  try {
    const result = await Post.insert({
      user_id: req.params.id,
      text: req.text,
    })
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
});

router.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    customMessage: 'something went wrong',
    message: err.message,
    stack: err.stack,
  })
})

// do not forget to export the router

module.exports = router