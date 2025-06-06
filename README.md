# Rickorty Archive

🧪 **Underground Fanworks Vault** - The uncensored archive for Rick x Morty fanworks

## Overview

Rickorty Archive is a full-stack web application that serves as a community platform for Rick and Morty fan-created content. Think AO3 meets underground art vault, Rick-style. Users can upload, browse, and interact with fan-made artwork and fanfiction without judgment.

## Features

### 🎨 **Artwork Gallery**
- Upload and browse high-quality fan art
- Support for all content ratings
- Image hosting and management

### 📚 **Fanfiction Archive**
- Share and discover stories across all genres and dimensions
- Rich text editing capabilities
- Categorization and tagging system

### 👥 **Community Features**
- User authentication and profiles
- Comments and interactions
- Likes and collections
- Age verification system
- Admin panel for content moderation

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** components
- **Wouter** for routing
- **TanStack Query** for data fetching

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Neon Database** (PostgreSQL)
- **JWT** authentication
- **Multer** for file uploads

### Database
- **PostgreSQL** (via Neon)
- **Drizzle Kit** for migrations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Neon account)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Replikas/rickortyarchived.git
cd rickortyarchived
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
rickortyarchive/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Application pages
│   │   └── App.tsx         # Main app component
│   └── index.html
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database configuration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # File storage handling
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts
├── uploads/               # File upload directory
└── package.json
```

## Features in Detail

### Authentication System
- User registration and login
- JWT-based authentication
- Age verification for mature content
- Admin role management

### Content Management
- File upload system for artwork
- Rich content creation tools
- Content categorization and tagging
- Rating and filtering system

### User Interface
- Dark theme with neon accents (Rick and Morty inspired)
- Responsive design for all devices
- Accessible UI components
- Smooth animations and transitions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Disclaimer

This is a fan-made project and is not affiliated with Adult Swim, Cartoon Network, or the creators of Rick and Morty. All Rick and Morty characters and references are property of their respective owners.