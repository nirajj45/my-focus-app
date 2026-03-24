# Focus Tree App - Test Plan

This document outlines the test cases for the Focus Tree application, covering core functionality, user experience, and edge cases.

## 1. Authentication
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| AUTH-01 | User logs in with Google | User is authenticated, profile picture and name are displayed. |
| AUTH-02 | User logs out | User is redirected to the landing state, stats are hidden or cleared. |
| AUTH-03 | User profile persistence | After refreshing the page, the user remains logged in. |

## 2. Timer & Focus Sessions
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| TIME-01 | Adjust timer duration | Slider updates the displayed time (10m to 120m). |
| TIME-02 | Start focus session | Timer starts counting down, "Plant" button becomes "Give Up". |
| TIME-03 | Complete focus session | Timer reaches 0:00, success modal appears, tree is added to forest, coins are earned. |
| TIME-04 | Give up focus session | User clicks "Give Up", tree is added as "Withered", no coins earned. |
| TIME-05 | Anti-cheat (Visibility) | User switches tabs during focus; session ends immediately, tree withers. |

## 3. Tree Store & Species
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| STORE-01 | Open Store | Store modal opens, displaying all species and current coin balance. |
| STORE-02 | Purchase Tree (Affordable) | User buys a tree; coins are deducted, tree is marked as "Unlocked". |
| STORE-03 | Purchase Tree (Insufficient) | "Buy" button is disabled if user doesn't have enough coins. |
| STORE-04 | Select Species | User can cycle through unlocked species in the Timer component. |
| STORE-05 | Plant Selected Species | The grown tree in the forest matches the species selected before starting. |

## 4. Forest & Stats
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| STAT-01 | Stats update on success | "Trees Grown", "Focus Time", and "Coins" increment correctly. |
| STAT-02 | Stats update on wither | "Trees Withered" increments, other stats remain unchanged. |
| GRID-01 | Forest Grid rendering | Grown trees appear with their specific species icons/colors. |
| GRID-02 | Forest Grid persistence | Forest remains consistent after page refresh. |

## 5. Leaderboard & Rooms
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| LEAD-01 | Global Leaderboard | Displays top 20 users by trees grown. |
| LEAD-02 | Create Room | User creates a room; unique 6-character code is generated. |
| LEAD-03 | Join Room | User enters a valid code; joins the room and sees other members. |
| LEAD-04 | Room Leaderboard | Displays members of the current room only. |
| LEAD-05 | Leave Room | User leaves the room; returns to the global leaderboard view. |

## 6. Edge Cases & Security
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| EDGE-01 | Zero duration focus | Not possible (minimum 10m enforced by UI). |
| EDGE-02 | Rapid click start | Timer should only start once; subsequent clicks ignored. |
| SEC-01 | Unauthorized write | Firestore rules should prevent users from updating other users' stats. |
| SEC-02 | Coin manipulation | Firestore rules should prevent users from setting their own coin balance directly. |
