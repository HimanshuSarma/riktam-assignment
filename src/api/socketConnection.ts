import { io } from 'socket.io-client';

import { url } from './api.config';

const socketConnection = io(url);

export { socketConnection };