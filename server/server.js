const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://chess-xi-livid.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Game state
const games = new Map(); // gameId -> { players, game, status }
const queue = []; // Array of socket IDs waiting for a game

// Game statuses
const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join matchmaking queue
  socket.on('joinQueue', () => {
    console.log(`Player ${socket.id} joined the queue`);
    console.log(`Queue size before: ${queue.length}`);
    
    // Add player to queue
    queue.push(socket.id);
    console.log(`Queue size after: ${queue.length}`);
    
    // Check if there are at least 2 players in queue
    if (queue.length >= 2) {
      console.log('Attempting to match players...');
      
      // Get first two players
      const player1Id = queue.shift();
      const player2Id = queue.shift();
      
      console.log(`Matching ${player1Id} and ${player2Id}`);
      
      // Create a new game
      const gameId = uuidv4().slice(0, 8);
      const game = {
        id: gameId,
        players: {
          white: player1Id,
          black: player2Id
        },
        game: new Chess(),
        status: GAME_STATUS.PLAYING,
        moveHistory: []
      };
      
      games.set(gameId, game);
      
      // Emit gameMatched to both players
      io.to(player1Id).emit('gameMatched', {
        gameId,
        color: 'white',
        fen: game.game.fen(),
        turn: game.game.turn()
      });
      
      io.to(player2Id).emit('gameMatched', {
        gameId,
        color: 'black',
        fen: game.game.fen(),
        turn: game.game.turn()
      });
      
      // Make both players join the game room
      io.sockets.sockets.get(player1Id)?.join(gameId);
      io.sockets.sockets.get(player2Id)?.join(gameId);
      
      console.log(`Game created: ${gameId} with ${queue.length} players still in queue`);
    } else {
      // Not enough players, wait
      socket.emit('queueStatus', {
        message: 'Waiting for opponent...',
        position: queue.length
      });
      console.log(`Player ${socket.id} is waiting. Queue size: ${queue.length}`);
    }
  });

  // Leave queue
  socket.on('leaveQueue', () => {
    const index = queue.indexOf(socket.id);
    if (index !== -1) {
      queue.splice(index, 1);
      console.log(`Player ${socket.id} left the queue`);
    }
  });

  // Make a move
  socket.on('makeMove', ({ gameId, from, to, promotion }, callback) => {
    try {
      const game = games.get(gameId);
      
      if (!game) {
        if (typeof callback === 'function') {
          callback({ error: 'Game not found' });
        }
        return;
      }
      
      if (game.status === GAME_STATUS.FINISHED) {
        if (typeof callback === 'function') {
          callback({ error: 'Game is finished' });
        }
        return;
      }
      
      // Check if it's the player's turn
      const isWhiteTurn = game.game.turn() === 'w';
      const isPlayerWhite = game.players.white === socket.id;
      const isPlayerBlack = game.players.black === socket.id;
      
      if ((isWhiteTurn && !isPlayerWhite) || (!isWhiteTurn && !isPlayerBlack)) {
        if (typeof callback === 'function') {
          callback({ error: 'Not your turn' });
        }
        return;
      }
      
      const move = game.game.move({
        from,
        to,
        promotion: promotion || 'q'
      });
      
      if (move) {
        game.moveHistory.push(move);
        
        // Check game over conditions
        let gameOver = false;
        let gameOverMessage = '';
        
        if (game.game.isCheckmate()) {
          gameOver = true;
          const winner = game.game.turn() === 'w' ? 'Black' : 'White';
          gameOverMessage = `Checkmate! ${winner} wins!`;
          game.status = GAME_STATUS.FINISHED;
        } else if (game.game.isStalemate()) {
          gameOver = true;
          gameOverMessage = 'Stalemate! It\'s a draw!';
          game.status = GAME_STATUS.FINISHED;
        } else if (game.game.isDraw()) {
          gameOver = true;
          gameOverMessage = 'It\'s a draw!';
          game.status = GAME_STATUS.FINISHED;
        }
        
        // Broadcast the move to both players
        io.to(gameId).emit('moveMade', {
          from,
          to,
          fen: game.game.fen(),
          turn: game.game.turn(),
          move,
          gameOver,
          gameOverMessage
        });
        
        if (typeof callback === 'function') {
          callback({ success: true, move });
        }
      } else {
        if (typeof callback === 'function') {
          callback({ error: 'Invalid move' });
        }
      }
    } catch (error) {
      console.error('Error making move:', error);
      if (typeof callback === 'function') {
        callback({ error: error.message || 'Failed to make move' });
      }
    }
  });

  // Get game state
  socket.on('getGameState', ({ gameId }, callback) => {
    try {
      const game = games.get(gameId);
      
      if (!game) {
        if (typeof callback === 'function') {
          callback({ error: 'Game not found' });
        }
        return;
      }
      
      if (typeof callback === 'function') {
        callback({
          fen: game.game.fen(),
          turn: game.game.turn(),
          status: game.status,
          players: {
            white: !!game.players.white,
            black: !!game.players.black
          },
          moveHistory: game.moveHistory
        });
      }
    } catch (error) {
      console.error('Error getting game state:', error);
      if (typeof callback === 'function') {
        callback({ error: 'Failed to get game state' });
      }
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove from queue if waiting
    const queueIndex = queue.indexOf(socket.id);
    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
      console.log(`Player ${socket.id} removed from queue`);
    }
    
    // Clean up games where this player was part of
    for (const [gameId, game] of games.entries()) {
      if (game.players.white === socket.id || game.players.black === socket.id) {
        // Notify the other player
        io.to(gameId).emit('opponentDisconnected', {
          message: 'Your opponent has disconnected'
        });
        
        // Remove game after a delay
        setTimeout(() => {
          games.delete(gameId);
          console.log(`Game removed: ${gameId}`);
        }, 5000);
      }
    }
  });
});

// API endpoint for testing
app.get('/api/games', (req, res) => {
  try {
    const gameList = Array.from(games.entries()).map(([id, game]) => ({
      id,
      status: game.status,
      players: {
        white: !!game.players.white,
        black: !!game.players.black
      }
    }));
    res.json({
      games: gameList,
      queueSize: queue.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get games' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});