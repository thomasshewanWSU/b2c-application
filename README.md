# B2C E-commerce Application

A full-stack e-commerce platform with customer-facing storefront and admin dashboard.

## Features

-  Customer storefront with product browsing, search, and filtering
-  Shopping cart and checkout system
-  User authentication and account management
-  Admin dashboard for product, order, and user management
-  Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, React, CSS Modules
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM (Using Neon)
- **Authentication**: NextAuth.js
- **Testing**: Playwright for E2E testing
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database

## Installation & Setup

1. Clone the repository:
   git clone https://github.com/thomasshewanWSU/b2c-application.git
   cd b2c-application

2. Install Dependencies
   pnpm install

3. Set up environmental variables

4. Set up database
   pnpm prisma db push
   pnpm prisma:seed
   pnpm prisma generate
