# Vector and AI Search API

A powerful RESTful API built with the [Hono](https://hono.dev/) web framework. It leverages Google's Gemini AI and the Pinecone vector database to provide advanced search and chat capabilities.

## ✨ Features

- **RESTful API**: Built with Hono, a small, simple, and ultrafast web framework for the Edge.
- **Hybrid Search**: Supports both semantic search (dense vectors) and lexical search (sparse vectors) powered by [Pinecone](https://www.pinecone.io/).
- **AI-Powered Chat**:
    - **Standard Chat Completion**: Direct access to Google's [Gemini AI](https://ai.google.dev/) for general-purpose conversational AI.
    - **Retrieval-Augmented Generation (RAG)**: Enhances chat completions with relevant context retrieved from the Pinecone vector database for more accurate and informed responses.

## 📋 Prerequisites

Before you begin, ensure you have the following set up:

- [Node.js](https://nodejs.org/) (v18 or later is recommended) and npm.
- A **Google Gemini API Key**. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).
- A **Pinecone API Key** and a configured project. You can get these from the [Pinecone Console](https://app.pinecone.io/). You will also need your Pinecone cloud environment, region, and the names for your dense and sparse-dense indexes.

## ⚙️ Configuration

1.  Create a `.env` file by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  Open the `.env` file and fill in the required values.

    ```dotenv
    NODE_ENV=development
    LOG_LEVEL=debug
    PORT=3000

    # Google Gemini
    GEMINI_API_KEY=your-gemini-api-key
    GEMINI_CHAT_MODEL=gemini-1.5-flash-latest

    # Pinecone
    PINECONE_API_KEY=your-pinecone-api-key
    PINECONE_CLOUD="aws"
    PINECONE_REGION="us-east-1"
    PINECONE_DENSE_INDEX_NAME=your-dense-index-name
    PINECONE_SPARSE_INDEX_NAME=your-sparse-index-name
    ```

## 🚀 Installation

```bash
npm install
```

## ▶️ Running the Application

```bash
npm run dev
```

The API will then be available at `http://localhost:3000`.

## ⛓️ API Endpoints

All endpoints are available under the `/api/v1` path, except for the health check.

### Health Check

-   **GET /health**

    Returns the status of the API.

    ```bash
    curl http://localhost:3000/health
    ```

### Chat

-   **GET /api/v1/chat-completion**

    Provides a standard chat completion using Google's Gemini AI.

    **Query Parameters:**

    -   `q`: The query string for the chat completion.

    **Example:**

    ```bash
    curl "http://localhost:3000/api/v1/chat-completion?q=Hello"
    ```

-   **GET /api/v1/chat-completion-with-rag**

    Enhances chat completions with context from the Pinecone vector database (Retrieval-Augmented Generation).

    **Query Parameters:**

    -   `q`: The query string for the chat completion.

    **Example:**

    ```bash
    curl "http://localhost:3000/api/v1/chat-completion-with-rag?q=What%20is%20the%20capital%20of%20France"
    ```

### Search

-   **GET /api/v1/semantic-search**

    Performs a semantic search using dense vectors in Pinecone.

    **Query Parameters:**

    -   `q`: The query string for the search.

    **Example:**

    ```bash
    curl "http://localhost:3000/api/v1/semantic-search?q=search%20query"
    ```

-   **GET /api/v1/lexical-search**

    Performs a lexical search using sparse vectors in Pinecone.

    **Query Parameters:**

    -   `q`: The query string for the search.

    **Example:**

    ```bash
    curl "http://localhost:3000/api/v1/lexical-search?q=search%20query"
    ```

-   **GET /api/v1/hybrid-search**

    Performs a hybrid search using both dense and sparse vectors in Pinecone.

    **Query Parameters:**

    -   `q`: The query string for the search.

    **Example:**

    ```bash
    curl "http://localhost:3000/api/v1/hybrid-search?q=search%20query"
    ```