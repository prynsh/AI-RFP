# RFP Automation & Vendor Comparison System

This project is a full-stack application that enables teams to:

- Generate structured RFP emails using AI  
- Send RFPs to vendors  
- Receive vendor replies  
- Parse replies using AI  
- Compare proposals and get a recommendation on the best vendor  

The system uses React, Node.js, Prisma, PostgreSQL, MailGun API ( for emails) , and AI (Google GenAI).

---

# 1. Project Setup

## 1.a Prerequisites

Node.js | >= 18.x 

npm / yarn | Latest

PostgreSQL | >= 14 

Prisma ORM | Latest

SMTP Email Provider

Gmail, SendGrid, SES, etc.

AI Provider API Key

Google GenAI or OpenAI |

Required environment variables:

- DATABASE_URL
- MAILGUN CREDENTIALS
- GEMINI API key

---
## 1.b Clone the repository
```
git clone https://github.com/prynsh/AI-RFP.git
```

## Backend Installation

```bash
cd backend
npm install
```

Migrate Prisma :
```
npx prisma migrate dev --name (whatever name you want to give)
```
Generate prisma client:

```
npx prisma generate
```
Seed the database:
```
npm run seed
```

Start the backend:
```
npm run dev
```
Backend runs at: [http://localhost:3000](http://localhost:3000)

## 1.c Frontend Installation
```
cd frontend
npm install
npm run dev
```

Frontend runs at: [http://localhost:5173/](http://localhost:5173)
# How to configure email sending/receiving.
Inorder to send emails you just need to use the MAILGUN API. Login to their website. Select the domain and then add the recipients who can receive email from the domain, choose the method of how you would like to use the email sending (SMTP / API). Then accordingly setup the application for it. I used API and hence I had to put the API key, domain, from_email. This would do the work and you can send emails then. 
Coming to inbound part it requires you to setup a way to understand the emails you will receiving ( be it matching recipient, match header or custom). Then you can forward them to a route ( which is what I have done), or you can forward them to another email as well.
  
# 2. Tech Stack
## 2.a Frontend

React (TypeScript)

TailwindCSS

Axios

### 2.b Backend

Node.js + Express

TypeScript

Prisma ORM

MailGun Email API

AI API client (Google GenAI)

### 2.c Database

PostgreSQL

Prisma models include:

Rfp

SentRfp

Vendor

Reply

### 2.d AI Provider

Google GenAI

AI is used for:

Generating structured RFP emails

Parsing raw vendor replies

Creating HTML-based comparison tables

Providing vendor recommendations

### 2.e Email Solution

MailGun API for inbound and outbound emails

# 3. API Documentation
## 3.a Generate Structured RFP Email

### POST /structured-response

## Request
```
{
  "userText": "Need a redesign for a 5-page ecommerce website."
}
```
## Response
```
{
  "rfpId": 12,
  "data": {
    "subject": "RFP: Website Redesign",
    "body": "Dear Vendor, ..."
  }
}
```

## 3.b Get Vendors

### GET /vendors

## Response
```
{
  "vendors": [
    { "id": 1, "name": "ABC Solutions", "email": "abc@example.com" }
  ]
}
```
# 3.c Send RFP to Vendors

### POST /send-rfp

## Request
```
{
  "rfpId": 12,
  "email": ["vendor1@example.com", "vendor2@example.com"]
}
```

# 3.d Compare Vendor Proposals

### GET /rfp/:id/comparison
 Example:

### GET /rfp/12/comparison

## Response

Returns AI-generated HTML:
```
{
  "rfpId": 12,
  "comparison": "<h2>Vendor Comparison</h2><table>...</table><h3>Recommendation</h3><p>Choose Vendor ABC...</p>"
}
```

The frontend renders this HTML directly below the "compare" button.

# 4. Decisions and Assumptions
## 4.a Key Design Decisions

Comparison output is HTML so the frontend can render tables easily.

Vendor selection uses checkbox-based UI.

Converting the raw text directly to an email format rather than jsonb format and then converting into email. ( This was my earlier approach - This adds an overhead and therefore did not go ahead with it.)

Vendor comparison happens inside the RFP component to improve UX.

## 4.b Assumptions

AI always returns safe and valid HTML.

Emails sent via vendor can be parsed perfectly

Used RFP structure's type as any ( can be changed to body: string ,subject : string)

A single vendor recommendation is sufficient.

# 5. AI Tools Usage
## 5.a Tools Used

I used CHATGPT to help me during some of the debugging or docs knowledge. Also in writing some code which was trivial.

