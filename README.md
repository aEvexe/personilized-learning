# Zehn AI Frontend - Personalized Learning Platform

A beautiful, Duolingo-inspired frontend for the Zehn AI personalized learning platform with a light purple theme and bear mascot 🐻.

## Features

- **Light Purple Theme**: Beautiful purple gradient design inspired by Duolingo
- **Bear Mascot**: Friendly bear mascot instead of traditional owl
- **Complete Learning System**:
  - User authentication (OTP-based)
  - Personalized onboarding
  - Dynamic curriculum generation
  - Interactive flashcards
  - Story-based learning
  - Comprehensive testing system
- **Question Types**:
  - Multiple choice
  - True/false
  - Fill in the blank
  - Multiple select
- **Progress Tracking**: Track completion across units, lessons, and sections
- **Debug Console**: Built-in debugging tools for development

## Setup

### Prerequisites

- Zehn AI Backend running on `http://localhost:5505`
- Modern web browser

### Installation

1. Clone or navigate to the frontend directory:
   ```bash
   cd /Users/jaloliddinbeknazarov/projects/micro/zehn-ai-frontend
   ```

2. Start a local web server. You can use any of these methods:

   **Using Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Using Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```

   **Using Live Server (VS Code extension):**
   - Right-click on `index.html`
   - Select "Open with Live Server"

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Backend Configuration

The frontend expects the backend API to be running at `http://localhost:5505`. Make sure your backend `.env` file includes the frontend port in ALLOWED_ORIGINS:

```env
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:5000,http://localhost:8000,http://127.0.0.1:8000
```

## Usage

1. **Login**: Enter your email to receive an OTP code
2. **Verify OTP**: Enter the code sent to your email
3. **Onboarding**: Answer questions to personalize your learning
4. **Learn**: Complete flashcards, stories, and tests
5. **Progress**: Track your progress through the curriculum

## Design System

### Color Palette

- **Primary Purple**: `#ce82ff` (Light purple for main actions)
- **Primary Hover**: `#b865e6` (Darker purple for hover states)
- **Success Green**: `#58cc02` (Duolingo-style success color)
- **Background Dark**: `#1a1a2e` (Dark background gradient)
- **Card Background**: `#2a2a40` (Card containers)

### Typography

- **Font**: System fonts (San Francisco, Segoe UI, etc.)
- **Headings**: Bold, large size
- **Body**: Regular weight, readable size

### Components

- **Cards**: Rounded corners, purple borders, hover effects
- **Buttons**: Gradient backgrounds, smooth transitions
- **Progress Bars**: Purple gradient fill
- **Flashcards**: 3D flip animation with purple gradient

## Debug Mode

Press the "Show Debug" button in the header to enable the debug console. This shows:
- API requests and responses
- User actions
- Error messages
- State changes

## File Structure

```
zehn-ai-frontend/
├── index.html          # Main application file (contains HTML, CSS, and JavaScript)
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## API Endpoints Used

- `POST /v1/auth/send-otp` - Send OTP code
- `POST /v1/auth/verify-otp` - Verify OTP code
- `GET /v1/personalized-learning/course/onboarding/questions` - Get onboarding questions
- `POST /v1/personalized-learning/course/curriculum/create` - Create curriculum
- `GET /v1/personalized-learning/course/curriculum` - Get user curriculum
- `GET /v1/personalized-learning/course/unit/:unitId` - Get unit details
- `GET /v1/personalized-learning/course/lesson/:lessonId/flashcard` - Get flashcard
- `GET /v1/personalized-learning/course/lesson/:lessonId/story` - Get story
- `GET /v1/personalized-learning/course/lesson/:lessonId/test` - Get test
- `POST /v1/personalized-learning/course/lesson/:lessonId/{section}/complete` - Mark section complete

## Contributing

This is an internal project. For issues or feature requests, contact the development team.

## License

Proprietary - Zehn AI
