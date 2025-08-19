# InvestRight

A modern investment platform built with React, TypeScript, and Tailwind CSS.

## Features

- **Multi-language Support**: English, Hindi, and Marathi
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Contact Form**: Simple form submission for user inquiries
- **AI Chatbot**: Interactive chatbot powered by Google Gemini AI for investment guidance
- **Modern UI**: Clean, professional design with smooth animations

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Router for navigation
- Google Gemini AI API integration

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Google Gemini API (see [GEMINI_SETUP.md](./GEMINI_SETUP.md))
4. Start development server: `npm run dev`
5. Open [http://localhost:5173](http://localhost:5173)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── data/          # Translation data
├── services/      # API services (Chatbot Gemini)
├── types/         # TypeScript type definitions
└── App.tsx        # Main application component
```

## Environment Variables

Create a `.env` file in the root directory:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
