// Result codes
// These are listed in order: if multiple are applicable, the higher one takes precedence
// For example, if the game & the player both don't exist, GAME_DOESNT_EXIST is expected (instead of PLAYER_DOESNT_EXIST)
const GAME_DOESNT_EXIST = -2;
const GAME_NOT_STARTED = -3;
const GAME_ENDED = -4;
const GAME_ONGOING = -5;
const PLAYER_DOESNT_EXIST = -6;
const WRONG_TURN = -7;
const INVALID_LOCATION = -8;

let games = {};
// Creates a new game. Multiple games may be running simultaneously.
//
// Returns:
//   - A valid unique ID for the new game
// Errors:
//   None
function createGame() {
    const gameId = Math.floor(Date.now() * Math.random());
    games[gameId] = {
        players: [-1, -1], board: [...Array(3)].map(() =>
            Array(3).fill(null)), activePlayer: 0, isEnded: false
    };
    return gameId;
}

// Adds a player to a game that has been created, but not started.
// This function starts the game automatically once the 2nd player has joined.
// Once the game starts, the first player's turn begins (the one identified first call to AddPlayer)
//
// Returns:
//   A valid ID for the new player, unique to this game, which may be any integer greater than zero
//
//   GAME_DOESNT_EXIST if the game id does not identify a valid game
//   GAME_ENDED if the game has ended
//   GAME_ONGOING if the game has already begun
function addPlayer(gameId) {
    if (gameId < 201) {
        return GAME_DOESNT_EXIST;
    }

    if (games[gameId].isEnded) {
        return GAME_ENDED
    }

    if (games[gameId].players[0] > 0 && games[gameId].players[1] > 0) {
        return GAME_ONGOING;
    }

    let id = gameId + Math.random();
    if (games[gameId].players[0] <= 0) {
        games[gameId].players[0] = id;
    } else {
        games[gameId].players[1] = id;
    }

    return id;
}

// Allows a player to make a move
//
// After each valid move, the turn switches to the other player.
// If the move completes the game, the game status shall be considered ended.
// No early detection of draws is done. Game must fully play out (9 moves) to reach a draw.
//
// Returns:
//   GAME_ONGOING if no one has won yet
//   The id of the current player if he won with this move (game is then ended)
//   The id of the other player if the game ended in a draw (game is then ended)
//
//   GAME_DOESNT_EXIST if the game id does not identify a valid game
//   GAME_NOT_STARTED if the game has not started
//   GAME_ENDED if the game has already ended before this was called
//   PLAYER_DOESNT_EXIST if the player id is not valid for this game
//   WRONG_TURN if this is not player A turn
//   INVALID_LOCATION if boardX or boardY is outside the range of [0, 2], or if that spot has been used already
//

function makeMove(gameId, playerId, boardX, boardY) {
    if (gameId < 201) {
        return GAME_DOESNT_EXIST;
    }

    if (games[gameId].isEnded) {
        return GAME_ENDED
    }

    if (games[gameId].players[0] <= 0 || games[gameId].players[1] <= 0) {
        return GAME_NOT_STARTED;
    }

    if (!games[gameId].players.includes(playerId))
        return PLAYER_DOESNT_EXIST

    if (boardX < 0 || boardX > 2 || boardY < 0 || boardY > 2) {
        return INVALID_LOCATION;
    }

    if (games[gameId].activePlayer === 0) {
        games[gameId].activePlayer = games[gameId].players[0];
    }

    if (playerId !== games[gameId].activePlayer) {
        return WRONG_TURN;
    }

    if (games[gameId].board[boardY][boardX] !== null) {
        return INVALID_LOCATION
    }

    games[gameId].board[boardY][boardX] = playerId;
    games[gameId].activePlayer = games[gameId].players[0] === playerId ?
        games[gameId].players[1] : games[gameId].players[0];

    if (_isPlayerWin(playerId, gameId)) {
        games[gameId].isEnded = true;
        return playerId;
    }

    if (_isDraw(gameId)) {
        games[gameId].isEnded = true;
        return games[gameId].activePlayer
    }

    return GAME_ONGOING;
}

