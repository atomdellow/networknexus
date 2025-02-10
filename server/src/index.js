import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connect } from 'mongoose';
import cors from 'cors';
import { fileSystemRouter } from './routes/filesystem.js';
import { setupSocketHandlers } from './socket/handlers.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/fs', fileSystemRouter);

// Connect to MongoDB
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/networknexus');

// Setup Socket.IO handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
