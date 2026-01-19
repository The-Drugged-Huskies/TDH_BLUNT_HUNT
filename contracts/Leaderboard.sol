// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Leaderboard
 * @dev Stores the top 100 high scores. 
 *      Implements Pay-to-Play mechanics:
 *      - 1 DOGE entry fee.
 *      - 25% goes to owner (dev fee).
 *      - 75% goes to the Prize Pool.
 *      - Every hour, the Prize Pool is paid to the leaderboard winner.
 *      - Leaderboard resets after payout.
 */
contract Leaderboard is Ownable {
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    Score[] public leaderboard;
    uint256 constant MAX_LEADERBOARD_SIZE = 100;

    // Game Config
    // Game Config
    uint256 public gameCost = 1 ether; // 1 DOGE
    uint256 public prizePool;
    uint256 public gameEndTime;

    // Ticket: True if user has paid for a game but not yet submitted
    mapping(address => bool) public hasTicket;

    event NewHighScore(address indexed player, uint256 score, uint256 rank);
    event PrizePaid(address indexed winner, uint256 amount, uint256 timestamp);
    event GameStarted(address indexed player, uint256 timestamp);
    event PotUpdated(uint256 newAmount);

    event PaymentFailed(address indexed recipient, uint256 amount);

    constructor() {
        gameEndTime = getNextTeatime(block.timestamp);
    }

    /**
     * @dev Calculates the next XX:42:00 timestamp.
     *      - If now is 10:30, returns 10:42.
     *      - If now is 10:50, returns 11:42.
     */
    function getNextTeatime(uint256 _now) public pure returns (uint256) {
        uint256 currentSeconds = _now % 3600; // Seconds into the current hour
        uint256 targetSeconds = 42 * 60;      // 42nd minute in seconds (2520)

        if (currentSeconds < targetSeconds) {
            // It's before :42 this hour -> Go to :42 this hour
            return _now + (targetSeconds - currentSeconds);
        } else {
            // It's after :42 -> Go to :42 next hour
            return _now + (3600 - currentSeconds) + targetSeconds;
        }
    }

    /**
     * @dev Player pays 1 DOGE to start a game.
     *      Checks if the previous game ended (and pays out winner if so).
     *      Splits fee: 25% owner, 75% pot.
     */
    function startGame() external payable {
        require(msg.value >= gameCost, "Insufficient payment");

        // 1. Check for hourly payout trigger BEFORE processing new pot addition
        distributePrize();

        // 2. Split Payment
        uint256 devFee = (msg.value * 25) / 100;
        uint256 potShare = msg.value - devFee;

        // Transfer dev fee (Safe Call)
        (bool success, ) = payable(owner()).call{value: devFee}("");
        require(success, "Dev fee transfer failed");

        // Add to Pot
        prizePool += potShare;
        emit PotUpdated(prizePool);

        // 3. Grant Ticket (Overwrites previous unused ticket)
        hasTicket[msg.sender] = true;
        
        emit GameStarted(msg.sender, block.timestamp);
    }

    /**
     * @dev Submits a score. Consumes Ticket.
     */
    function submitScore(uint256 _score) external {
        require(hasTicket[msg.sender] == true, "No ticket. Pay to play.");
        
        // Consume Ticket
        hasTicket[msg.sender] = false;

        // Check availability (Timer might have expired during gameplay)
        distributePrize();

        // Standard Leaderboard Logic
        uint256 length = leaderboard.length;
        if (length < MAX_LEADERBOARD_SIZE) {
            _insertScore(_score);
            return;
        }

        // Check if it beats the lowest
        if (_score > leaderboard[length - 1].score) {
            leaderboard.pop();
            _insertScore(_score);
        }
    }

    /**
     * @dev Public: Triggered externally (by bot/frontend) OR internally (by game actions).
     */
    function distributePrize() public {
        if (block.timestamp >= gameEndTime) {
            uint256 amount = prizePool;
            
            // Check availability - Must have players to pay out
            if (leaderboard.length > 0) {
                address winner = leaderboard[0].player;
                
                // --- EFFECTS (Reset State First) ---
                prizePool = 0;
                delete leaderboard; 
                gameEndTime = getNextTeatime(block.timestamp);

                // --- INTERACTIONS (External Call Last) ---
                if (amount > 0) {
                    // Safe Payout: Do NOT revert if it fails, just emit event.
                    // Funds remain in contract (can be recovered by owner).
                    (bool sent, ) = payable(winner).call{value: amount}("");
                    if (!sent) {
                        emit PaymentFailed(winner, amount);
                    } else {
                        emit PrizePaid(winner, amount, block.timestamp);
                    }
                }
            } else {
                // No players? Just restart the timer, keep the pot.
                gameEndTime = getNextTeatime(block.timestamp);
            }
        }
    }

    function _insertScore(uint256 _score) internal {
        uint256 length = leaderboard.length;
        leaderboard.push(Score({
            player: msg.sender,
            score: _score,
            timestamp: block.timestamp
        }));

        for (uint256 i = length; i > 0; i--) {
            if (leaderboard[i].score > leaderboard[i - 1].score) {
                Score memory temp = leaderboard[i];
                leaderboard[i] = leaderboard[i - 1];
                leaderboard[i - 1] = temp;
            } else {
                break;
            }
        }
    }

    // --- Views ---

    function getLeaderboard() external view returns (Score[] memory) {
        return leaderboard;
    }

    function getLowestQualifyingScore() external view returns (uint256) {
        if (leaderboard.length < MAX_LEADERBOARD_SIZE) {
            return 0;
        }
        return leaderboard[leaderboard.length - 1].score;
    }

    function getPotInfo() external view returns (uint256 pot, uint256 endTime) {
        return (prizePool, gameEndTime);
    }

    // --- Admin ---

    function recoverFunds() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