function _isPlayerWin(playerID, gameId) {
    const matrix = [...Array(3)].map(() => Array(3).fill(null));
    let counter = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            counter++
            matrix[i][j] = games[gameId].board[i][j];
            matrix[i][j] = matrix[i][j] === null ? counter : matrix[i][j];
        }
    }

    for (let i = 0; i < 3; i++) {
        const row = matrix[i][0] === matrix[i][1] && matrix[i][1] === matrix[i][2] && matrix[i][2] === playerID;
        const column = matrix[0][i] === matrix[1][i] && matrix[1][i] === matrix[2][i] && matrix[2][i] === playerID;
        if (column || row) {
            return true
        }
    }
    if (matrix[0][0] === matrix[1][1] && matrix[1][1] === matrix[2][2] && matrix[2][2] === playerID) {
        return true;
    }
    return matrix[0][2] === matrix[1][1] && matrix[1][1] === matrix[2][0] && matrix[2][0] === playerID;
}

function _isDraw(gameId) {
    return (games[gameId].board.every(element => element.every(value => value !== null)));
}

//////////////////////////////////////////////////////
// Nothing below this point needs to be changed ------
// Below is main() and tests -------------------------
//////////////////////////////////////////////////////

class TestSuite {
    constructor() {
        this.testGames = {};
        // A series of full where play
        this.wins = [
            // xo_
            // xo_
            // x__
            [
                [0, 0],
                [1, 0],
                [0, 1],
                [1, 1],
                [0, 2],
            ],

            // xox
            // oxo
            // x__
            [
                [2, 0],
                [2, 1],
                [0, 0],
                [1, 0],
                [0, 2],
                [0, 1],
                [1, 1],
            ],

            // oxx
            // ooo
            // xx_
            [
                [0, 2],
                [1, 1],
                [2, 0],
                [0, 1],
                [1, 2],
                [0, 0],
                [1, 0],
                [2, 1],
            ],

            // ox_
            // _o_
            // xx_
            [
                [1, 0],
                [1, 1],
                [0, 2],
                [0, 0],
                [1, 2],
                [2, 2],
            ],
        ];

        this.draws = [
            // xxo
            // oox
            // xxo
            [
                [1, 2],
                [1, 1],
                [0, 2],
                [2, 2],
                [0, 0],
                [0, 1],
                [2, 1],
                [2, 0],
                [1, 0],
            ],

            // oxo
            // xxo
            // xox
            [
                [1, 1],
                [0, 0],
                [0, 2],
                [2, 0],
                [1, 0],
                [1, 2],
                [0, 1],
                [2, 1],
                [2, 2],
            ]
        ];
    }

    isValidId(id) { return id >= 0; }

    // Simple assert helper
    check(expr, text) {
        if (!expr)
            throw text;
    }

    // Wrapper for createGame that does some basic checks
    createTestGame() {
        const gameId = createGame();
        this.check(gameId >= 0, "Negative game id");
        this.check(!(gameId in this.testGames), "Duplicate game id");
        this.testGames[gameId] = { players: [-1, -1] };
        return gameId;
    }

    invalidGameId() { // Returns an unused game id
        for (let i = 200;; ++i)
            if (!(i in this.testGames))
                return i;
    }

    addTestPlayer(gameId) {
        const playerId = addPlayer(gameId);
        if (playerId < 0)
            return playerId;
        if (!(gameId in this.testGames))
            throw "Invalid gameID accepted to addPlayer " + gameId.toString();
        
        const game = this.testGames[gameId];
        if (!this.isValidId(game.players[0]))
            game.players[0] = playerId;
        else if (game.players[0] == playerId)
            throw "Duplicate player id in game";
        else if (!this.isValidId(game.players[1]))
            game.players[1] = playerId;
        else
            throw "Received a player id from a full game";

        return playerId;
    }

    testCreateGame() {
        for (let i = 0; i < 10; ++i)
            this.createTestGame();
    }

    testInvalidGameIds() {
        // Test some negative ids
        for (let i = -1; i > -10; --i)
            this.check(this.addTestPlayer(i) == GAME_DOESNT_EXIST, "Negative game id should not be valid");

        // Test an invalid positive id
        this.check(this.addTestPlayer(this.invalidGameId()) == GAME_DOESNT_EXIST, "Invalid game id was accepted");

        // Test making a move on an invalid game
        this.check(makeMove(this.invalidGameId(), 0, 0, 0) == GAME_DOESNT_EXIST, "Wrong player move accepted");
    }

