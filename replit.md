# AI Farming Agent

## Overview

This is a full-stack web application built for an AI-powered farming agent system. The application appears to be designed to help farmers optimize their agricultural operations through AI-driven insights, crop recommendations, and yield predictions. It features a modern React frontend with a clean, professional interface and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with custom CSS variables and a farming-themed color palette
- **Animations**: Framer Motion for smooth animations and transitions

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: connect-pg-simple for PostgreSQL-based session storage
- **Build System**: ESBuild for backend bundling

### Data Storage
- **Primary Database**: PostgreSQL with Neon Database serverless driver
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema definition in `/shared/schema.ts`
- **Migrations**: Managed through Drizzle Kit with migrations stored in `/migrations`

### Project Structure
- **Monorepo Layout**: Client and server code in separate directories with shared schemas
- **Client**: React frontend in `/client` directory
- **Server**: Express backend in `/server` directory  
- **Shared**: Common TypeScript types and schemas in `/shared` directory

### Authentication & Authorization
- **User Schema**: Basic user model with username/password fields
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Session Handling**: PostgreSQL-backed session storage

## External Dependencies

### UI & Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Framer Motion**: Animation library for React components
- **Lucide React**: Icon library for consistent iconography

### Data & State Management
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries
- **Drizzle Zod**: Schema validation integration

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for backend
- **Replit Plugins**: Development environment integrations

### Database & Backend
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe SQL ORM
- **Express.js**: Web application framework
- **connect-pg-simple**: PostgreSQL session store

### Utilities
- **date-fns**: Date manipulation library
- **clsx & tailwind-merge**: Utility functions for conditional CSS classes
- **nanoid**: Unique ID generation
- **cmdk**: Command palette component