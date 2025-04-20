# Votigram

![Votigram Logo](https://via.placeholder.com/150x150.png?text=Votigram)

**A blockchain-powered, human-verified voting and public participation platform with a Kenya-first approach.**

## 📑 Overview

Votigram is a comprehensive platform that combines blockchain technology, zero-knowledge proofs, and inclusive design to create a trusted ecosystem for digital voting and public participation. It features geotagged polls, live audio/video discussions, offline participation methods, and a social feed with transparent metrics.

### Core Features

- **Tamper-proof voting** via blockchain integration
- **Human-only verification** using WorldID or other zero-knowledge proof systems
- **Inclusive participation** through web, mobile, USSD, SMS, and local kiosks
- **Live engagement** with audio/video rooms and real-time polling
- **Social feed** with transparent distribution and advanced metrics
- **Multi-language support** starting with English and Swahili

## 🏗️ Architecture

Votigram employs a layered architecture:

### Frontend Layer

- Next.js 13+ with App Router for SSR and dynamic routing
- TypeScript for type safety
- Tailwind CSS for styling
- React-based components with Context/Redux state management
- PWA capabilities for offline caching

### Backend Layer

- Node.js with NestJS framework
- PostgreSQL with PostGIS for geospatial data
- Redis for caching and real-time updates
- WebSockets for live updates and streaming
- Microservices architecture for scalability

### Blockchain Layer

- Smart contracts on Polygon or other L2 networks
- Core contracts include PollFactory, PollContract, and ZK Verification
- Minimal on-chain data with IPFS for metadata storage

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL (v14+)
- Redis (v6+)
- Polygon node access (or testnet)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/votigram.git
   cd votigram
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../api
   npm install
   
   # Install contract dependencies
   cd ../contracts
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy environment examples
   cp frontend/.env.example frontend/.env.local
   cp api/.env.example api/.env
   ```

4. Start the development servers:
   ```bash
   # Start backend services using Docker
   docker-compose up -d
   
   # Start API server
   cd api
   npm run start:dev
   
   # Start frontend server
   cd ../frontend
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs

## 🧩 Key Components

### User Authentication

- Email/Phone registration with optional 2FA
- WorldID integration for proof-of-humanity
- Role-based access control (unverified, verified, admin)

### Poll System

- Creation → Validation → Voting → Results workflow
- Community validation for public polls
- On-chain vote counting with optional privacy

### Live Engagement

- WebRTC-based audio/video rooms
- Text-to-speech for accessibility ("Votigram FM")
- Real-time chat and voting

### Offline Support

- USSD menus for feature phone access
- SMS commands for voting
- Local kiosks with periodic synchronization

### Social Feed

- Guaranteed reach to followers
- Transparent metrics and analytics
- Tipping and reward system

## 📱 Usage Examples

### Creating a Poll

```javascript
// Using the API
const createPoll = async () => {
  const response = await fetch('/api/polls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Community Road Project',
      description: 'Which road should be prioritized for repair?',
      options: [
        { text: 'Main Street' },
        { text: 'Elm Street' },
        { text: 'Oak Avenue' }
      ],
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000), // 1 day later
      geoRestriction: 'COUNTY_001'
    })
  });
  
  return response.json();
};
```

### Voting in a Poll

```javascript
// Using the API
const castVote = async (pollId, optionId) => {
  const response = await fetch('/api/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      pollId,
      option: optionId
    })
  });
  
  return response.json();
};
```

### USSD Flow Example

```
*123# (User dials the short code)

Welcome to Votigram
1. View Polls
2. Vote
3. My Account
4. Language

User selects 1

Active Polls:
1. Community Road Project
2. School Budget Allocation
3. More...

User selects 1

Community Road Project
Which road should be prioritized?
1. Main Street
2. Elm Street
3. Oak Avenue

User selects 2

Thank you! You've voted for Elm Street.
1. View Results
2. Main Menu
```

## 🌐 Deployment

Votigram follows a robust CI/CD pipeline:

1. **Development**: Local testing and feature development
2. **Staging**: Integration testing and QA
3. **Production**: Live deployment with monitoring

### Infrastructure

- Kubernetes for orchestration
- AWS/GCP for cloud resources
- Vercel for frontend hosting
- Monitoring with Datadog/Grafana

## 🔐 Security and Compliance

- Data protection compliance (Kenyan DP laws, GDPR)
- Electoral regulations compliance
- Smart contract audits and bug bounties
- Zero-knowledge proofs for privacy
- Continuous monitoring and anomaly detection

## 📊 Testing Strategy

- Unit tests for components and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Load testing for concurrency handling
- Security penetration testing

## 🗺️ Roadmap

### Phase 1: MVP (2-3 Months)
- Basic user registration and verification
- Simple poll creation and voting
- USSD integration pilot
- Basic social feed

### Phase 2: Advanced Features (3-6 Months)
- Poll validation system
- Live audio/video integration
- Multi-language support
- Tipping and verified badges

### Phase 3: Optimization & Scale (6-12+ Months)
- Zero-knowledge proofs for privacy
- Advanced geospatial analytics
- Kiosk-based offline nodes
- AI-assisted content moderation

## 🤝 Contributing

We welcome contributions to Votigram! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- World ID for proof-of-humanity protocol
- Polygon for blockchain infrastructure
- Our contributors and community supporters
- The people of Kenya who inspired this project

---

For more information, contact us at [info@votigram.com](mailto:info@votigram.com) or visit our [website](https://votigram.com).