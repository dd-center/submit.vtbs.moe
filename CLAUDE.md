# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Main Application (Vue.js frontend)
- `npm run serve` - Start development server with hot reload
- `npm run build` - Build for production 
- `npm run lint` - Run ESLint to check code quality

### VDB Submodule (VTuber Database)
Located in `src/vdb/`, this is the core VTuber database management system:
- `cd src/vdb && npm test` - Run database validation tests
- `cd src/vdb && npm run generate` - Generate JSON database files
- `cd src/vdb && npm run update` - Test and generate database (production workflow)

### Setup
```bash
git submodule update --init --recursive
npm install
```

## Architecture Overview

This is a Vue.js 2 application for managing VTuber database submissions at submit.vtbs.moe. The app allows users to create, edit, and submit VTuber information through a web interface.

### Key Components

**Frontend Structure:**
- Vue 2 with Vue Router for SPA navigation
- Vuex for state management
- Bulma CSS framework for styling
- Web Workers for heavy operations

**Core Views:**
- `Home.vue` - Main dashboard showing VTuber listings
- `Edit.vue` - VTuber information editor with form validation
- `Submit.vue` - Review and submit changes as GitHub PR
- `Login.vue` - GitHub OAuth authentication
- `Issues.vue` / `Issue.vue` - GitHub issue management interface
- `Workspace.vue` - Local draft management

**Data Flow:**
- All VTuber data stored as JSON files in `src/vdb/vtbs/` directory
- Local changes managed through IndexedDB via Web Workers
- Submissions create GitHub pull requests via GitHub API
- Real-time validation using the VDB testing framework

**Worker System:**
- `src/worker/` handles file system operations in Web Workers
- Provides async file operations without blocking UI
- Manages local workspace and diff calculations

**VDB Integration:**
- `src/vdb/` is a git submodule containing the VTuber database
- Each VTuber is a JSON file with standardized schema
- Includes validation, parsing, and generation tools
- Database compiles to public JSON API at vdb.vtbs.moe

### Configuration

- `vue.config.js` - Disables linting on save
- Uses legacy OpenSSL provider in Node.js for compatibility
- Web Worker integration via worker-loader

### Development Workflow

1. Local editing through web interface stores drafts in browser
2. Changes validated against VDB schema in real-time  
3. Submit creates GitHub PR with properly formatted commits
4. GitHub Actions automatically validate and deploy approved changes

The application serves as the primary editing interface for the community-maintained VTuber database, handling thousands of VTuber profiles across multiple platforms.