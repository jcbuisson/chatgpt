
import { io } from "socket.io-client"

import expressXClient from '@jcbuisson/express-x-client'
// import expressXClient from './client.mjs'


const socketOptions = {
   path: '/chatgpt-socket-io/',
   transports: ["websocket"],
   reconnectionDelay: 1000,
   reconnectionDelayMax: 10000,
   extraHeaders: {
      "bearer-token": "mytoken"
   },
}

const socket = io(socketOptions)

export const app = expressXClient(socket, { debug: true })
