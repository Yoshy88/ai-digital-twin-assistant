# AI Digital Twin Assistant

This is a production-ready, minimal web application that allows recruiters to chat with an AI "Digital Twin" of a candidate.

## 🚀 Features

- **AI Chat Interface**: Real-time chat with a recruiter-friendly AI persona.
- **Digital Twin Behavior**: Responds in the first person based on a hardcoded profile.
- **Premium Design**: Built with Next.js, TailwindCSS, and Lucide icons for a professional look.
- **Fast & Responsive**: Mobile-ready and optimized for speed.

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS
- **AI**: OpenAI API (GPT-4o-mini)
- **Icons**: Lucide React

## 📦 Getting Started

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env.local` file in the root directory and add your OpenAI API Key:
```
OPENAI_API_KEY=your_actual_key_here
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `/app`: Contains the main page and API routes.
- `/components`: Reusable UI components (ChatBox, MessageBubble).
- `/lib`: Utility functions and API clients (OpenAI).
- `/data`: Hardcoded candidate profile data (`profile.ts`).

## 📄 Customization

To change the candidate information, simply update the object in `data/profile.ts`. The AI will automatically adjust its responses based on the new data.

## 🚢 Deployment

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add `OPENAI_API_KEY` to the project's Environment Variables in Vercel settings.
4. Deploy!
