const { Chess } = require("chess.js");

const chess = new Chess();

console.log("FEN:", chess.fen());
console.log("Brett:", chess.board());
console.log("Lovlige trekk:", chess.moves({ verbose: true }));