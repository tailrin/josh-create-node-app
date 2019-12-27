const server = "const app = require('./app')\n\nconst PORT = process.env.PORT\n\napp.listen(PORT, () => {\n  console.log(`Server listening at http://localhost:${PORT}`)\n})"

module.exports = server