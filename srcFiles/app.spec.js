const spec = "const app = require('../src/app')\n\ndescribe('App', () => {\n\tit('GET / responds with 200 containing Hello, world!', () => {\n\t\treturn supertest(app)\n\t\t.get('/')\n\t\t.expect(200, 'Hello, world!')\n\t})\n})"

module.exports = spec