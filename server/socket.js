const db = require('./db');

// Active bidding state
let activeBidding = {
    isActive: false,
    questionId: null,
    questionData: null,
    startTime: null,
    endTime: null,
    duration: 60000, // 60 seconds
    timerInterval: null,
    currentHighestBid: {
        teamId: null,
        teamName: null,
        bidAmount: 0
    }
};

// Timer broadcast interval
let timerBroadcastInterval = null;

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join rooms based on user type
        socket.on('join_team_room', (teamId) => {
            socket.join(`team_${teamId}`);
            console.log(`Team ${teamId} joined their room`);
        });

        socket.on('join_admin_room', () => {
            socket.join('admin_room');
            console.log('Admin joined admin room');
        });

        // Handle bid placement
        socket.on('place_bid', async (data) => {
            try {
                const { teamId, questionId, bidAmount } = data;
                
                // Validate bidding is active
                if (!activeBidding.isActive || activeBidding.questionId !== questionId) {
                    socket.emit('bid_error', { error: 'Bidding is not active for this question' });
                    return;
                }

                // Check if time is up
                if (Date.now() > activeBidding.endTime) {
                    socket.emit('bid_error', { error: 'Bidding time has expired' });
                    return;
                }

                // Validate bid amount
                if (bidAmount <= activeBidding.currentHighestBid.bidAmount) {
                    socket.emit('bid_error', { 
                        error: 'Bid must be higher than current highest bid',
                        currentHighest: activeBidding.currentHighestBid.bidAmount
                    });
                    return;
                }

                // Get team info
                const team = await db.getTeamById(teamId);
                if (!team) {
                    socket.emit('bid_error', { error: 'Team not found' });
                    return;
                }

                // Check if team has enough coins
                if (team.coins < bidAmount) {
                    socket.emit('bid_error', { error: 'Insufficient coins' });
                    return;
                }

                // Create bid in database
                const bid = await db.createBid(teamId, questionId, bidAmount);

                // Update current highest bid
                activeBidding.currentHighestBid = {
                    teamId: team.id,
                    teamName: team.team_name,
                    bidAmount: bidAmount
                };

                // Broadcast to all clients
                io.emit('highest_bid_update', {
                    teamName: team.team_name,
                    bidAmount: bidAmount,
                    timestamp: new Date().toISOString()
                });

                // Confirm bid to the placing team
                socket.emit('bid_confirmed', {
                    message: 'Bid placed successfully',
                    bid: bid
                });

            } catch (error) {
                console.error('Socket bid error:', error);
                socket.emit('bid_error', { error: 'Failed to place bid' });
            }
        });

        // Admin starts bidding
        socket.on('start_bidding', async (data) => {
            try {
                const { questionId } = data;
                
                // Get question details
                const questions = await db.getAllQuestions();
                const question = questions.find(q => q.id === questionId);
                
                if (!question) {
                    socket.emit('admin_error', { error: 'Question not found' });
                    return;
                }

                // Stop any existing bidding
                if (activeBidding.timerInterval) {
                    clearInterval(activeBidding.timerInterval);
                }
                if (timerBroadcastInterval) {
                    clearInterval(timerBroadcastInterval);
                }

                // Initialize new bidding session
                activeBidding = {
                    isActive: true,
                    questionId: questionId,
                    questionData: question,
                    startTime: Date.now(),
                    endTime: Date.now() + activeBidding.duration,
                    duration: activeBidding.duration,
                    timerInterval: null,
                    currentHighestBid: {
                        teamId: null,
                        teamName: null,
                        bidAmount: 0
                    }
                };

                // Start timer
                activeBidding.timerInterval = setInterval(() => {
                    const timeLeft = Math.max(0, activeBidding.endTime - Date.now());
                    
                    if (timeLeft <= 0) {
                        endBidding(io);
                    }
                }, 100);

                // Start timer broadcast (every 100ms for smooth countdown)
                timerBroadcastInterval = setInterval(() => {
                    const timeLeft = Math.max(0, activeBidding.endTime - Date.now());
                    io.emit('timer_update', { timeLeft });
                    
                    if (timeLeft <= 0) {
                        clearInterval(timerBroadcastInterval);
                    }
                }, 100);

                // Broadcast bidding start
                io.emit('start_bidding', {
                    question: question,
                    duration: activeBidding.duration
                });

                socket.emit('bidding_started', { 
                    message: 'Bidding started successfully',
                    question: question
                });

            } catch (error) {
                console.error('Start bidding error:', error);
                socket.emit('admin_error', { error: 'Failed to start bidding' });
            }
        });

        // Admin ends bidding manually
        socket.on('end_bidding', () => {
            endBidding(io);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

async function endBidding(io) {
    try {
        // Clear intervals
        if (activeBidding.timerInterval) {
            clearInterval(activeBidding.timerInterval);
        }
        if (timerBroadcastInterval) {
            clearInterval(timerBroadcastInterval);
        }

        // Process winner if there was a bid
        if (activeBidding.currentHighestBid.bidAmount > 0) {
            const winner = activeBidding.currentHighestBid;
            
            // Deduct coins from winning team
            const team = await db.getTeamById(winner.teamId);
            const newCoinBalance = team.coins - winner.bidAmount;
            await db.updateTeamCoins(winner.teamId, newCoinBalance);
            
            // Assign question to team
            await db.assignQuestionToTeam(
                winner.teamId, 
                activeBidding.questionId, 
                winner.bidAmount
            );

            // Broadcast auction end with winner
            io.emit('auction_end', {
                winner: {
                    teamName: winner.teamName,
                    bidAmount: winner.bidAmount
                },
                question: activeBidding.questionData,
                newCoinBalance: newCoinBalance
            });

            // Update specific team's coin balance
            io.to(`team_${winner.teamId}`).emit('coins_update', {
                coins: newCoinBalance
            });
        } else {
            // No bids placed
            io.emit('auction_end', {
                message: 'No bids were placed',
                question: activeBidding.questionData
            });
        }

        // Reset bidding state
        activeBidding = {
            isActive: false,
            questionId: null,
            questionData: null,
            startTime: null,
            endTime: null,
            duration: activeBidding.duration,
            timerInterval: null,
            currentHighestBid: {
                teamId: null,
                teamName: null,
                bidAmount: 0
            }
        };

    } catch (error) {
        console.error('End bidding error:', error);
    }
}

function getActiveBiddingState() {
    return {
        ...activeBidding,
        timeLeft: activeBidding.isActive ? Math.max(0, activeBidding.endTime - Date.now()) : 0
    };
}

module.exports = {
    initializeSocket,
    getActiveBiddingState
};