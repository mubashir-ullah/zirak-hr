# Changelog

All notable changes to the Zirak HR project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Account linking functionality for social providers (Google, GitHub, LinkedIn, Apple)
- User settings page with account management features
- Language context for internationalization support
- Dashboard layout component for consistent UI across the application

### Enhanced
- Improved authentication flow with Supabase
- Added "Remember Me" functionality for extended sessions
- Better error handling for social login and account linking

## [0.1.0] - 2025-03-25

### Added
- Initial project setup with Next.js 15.1.0, React.js, Material-UI, and Tailwind CSS
- Authentication system with multiple providers (Google, GitHub, LinkedIn, Apple)
- User role selection flow (Talent, Hiring Manager)
- Role-based dashboard redirection
- Talent Dashboard with profile management
- Hiring Manager Dashboard with company profile setup
- Job creation and management functionality
- Candidate discovery and application review features
- Interview and offer management capabilities
- Analytics dashboard with recruitment metrics
- Settings section for both Talent and Hiring Manager dashboards
- Admin Dashboard with system management features
- SEO improvements including metadata optimization and structured data
- Favicon implementation with theme-aware SVG that adapts to light/dark mode
- Resume management with upload, editing, and sharing capabilities
- Skills assessment and verification features
- Job matching and recommendation system
- Application tracking for talents

### Changed
- Migrated from NextAuth.js to Supabase Auth
- Removed MongoDB dependencies from authentication flow
- Updated user creation and lookup functions to use Supabase
- Modified role selection process to directly redirect users to appropriate dashboard
- Removed organization name and role/position fields from registration form
- Enhanced LinkedIn and GitHub providers with proper scope parameters
- Improved error handling and user feedback throughout the application

### Fixed
- Authentication issues with social login providers
- Import paths for Navbar and Footer components
- Created missing SocialLoginButtons component
- Enhanced error components and middleware for better debugging
- Fixed session update after role selection
- Improved role-based redirections

## [0.0.1] - 2025-03-01

### Added
- Project initialization
- Basic Next.js setup
- Initial authentication framework
