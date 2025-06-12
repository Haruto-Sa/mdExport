# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese academic paper summarization tool that processes text files and generates Markdown summaries using Google's Gemini AI. The application is built as a single-page web app using Vite, TypeScript, and vanilla JavaScript.

## Common Development Commands

- **Development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Install dependencies**: `npm install`

## Environment Setup

The application requires a `GEMINI_API_KEY` environment variable. This should be set in a `.env.local` file at the project root. The Vite config exposes this as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` in the client bundle.

## Architecture

- **Main entry point**: `index.tsx` - Contains all application logic including file handling, AI summarization, and download functionality
- **Frontend**: Single HTML page (`index.html`) with vanilla TypeScript/JavaScript
- **Build system**: Vite with TypeScript support
- **AI Integration**: Uses `@google/genai` library with the `gemini-2.5-flash-preview-04-17` model
- **File processing**: Accepts `.txt` files and outputs `.md` files

## Key Features

1. **File Upload**: Processes text files containing academic papers
2. **AI Summarization**: Uses Gemini AI to generate structured academic summaries in Japanese
3. **Markdown Export**: Downloads summarized content as `.md` files with proper naming
4. **Error Handling**: Comprehensive error handling for API issues, file problems, and validation

## Code Organization

The main application logic is contained in a single TypeScript file (`index.tsx`) that handles:
- DOM manipulation and event handling
- File reading and validation
- Google Gemini AI API integration
- Download functionality for generated summaries
- Loading states and error messaging

## Development Notes

- The app uses ES modules and importmaps for dependency resolution
- TypeScript is configured with strict mode and React JSX support
- Path alias `@/*` resolves to the project root
- The application is designed to work without a backend server