# Flowchat Gemini

This project is a full-stack application that allows users to chat with their data. It uses a React frontend, a Node.js/Express backend, and a PostgreSQL database.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker

### 1. Clone the repository

```bash
git clone <repository-url>
cd flowchat-gemini
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the `apps/api` directory and add the following environment variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/flowchat?schema=public"
VANNA_API_BASE_URL="http://localhost:8084"
```

### 4. Start the database

You can start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

### 5. Run database migrations and seed the database

```bash
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

### 6. Start the services

You can start all the services (frontend, backend, and vanna) with the following command:

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`, the backend at `http://localhost:8080`, and the vanna service at `http://localhost:8084`.

## Available Scripts

### `apps/api`

- `pnpm dev`: Starts the backend development server.
- `pnpm db:generate`: Generates the Prisma client.
- `pnpm db:migrate`: Runs database migrations.
- `pnpm db:seed`: Seeds the database.
- `pnpm build`: Builds the backend for production.

### `apps/web`

- `pnpm dev`: Starts the frontend development server.
- `pnpm build`: Builds the frontend for production.
- `pnpm start`: Starts the frontend in production mode.

### `services/vanna`



- `pnpm dev`: Starts the vanna service.



## Database Schema



A simplified overview of the database schema:



- **Vendor**: Stores vendor information (name, address, etc.).

- **Customer**: Stores customer information (name, address, etc.).

- **Invoice**: The central model, linking to a `Vendor` and `Customer`. It contains details like `invoiceNumber`, `invoiceDate`, and `invoiceTotal`.

- **Payment**: A one-to-one relationship with `Invoice`, storing payment-related details like `dueDate` and `paymentTerms`.

- **LineItem**: Represents a single item on an `Invoice`. Each `LineItem` belongs to one `Invoice`.

- **Category**: Stores the categories for `LineItem`s (e.g., "Sachkonto").

- **ChatHistory**: Stores the history of questions and generated SQL queries from the "Chat with Data" feature.



## API Documentation



### GET /cash-outflow



Returns a list of cash outflow data points.



**Example Response:**

```json

[

  {

    "date": "2023-10-26",

    "amount": 110.00

  },

  {

    "date": "2023-11-15",

    "amount": 250.50

  }

]

```



## Chat with Data Workflow



The "Chat with Data" feature enables users to ask questions in natural language and receive answers derived directly from the database. Here is a step-by-step explanation of the workflow:



1.  **Frontend (User Interface)**

    *   **File:** `apps/web/app/chat/page.tsx`

    *   The user types a question (e.g., "What was our total spend last month?") into the chat input field and submits it.

    *   The frontend application sends this question as a POST request to the backend API.



2.  **Backend API Endpoint**

    *   **File:** `apps/api/router/chat-with-data.ts`

    *   The API server receives the request at the `/api/chat-with-data` endpoint.

    *   It takes the user's question from the request body.



3.  **Vanna AI Service**

    *   **File:** `services/vanna/main.py`

    *   The API acts as a proxy, forwarding the user's question to the Vanna AI service. Vanna is an open-source Python framework that specializes in converting natural language questions into SQL queries.

    *   Vanna analyzes the question and, based on its training on the database schema, generates an appropriate SQL query.



4.  **SQL Execution**

    *   The generated SQL query is then executed directly on the project's database (a PostgreSQL database in this case).

    *   For example, the question "What was our total spend?" might become the SQL query `SELECT SUM("invoiceTotal") FROM "Invoice";`.



5.  **Streaming Results to Frontend**

    *   The results from the database, along with the generated SQL and other intermediate data, are not sent in a single response. Instead, they are streamed back to the client in real-time as `x-ndjson` (newline-delimited JSON).

    *   This allows the frontend to display the generated SQL query to the user first, followed by the final data result as soon as it's available, creating a more interactive and responsive experience.



This entire process allows a non-technical user to query the database using plain English, with Vanna acting as the translator between human language and SQL.





### GET /category-spend



Returns a list of spending by category.



**Example Response:**

```json

[

  {

    "category": "Software",

    "spend": 5000.00

  },

  {

    "category": "Hardware",

    "spend": 12000.00

  }

]

```



### POST /chat-with-data



Streams a response from the Vanna AI service.



**Request Body:**

```json

{

  "query": "What is the total spend?"

}

```



**Example Response (streamed):**

```json

{"type": "sql", "data": "SELECT SUM(\"invoiceTotal\") FROM \"Invoice\";"}

{"type": "result", "data": [{"_sum": {"invoiceTotal": 12345.67}}]}

```



### POST /export/csv



Exports data to a CSV file.



**Request Body:**

```json

{

  "sql": "SELECT * FROM \"Invoice\";"

}

```



### POST /export/excel



Exports data to an Excel file.



**Request Body:**

```json

{

  "sql": "SELECT * FROM \"Invoice\";"

}

```



### GET /history



Returns a list of chat history.



**Example Response:**

```json

[

  {

    "id": "cly...",

    "question": "What is the total spend?",

    "sql": "SELECT SUM(\"invoiceTotal\") FROM \"Invoice\";",

    "createdAt": "2024-07-16T12:00:00.000Z"

  }

]

```



### GET /invoice-trends



Returns a list of invoice trends.



**Example Response:**

```json

[

  {

    "date": "2023-10-01T00:00:00.000Z",

    "totalSpend": 15000.00,

    "invoiceCount": 25

  }

]

```



### GET /invoices



Returns a list of invoices.



**Example Response:**

```json

[

  {

    "id": "clx...",

    "documentId": "doc123",

    "status": "Paid",

    "invoiceNumber": "INV-001",

    "invoiceDate": "2023-10-01T00:00:00.000Z",

    "invoiceTotal": 500.00,

    "vendor": {

      "id": "v1",

      "name": "Vendor A"

    }

  }

]

```



### GET /stats



Returns a list of statistics.



**Example Response:**

```json

{

  "totalSpend": 123456.78,

  "totalInvoices": 1234,

  "documentsUploaded": 1234,

  "averageInvoiceValue": 100.05

}

```



### GET /vendors/top10



Returns a list of the top 10 vendors by spending.



**Example Response:**

```json

[

  {

    "name": "Vendor A",

    "totalSpend": 25000.00

  },

  {

    "name": "Vendor B",

    "totalSpend": 18000.00

  }

]

```


