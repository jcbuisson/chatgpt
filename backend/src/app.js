
import 'dotenv/config' // import all variables from .env into process.env

import { expressX } from '@jcbuisson/express-x'
import chatgptService from './services/chatgpt.service.js'

const app = expressX({
   WS_TRANSPORT: true,
   WS_PATH: '/chatgpt-socket-io/',
})

app.configure(chatgptService)

const PORT = process.env.PORT || 3000
app.httpServer.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`))
