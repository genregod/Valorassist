# Valor Assist - AI-Powered Veteran Claims Platform

## Overview

Valor Assist is a comprehensive web application designed to support veterans in navigating VA claims processes. The platform combines AI-powered assistance with Azure cloud services to provide secure, scalable support for veterans seeking benefits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with the following core design:

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern development practices
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** with custom design system using navy/gold color scheme aligned with military/veteran themes
- **Component-based architecture** using shadcn/ui for consistent UI components
- **Responsive design** with mobile-first approach and accessibility compliance

### Backend Architecture
- **Node.js with Express** server providing RESTful API endpoints
- **TypeScript** throughout the entire codebase for type safety
- **Session-based authentication** using Passport.js with PostgreSQL session storage
- **Modular service architecture** with separate modules for different functionalities

### Database Strategy
- **PostgreSQL** as the primary database using Neon serverless
- **Drizzle ORM** for type-safe database operations and migrations
- **Schema-driven development** with shared types between client and server

## Key Components

### AI Integration
- **OpenAI GPT-4** integration for intelligent claim assistance and document analysis
- **VA-specific system prompts** tailored for accurate veteran benefits guidance
- **Chat-based interface** for interactive support sessions
- **Document analysis capabilities** for processing VA forms and medical records

### Azure Cloud Services
- **Azure Communication Services** for real-time chat support between veterans and representatives
- **Azure Document Intelligence** for automated document processing and data extraction
- **Azure App Service** deployment with automated scaling
- **Azure PostgreSQL** for secure data storage in compliance with veteran data protection requirements

### Security and Compliance
- **Password hashing** using scrypt with salt for secure authentication
- **Session management** with secure cookie configuration
- **Input validation** using Zod schemas for API endpoints
- **Audit logging** for tracking user actions and system events

### Core Features
1. **Claim Management System** - Veterans can create, track, and manage their VA claims
2. **Document Processing** - Upload and analyze VA forms, medical records, and supporting documentation
3. **AI-Powered Assistance** - Chat interface with specialized knowledge of VA processes
4. **Real-time Support** - Live chat with VA-accredited representatives
5. **Progress Tracking** - Dashboard showing claim status and next steps

## Data Flow

### User Registration and Authentication
1. Users register with basic information and veteran verification
2. Authentication creates secure sessions stored in PostgreSQL
3. User preferences and profiles are maintained for personalized experience

### Claim Processing Workflow
1. Veterans input claim information through multi-step forms
2. Documents are uploaded and processed using Azure Document Intelligence
3. AI analysis provides recommendations and identifies missing information
4. Claims are stored with full audit trail for compliance

### Support and Communication
1. Real-time chat sessions created using Azure Communication Services
2. AI assistant provides immediate responses for common questions
3. Escalation to human representatives when needed
4. All interactions logged for quality assurance

## External Dependencies

### Required Services
- **OpenAI API** - For AI-powered claim assistance and document analysis
- **Azure Communication Services** - For real-time chat functionality
- **Azure Document Intelligence** - For automated document processing
- **Neon PostgreSQL** - For primary data storage

### Optional Integrations
- **VA API Services** - For real-time claim status and veteran verification (when available)
- **Azure Cognitive Services** - For additional AI capabilities

### Development Dependencies
- **Node.js 22.x** - Runtime environment (updated from 20.x to address deprecation)
- **TypeScript** - Type safety and modern JavaScript features
- **Vite** - Fast build tooling and development server
- **Tailwind CSS** - Utility-first CSS framework

## Deployment Strategy

### Azure Deployment Configuration
The application is configured for Azure deployment with:
- **Resource Group**: `valor-assist-rg` for centralized resource management
- **App Service Plan**: Basic tier with auto-scaling capabilities
- **PostgreSQL Database**: Managed Azure Database for PostgreSQL
- **Key Vault**: Secure storage for API keys and connection strings
- **Application Insights**: Monitoring and analytics

### Environment Configuration
- **Production builds** using Vite with optimized bundles
- **Environment variable management** for secure credential handling
- **Health check endpoints** for monitoring application status
- **Automated deployment scripts** for consistent deployments

### Scalability Considerations
- **Stateless server design** enabling horizontal scaling
- **Database connection pooling** for efficient resource utilization
- **CDN-ready static assets** for global content delivery
- **Caching strategies** for frequently accessed data

The application prioritizes veteran user experience while maintaining enterprise-grade security and scalability. The modular architecture allows for easy feature additions and integrations with additional VA systems as they become available.

## Recent Changes (July 22-23, 2025)

### Node.js Runtime Update
- Updated from Node.js 20.x to 22.x LTS to address deprecation warnings
- Modified all GitHub Actions workflows to use Node.js 22.x
- Updated Azure deployment configurations for Node.js 22 LTS

### GitHub Actions Deployment
- Created `main_valor-assist-service.yml` workflow following Azure naming conventions
- Configured for automatic deployment on push to main branch
- Uses Azure Service Principal authentication for secure deployments
- Added comprehensive deployment documentation and scripts

### Azure Communication Services Fix
- Fixed bot message sending to prevent 404 errors on demo threads
- Bot continues to process messages and generate responses correctly
- Azure Communication Services integration ready for production threads

### Azure Deployment Port Fix (July 23, 2025)
- Fixed critical port mismatch: Changed application port from 5001 to 8080 for Azure compatibility
- Created `server.js` entry point to handle ESM module imports for Azure
- Removed `dist` from `.gitignore` to include built files in deployment
- Added deployment scripts (`.deployment`, `deploy.sh`) for custom build process
- Configured Azure App Service to use Node.js 22 LTS with proper startup command