const User = require('../users/users-model')

// - `logger()`
// - `logger` logs to the console the following information about each request: request method, request url, and a timestamp
// - this middleware runs on every request made to the API

function logger(req, res, next) {
  const timestamp = new Date().toLocaleString()
  const method = req.method
  const url = req.originalUrl
    console.log(`[${timestamp}] ${method} to ${url}`)
    next()
}

// - `validateUserId()`
// - this middleware will be used for all user endpoints that include an `id` parameter in the url (ex: `/api/users/:id` and it should check the database to make sure there is a user with that id.
// - if the `id` parameter is valid, store the user object as `req.user` and allow the request to continue
// - if the `id` parameter does not match any user id in the database, respond with status `404` and `{ message: "user not found" }`

async function validateUserId(req, res, next) {
  try {
    const user = await User.getById(req.params.id)
    if (!user) {
      res.status(404).json({
        message: "user not found",
      })
    } else {
      req.user = user
      next()
    }
  } catch (err) {
    res.status(404).json({
      message: 'user not found',
    })
  }
}

// - `validateUser()`
//   - `validateUser` validates the `body` on a request to create or update a user
//   - if the request `body` lacks the required `name` field, respond with status `400` and `{ message: "missing required name field" }`

function validateUser(req, res, next) {
  const { name } = req.body
  if (!name || !name.trim()) {
    res.status(400).json({
      message: "missing required name field",
    })
  } else {
    req.name = name.trim()
    next()
  }
}

// - `validatePost()`
//   - `validatePost` validates the `body` on a request to create a new post
//   - if the request `body` lacks the required `text` field, respond with status `400` and `{ message: "missing required text field" }`

function validatePost(req, res, next) {
  const { text } = req.body
  if (!text || !text.trim()) {
    res.status(400).json({
      message: "missing required text field",
    })
  } else {
    req.text = text.trim()
    next()
  }
}

// do not forget to expose these functions to other modules
module.exports = {
  validateUserId,
  validateUser,
  validatePost,
  logger,
}