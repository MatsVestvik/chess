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
        `https://chess-xi-livid.vercel.app/`,
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Game state
const games = new Map(); // gameId -> { players, game, status }

// Game statuses
const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new game
  socket.on('createGame', (callback) => {
    const gameId = uuidv4().slice(0, 8);
    const game = {
      id: gameId,
      players: {
        white: socket.id,
        black: null
      },
      game: new Chess(),
      status: GAME_STATUS.WAITING,
      moveHistory: []
    };
    
    games.set(gameId, game);
    socket.join(gameId);
    
    console.log(`Game created: ${gameId}`);
    callback({ gameId, color: 'white' });
  });

  // Join an existing game
  socket.on('joinGame', ({ gameId }, callback) => {
    const game = games.get(gameId);
    
    if (!game) {
      callback({ error: 'Game not found' });
      return;
    }
    
    if (game.status === GAME_STATUS.PLAYING) {
      callback({ error: 'Game already in progress' });
      return;
    }
    
    if (game.players.black) {
      callback({ error: 'Game is full' });
      return;
    }
    
    // Join the game
    game.players.black = socket.id;
    game.status = GAME_STATUS.PLAYING;
    socket.join(gameId);
    
    console.log(`Player joined game: ${gameId}`);
    
    // Notify both players that game has started
    io.to(gameId).emit('gameStarted', {
      fen: game.game.fen(),
      turn: game.game.turn()
    });
    
    callback({ color: 'black' });
  });

  // Make a move
  socket.on('makeMove', ({ gameId, from, to, promotion }, callback) => {
    const game = games.get(gameId);
    
    if (!game) {
      callback({ error: 'Game not found' });
      return;
    }
    
    if (game.status === GAME_STATUS.FINISHED) {
      callback({ error: 'Game is finished' });
      return;
    }
    
    // Check if it's the player's turn
    const isWhiteTurn = game.game.turn() === 'w';
    const isPlayerWhite = game.players.white === socket.id;
    const isPlayerBlack = game.players.black === socket.id;
    
    if ((isWhiteTurn && !isPlayerWhite) || (!isWhiteTurn && !isPlayerBlack)) {
      callback({ error: 'Not your turn' });
      return;
    }
    
    try {
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
        
        callback({ success: true, move });
      } else {
        callback({ error: 'Invalid move' });
      }
    } catch (error) {
      callback({ error: error.message });
    }
  });

  // Get game state
  socket.on('getGameState', ({ gameId }, callback) => {
    const game = games.get(gameId);
    
    if (!game) {
      callback({ error: 'Game not found' });
      return;
    }
    
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
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Clean up games where this player was the only one
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
  const gameList = Array.from(games.entries()).map(([id, game]) => ({
    id,
    status: game.status,
    players: {
      white: !!game.players.white,
      black: !!game.players.black
    }
  }));
  res.json(gameList);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});