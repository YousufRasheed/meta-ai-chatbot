# Facebook Messenger AI Chatbot

A Next.js-based Facebook Messenger chatbot that uses AI to process text and images, maintain conversation context, and provide intelligent responses. The bot can understand images and incorporate them into the conversation flow.

## Features

- 🤖 AI-powered conversations using Groq's LLM models
- 🖼️ Image understanding and analysis
- 💬 Maintains conversation history for contextual responses
- ⚡ Fast response times with asynchronous processing
- 🔄 Handles Facebook's split message delivery
- 📝 Persistent storage of conversations using PostgreSQL
- ✨ Type-safe implementation using TypeScript

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Facebook Developer Account
- Groq API account

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"

# AI SERVICES
GROQ_API_KEY=

# FACEBOOK
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_VERIFICATION_TOKEN=
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd facebook-messenger-ai-bot
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
```

## Facebook Setup

1. Create a Facebook App in the [Facebook Developers Console](https://developers.facebook.com/)
2. Set up Messenger in your Facebook App:

   - Configure webhooks
   - Generate a Page Access Token
   - Set up necessary permissions
3. Configure Webhook URL:

   - URL: `https://your-domain.com/api/webhook`
   - Verify Token: Use the same token as in your FACEBOOK_VERIFICATION_TOKEN
   - Subscribe to: messages, messaging_postbacks

## Key Directories and Files

- `/app`: Contains the Next.js application and API routes
- `/lib`: Core functionality split into logical modules:
  - `ai-common.ts`: Shared AI-related utilities
  - `analyze-images.ts`: Image processing and analysis
  - `generate-message-response.ts`: AI response generation
  - `process-message.ts`: Main message handling logic
- `/types`: TypeScript type definitions for the project
- `/prisma`: Database configuration and schema

## TODO

* [ ] Admin Dashboard
  * [ ] View / Reply to messages
  * [ ] Prompt Settings
* [ ] Multi-Platform Support (WhatsApp & Instagram)
