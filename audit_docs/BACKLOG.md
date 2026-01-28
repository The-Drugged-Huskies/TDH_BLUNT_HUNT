# 📝 Project Backlog

Derived from Technical Audit (2026-01-28).

## 🔥 High Priority (Security & Critical Features)

- [ ] **Fix Leaderboard Contract**:
  - Change `submitScore` to be "Fail-Closed" (Mandatory Signer).
  - Redeploy contract.
- [x] **Security: Payout DoS Protection**:
  - **Critical**: If a winner is a contract that rejects funds, `distributePrize` reverts, causing `startGame` to fail. The game halts.
  - Fix: Implement "Pull vs Push" or "Rollover on Failure" (don't `require` success).
- [x] **Security: Payout DoS Protection**:
  - **Critical**: If a winner is a contract that rejects funds, `distributePrize` reverts, causing `startGame` to fail. The game halts.
  - Fix: Implement "Pull vs Push" or "Rollover on Failure" (don't `require` success).
- [x] **Optimization: Struct Packing**:
  - `Score` struct currently uses 3 storage slots.
  - Optimization: Pack `player` (160), `score` (48), `timestamp` (48) into 1 slot to reduce gas by ~60%.
- [x] **Feature: Adjustable Dev Fee**:
  - Change hardcoded `25` to a variable `devFeePercent` adjustable by owner.
- [x] **Implement All-Time Leaderboard**:
  - The current contract `Leaderboard.sol` **does not** store all-time high scores, only the current round.
  - Add `Score[] public allTimeLeaderboard` and logic to update it.
- [x] **Cleanup**:
  - Delete `verify_signer.py`.
  - Secure/Remove `static/signer_debug.html`.

## 📱 Mobile & Validation

- [ ] **Contract Verification (No Deploy Needed)**:
  - Verify source code on Dogechain Explorer to publish Natspec comments.
  - *Note: Do not redeploy. Use the current `Leaderboard.sol` to verify the existing address.*

## 🛠 Technical

- [x] **Frontend <-> Contract Sync**:
  - Ensure `static/deploy.html` and `contracts/Leaderboard.sol` remain in sync (currently potential drift).
