# Bid2Code - Real-Time Coding Competition Platform

A complete web application for hosting real-time coding competitions where teams bid on programming questions using virtual coins.

## Features

### For Teams
- **Team Registration & Login** - Secure authentication system
- **Dashboard** - Real-time view of coins, active questions, and bidding
- **Live Bidding** - 30-second auction rounds with real-time updates
- **Question Management** - View purchased questions and spending history
- **Real-time Updates** - WebSocket-powered live bidding experience

### For Admin
- **Question Creation** - Add coding challenges with difficulty levels
- **Live Bidding Control** - Start/end auctions and monitor live bids
- **Team Management** - View team statistics and reset coin balances
- **Competition Rounds** - Organize questions by competition rounds
- **Real-time Monitoring** - Watch bidding activity as it happens

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Database**: PostgreSQL (NeonDB)
- **Real-time**: Socket.io
- **Authentication**: Session-based with bcrypt password hashing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (NeonDB recommended)
- npm or yarn package manager

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd bid2code
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL=your_neon_postgresql_connection_string

# Session Configuration
SESSION_SECRET=your_secret_key_here

# Server Configuration
PORT=3000
```

4. **Set up the database**
```bash
# Connect to your PostgreSQL database and run:
psql -d your_database_name -f database/schema.sql
```

Or manually execute the SQL commands in `database/schema.sql`.

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage Guide

### For Teams

1. **Registration**
   - Navigate to `/team/signup`
   - Create a team account with team name and password
   - Each team starts with 500 B2C coins

2. **Participating in Bidding**
   - Login at `/team/login`
   - View active questions on the dashboard
   - Place bids during 30-second auction rounds
   - Higher bids win questions
   - Coins are deducted from winning teams

3. **Managing Questions**
   - View purchased questions at `/team/questions`
   - See bidding history and spending statistics

### For Admin

1. **Access Admin Panel**
   - Navigate to `/admin/login`
   - Login with credentials:
     - Username: `admin`
     - Password: `admin123`

2. **Creating Questions**
   - Go to "Create Question" section
   - Add title, description, difficulty, and round
   - Use the preview feature to check formatting

3. **Running Bidding Sessions**
   - Navigate to "Live Bidding" section
   - Select a question to bid on
   - Click "Start Bidding" to begin 30-second auction
   - Monitor live bids in real-time
   - Auctions end automatically after 30 seconds

4. **Managing Teams**
   - View all teams and their coin balances
   - Reset team coins if needed
   - Monitor competition statistics

## Database Schema

The application uses four main tables:

- **teams**: Team information and coin balances
- **questions**: Coding challenges with metadata
- **bids**: Record of all bid transactions
- **team_questions**: Questions purchased by teams

See `database/schema.sql` for complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Team registration
- `POST /api/auth/login` - Team login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin Functions
- `POST /api/admin/questions` - Create question
- `GET /api/admin/questions` - Get all questions
- `GET /api/admin/teams` - Get all teams
- `POST /api/admin/teams/:id/reset-coins` - Reset team coins
- `GET /api/admin/stats` - Get competition statistics

### Bidding System
- `POST /api/bid/place-bid` - Place a bid
- `GET /api/bid/my-questions` - Get team's purchased questions
- `GET /api/bid/my-coins` - Get team's coin balance

## Socket.io Events

### Client to Server
- `join_team_room` - Team joins their room
- `join_admin_room` - Admin joins admin room
- `place_bid` - Submit a bid
- `start_bidding` - Admin starts bidding round
- `end_bidding` - Admin ends bidding early

### Server to Client
- `start_bidding` - New bidding round started
- `highest_bid_update` - Current highest bid changed
- `timer_update` - Countdown timer update
- `auction_end` - Bidding round completed
- `bid_confirmed` - Bid successfully placed
- `bid_error` - Bid placement failed
- `coins_update` - Team coin balance updated

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `PORT`: Server port (default: 3000)

### Customization Options
- Modify bidding duration in `server/socket.js` (default: 30 seconds)
- Adjust starting coins in database schema (default: 500)
- Customize difficulty levels in admin interface
- Modify UI colors in CSS variables

## Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use HTTPS in production
3. Configure proper session security
4. Set up reverse proxy (nginx/Apache)
5. Use process manager (PM2) for deployment

### NeonDB Deployment
1. Create a NeonDB PostgreSQL instance
2. Update `DATABASE_URL` in environment variables
3. Run the schema setup script
4. Deploy application to your preferred hosting platform

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check `DATABASE_URL` environment variable
- Verify database credentials and connectivity
- Ensure PostgreSQL is running

**Socket.io Connection Issues**
- Check if port 3000 is available
- Verify CORS configuration
- Check browser console for errors

**Authentication Problems**
- Clear browser cookies and cache
- Verify session configuration
- Check bcrypt installation

### Logging
The application logs important events to the console. Check terminal output for:
- Database connection status
- Socket.io connection events
- Error messages and stack traces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Verify all prerequisites are installed correctly
4. Ensure environment variables are properly configured

---

Built with ❤️ for competitive programming communities