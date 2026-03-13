// Socket.io client for Bid2Code

class BidSocket {
    constructor() {
        this.socket = io();
        this.isConnected = false;
        this.setupEventListeners();
    }

    // Setup socket event listeners
    setupEventListeners() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.onConnect();
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            this.onDisconnect();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.onConnectionError(error);
        });

        // Bidding events
        this.socket.on('start_bidding', (data) => {
            console.log('Bidding started:', data);
            this.onStartBidding(data);
        });

        this.socket.on('highest_bid_update', (data) => {
            console.log('Highest bid updated:', data);
            this.onHighestBidUpdate(data);
        });

        this.socket.on('timer_update', (data) => {
            this.onTimerUpdate(data.timeLeft);
        });

        this.socket.on('auction_end', (data) => {
            console.log('Auction ended:', data);
            this.onAuctionEnd(data);
        });

        this.socket.on('bid_confirmed', (data) => {
            console.log('Bid confirmed:', data);
            this.onBidConfirmed(data);
        });

        this.socket.on('bid_error', (data) => {
            console.error('Bid error:', data);
            this.onBidError(data);
        });

        this.socket.on('coins_update', (data) => {
            console.log('Coins updated:', data);
            this.onCoinsUpdate(data);
        });

        // Admin events
        this.socket.on('bidding_started', (data) => {
            console.log('Bidding started confirmation:', data);
            this.onBiddingStarted(data);
        });

        this.socket.on('admin_error', (data) => {
            console.error('Admin error:', data);
            this.onAdminError(data);
        });
    }

    // Join team room
    joinTeamRoom(teamId) {
        if (this.isConnected) {
            this.socket.emit('join_team_room', teamId);
            console.log(`Joined team room: ${teamId}`);
        }
    }

    // Join admin room
    joinAdminRoom() {
        if (this.isConnected) {
            this.socket.emit('join_admin_room');
            console.log('Joined admin room');
        }
    }

    // Place bid
    placeBid(teamId, questionId, bidAmount) {
        if (!this.isConnected) {
            Utils.showAlert('Not connected to server', 'error');
            return;
        }

        this.socket.emit('place_bid', {
            teamId: teamId,
            questionId: questionId,
            bidAmount: bidAmount
        });
    }

    // Admin start bidding
    startBidding(questionId) {
        if (!this.isConnected) {
            Utils.showAlert('Not connected to server', 'error');
            return;
        }

        this.socket.emit('start_bidding', {
            questionId: questionId
        });
    }

    // Admin end bidding
    endBidding() {
        if (!this.isConnected) {
            Utils.showAlert('Not connected to server', 'error');
            return;
        }

        this.socket.emit('end_bidding');
    }

    // Event handlers - to be overridden by specific pages
    onConnect() {
        // Override in specific page
    }

    onDisconnect() {
        // Override in specific page
        Utils.showAlert('Lost connection to server', 'error');
    }

    onConnectionError(error) {
        // Override in specific page
        Utils.showAlert('Connection error: ' + error.message, 'error');
    }

    onStartBidding(data) {
        // Override in specific page
    }

    onHighestBidUpdate(data) {
        // Override in specific page
    }

    onTimerUpdate(timeLeft) {
        // Override in specific page
    }

    onAuctionEnd(data) {
        // Override in specific page
    }

    onBidConfirmed(data) {
        // Override in specific page
        Utils.showAlert('Bid placed successfully!', 'success');
    }

    onBidError(data) {
        // Override in specific page
        Utils.showAlert(data.error || 'Failed to place bid', 'error');
    }

    onCoinsUpdate(data) {
        // Override in specific page
    }

    onBiddingStarted(data) {
        // Override in specific page
        Utils.showAlert('Bidding started successfully', 'success');
    }

    onAdminError(data) {
        // Override in specific page
        Utils.showAlert(data.error || 'Admin action failed', 'error');
    }

    // Utility methods
    isConnected() {
        return this.isConnected;
    }

    reconnect() {
        if (!this.isConnected) {
            this.socket.connect();
        }
    }
}

// Team-specific socket handler
class TeamSocket extends BidSocket {
    constructor() {
        super();
        this.currentTeamId = null;
    }

    setTeamId(teamId) {
        this.currentTeamId = teamId;
        this.joinTeamRoom(teamId);
    }

    onConnect() {
        if (this.currentTeamId) {
            this.joinTeamRoom(this.currentTeamId);
        }
    }

    onDisconnect() {
        Utils.showAlert('Connection lost. Attempting to reconnect...', 'error');
    }

    onBidError(data) {
        Utils.showAlert(data.error || 'Failed to place bid', 'error');
        
        // Update UI to show current highest bid if provided
        if (data.currentHighest) {
            const currentBidElement = document.getElementById('currentBidAmount');
            if (currentBidElement) {
                currentBidElement.textContent = Utils.formatCoins(data.currentHighest);
            }
        }
    }

    onCoinsUpdate(data) {
        const coinsElement = document.getElementById('teamCoins');
        if (coinsElement) {
            coinsElement.textContent = Utils.formatCoins(data.coins);
        }
        
        // Also update in session storage
        const currentUser = Utils.getSessionStorage('currentUser');
        if (currentUser) {
            currentUser.coins = data.coins;
            Utils.setSessionStorage('currentUser', currentUser);
        }
    }
}

// Admin-specific socket handler
class AdminSocket extends BidSocket {
    onConnect() {
        this.joinAdminRoom();
    }

    onDisconnect() {
        Utils.showAlert('Admin connection lost', 'error');
    }

    onAdminError(data) {
        Utils.showAlert(data.error || 'Admin action failed', 'error');
    }
}

// Initialize appropriate socket based on page
document.addEventListener('DOMContentLoaded', () => {
    // Determine socket type based on page
    const path = window.location.pathname;
    
    if (path.includes('/team/')) {
        window.bidSocket = new TeamSocket();
    } else if (path.includes('/admin/')) {
        window.bidSocket = new AdminSocket();
    }
});