    testAddPlayer() {
        const gameId = this.createTestGame();
        // Make sure we can't make a move before adding players
        this.check(makeMove(gameId, 0, 0, 0) == GAME_NOT_STARTED, "Made a move with no players added");

        // Add the first player
        let player1Id;
        this.check(this.isValidId(player1Id = this.addTestPlayer(gameId)), "Negative game id should not be valid");

        // Make sure we can't make a move after adding the first player
        this.check(makeMove(gameId, player1Id, 0, 0) == GAME_NOT_STARTED, "Made a move with only one player added");

        // Add the second player
        let player2Id;
        this.check(this.isValidId(player2Id = this.addTestPlayer(gameId)), "Negative game id should not be valid");

        // Make sure we can't move with the 2nd player, but that the game has started
        this.check(makeMove(gameId, player2Id, 0, 0) == WRONG_TURN, "Made a move with only one player added");

        // Make sure that we can't add more players after that
        for (let i = 0; i < 10; ++i)
            this.check(this.addTestPlayer(gameId) == GAME_ONGOING, "Adding players after the second should return GAME_ONGOING");
    }


    testFullGame(game, isDraw) {
        const gameId = this.createTestGame();

        const player1Id = this.addTestPlayer(gameId);
        const b = this.addTestPlayer(gameId);

        for (let i = 0; i < game.length; ++i) {
            const currentPlayer = i % 2 == 0 ? player1Id : b;
            const otherPlayer = i % 2 == 0 ? b : player1Id;
            const nextMove = game[i];
            // Test that we can add players at no point during the game
            this.check(this.addTestPlayer(gameId) == GAME_ONGOING, "Adding players during the game should return GAME_ONGOING");

            // Test that the wrong player can't move
            this.check(makeMove(gameId, otherPlayer, nextMove[0], nextMove[1]) == WRONG_TURN, "Wrong player move accepted");

            // Test that the right player can't move to any previously used spot
            for (let i2 = 0; i2 < i; ++i2)
                this.check(makeMove(gameId, currentPlayer, game[i2][0], game[i2][1]) == INVALID_LOCATION, "Wrong player move accepted");

            // Test that the correct player can't move to a spot outside the board
            this.check(makeMove(gameId, currentPlayer, -1 - i, 0) == INVALID_LOCATION, "Invalid board location accepted");
            this.check(makeMove(gameId, currentPlayer, 0, i + 3) == INVALID_LOCATION, "Invalid board location accepted");

            // Make move
            if (i + 1 < game.length) {
                // Not-final move
                this.check(makeMove(gameId, currentPlayer, nextMove[0], nextMove[1]) == GAME_ONGOING, "Valid move rejected");
            } else {
                let expectedResult = otherPlayer; // Returning the other player means draw
                let text = "Game should have been a draw";
                if (!isDraw) {
                    expectedResult = currentPlayer;
                    text = i % 2 == 0 ? "Player 1 should have won" : "Player 2 should have won";
                }

                // Final move of the game
                this.check(makeMove(gameId, currentPlayer, nextMove[0], nextMove[1]) == expectedResult, text);

                // Test that after the game is complete, addTestPlayer and makeMove return GAME_ENDED
                this.check(this.addTestPlayer(gameId) == GAME_ENDED, "Adding a player after the game ended should return GAME_ENDED");
                this.check(makeMove(gameId, i % 2 == 0 ? b : player1Id, game[i][0], game[i][1]) == GAME_ENDED, "Making a move after the game ended should return GAME_ENDED");
            }
        }
    }

    runTest(name, func) {
        try {
            func();
            console.log("[PASSED] ", name);
            return false;
        } catch (e) {
            console.log(`[FAILED] ${name}: ${e}`);
            return true;
        }
    }

    runAllTests() {
        let failed = this.runTest("testCreateGame", () => this.testCreateGame());
        failed = this.runTest("testInvalidGameIds", () => this.testInvalidGameIds()) || failed;
        failed = this.runTest("testAddPlayer", () => this.testAddPlayer()) || failed;

        for (const game of this.wins)
            failed = this.runTest(game.length % 2 == 0 ? "testPlayer1Win" : "testPlayer2Win", () => { this.testFullGame(game, false); }) || failed;

        for (const game of this.draws)
            failed = this.runTest("testDraw", () => { this.testFullGame(game, true); }) || failed;

        return failed ? 1 : 0; // Return nonzero if at least one test failed
    }
}

const testSuite = new TestSuite();
testSuite.runAllTests();