# Library Management System API Project Design & Onboarding Document

Version: 1.0
Date: 19/June/2025
Author: Rajesh Suryaprakash
## Table of Contents

- [📖 Section 1: Introduction](#section-1-introduction)
 - [1.1. Purpose](#11-purpose)
 - [1.2. Project Overview](#12-project-overview)
 - [1.3. Key Features & Benefits](#13-key-features--benefits)
- [🏗️ Section 2: System Architecture](#section-2-system-architecture)
 - [2.1. Technology Stack](#21-technology-stack)
 - [2.2. Project Structure](#22-project-structure)
- [🚀 Section 3: Installation and Setup](#section-3-installation-and-setup)
 - [3.1. Option 1: 🐳 Running via Docker Hub (Recommended for Testers)](#31-option-1--running-via-docker-hub-recommended-for-testers)
 - [3.2. Option 2: 💻 Running from Source Code (Recommended for Developers)](#32-option-2--running-from-source-code-recommended-for-developers)
- [💡 Section 4: API Usage and Reference](#section-4-api-usage-and-reference)
 - [4.1. Accessing the API Documentation](#41-accessing-the-api-documentation)
 - [4.2. Authentication Flow](#42-authentication-flow)
 - [4.3. Default User Accounts](#43-default-user-accounts)
- [🛠️ Section 5: Available Scripts](#section-5-available-scripts)
- [❤️ Section 6: Contributing](#section-6-contributing)
- [📄 Section 7: License](#section-7-license)
- [✉️ Section 8: Contact](#section-8-contact)
- [📜 Section 9: Document Control](#section-9-document-control)

## 📖 Section 1: Introduction
### 1.1. Purpose

This document provides a comprehensive technical overview of the Library Management System API. Its primary purpose is to serve as a central reference for developers, API automation testers, and project stakeholders. It details the project's architecture, features, setup procedures, and usage guidelines.

The project itself was created to be a robust, realistic, and feature-rich backend application, ideal for the purpose of developing and demonstrating a professional API test automation framework.

### 1.2. Project Overview

The Library Management System API is a RESTful API built with Node.js and Express.js. It provides a full suite of endpoints to manage the core operations of a library, including inventory management (books, authors), user and member management, and the loan lifecycle (borrowing and returning books).

The system is designed with modern best practices, featuring a modular architecture, comprehensive security measures, and a full DevOps pipeline including containerization and continuous integration.

### 1.3. Key Features & Benefits

This application serves as an excellent platform due to its implementation of numerous industry-standard features:

*   **RESTful API Design:** Clean, predictable, and resource-oriented endpoints.
*   **Rich Data Models:** Manage Books, Authors, Users, Members, and Loans with proper relationships.
*   **Role-Based Access Control (RBAC):** Differentiated permissions for three user roles: MEMBER, LIBRARIAN, and ADMIN.
*   **Secure JWT Authentication:** User authentication handled via secure JSON Web Tokens.
*   **Advanced Data Querying:** Endpoints support pagination, sorting, and multi-field filtering.
*   **Realistic Database Seeding:** A powerful seeder populates the database with 100+ authors and 500+ books.
*   **Production-Ready Security:** Implements rate limiting, security headers (Helmet), and CORS.
*   **Comprehensive Logging:** Structured, multi-transport logging with Winston and Morgan for excellent observability.
*   **Containerized Environment:** Fully containerized with a multi-stage, security-hardened Dockerfile for portability.
*   **CI Pipeline:** A GitHub Actions workflow for continuous integration, automatically running linting and build checks.

## 🏗️ Section 2: System Architecture
### 2.1. Technology Stack

The project is built with a modern, robust, and scalable technology stack.

| Category     | Technologies                                      |
|--------------|---------------------------------------------------|
| Backend      | Node.js (v18.16.1+), Express.js                   |
| Database     | SQLite, Sequelize (ORM)                           |
| DevOps       | Docker, GitHub Actions (CI)                       |
| Tooling      | ESLint, Faker.js                                  |
| API & Docs   | Swagger / OpenAPI                                 |

### 2.2. Project Structure

The project follows a standard, modular structure for scalability and maintainability.

- ├── **src/**
- │ ├── **config/** # App configuration (database, logger, swagger)
- │ ├── **controllers/** # Request/response logic for each route
- │ ├── **db/** # Database seeding scripts and data
- │ ├── **index.js** # Main entry point: Express app, server startup, DB connection
- │ ├── **middleware/** # Custom Express middleware (auth, RBAC, errors)
- │ ├── **models/** # Sequelize data models and associations
- │ ├── **routes/** # API route definitions and endpoint documentation
- │ └── **utils/** # Reusable helper functions (query parser)
- ├── **.github/workflows/** # CI/CD pipeline definitions (GitHub Actions)
- ├── **Dockerfile** # Instructions for building the production Docker image
- ├── **entrypoint.sh** # Script to seed DB and start the app in Docker
- ├── **package.json** # Project metadata and dependencies
- └── **package-lock.json** # Exact dependency versions

## 💻 Section 3: 🚀 Installation and Setup
## 🚀 Section 3: Installation and Setup
There are two primary methods for running the application.

### 3.1. Option 1: 🐳 Running via Docker Hub (Recommended for Testers)

This is the easiest and fastest method to get the API running. It does not require Node.js or cloning the source code.

**Prerequisites:**

- Docker Desktop installed and running.

**Step 1: Pull the pre-built Docker Image**

Open your terminal and pull the latest image from Docker Hub.

```bash
docker pull [your-dockerhub-username]/library-api:latest
```

**Step 2: Run the Docker container**

This command starts the container, which will automatically seed its internal database and launch the application.

```bash
docker run --rm -p 3000:3000 [your-dockerhub-username]/library-api:latest
```

✅ Setup Complete!
The API is now running and available:

- API Base URL: http://localhost:3000
- Interactive API Documentation: http://localhost:3000/api-docs

### 3.2. Option 2: 💻 Running from Source Code (Recommended for Developers)

This method is for developers who want to modify or contribute to the source code.

**Prerequisites:**

- Git
- Node.js (v18.16.1 or newer)
- npm (comes with Node.js)

**Step 1: Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

```bash
cd YOUR_REPO
```

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Create the environment file**

Create a `.env` file in the root of the project and paste the following content into it.

```
dotenv
# Application Configuration
PORT=3000

# Security Configuration
JWT_SECRET=this-is-a-super-secret-key-for-jwt-and-should-be-long

# Environment Setting
NODE_ENV=development
```

**Step 4: Seed the database**

This one-time command creates and populates the database with a rich dataset.

```bash
npm run seed
```

**Step 5: Start the server**

This starts the server with nodemon for automatic restarts on file changes.

```bash
npm run dev
```

✅ Setup Complete!
The API is now running and available at http://localhost:3000.
## 💡 Section 4: 💡 API Usage and Reference

### 4.1. Accessing the API Documentation

The best way to explore and interact with the API is through the live Swagger documentation. Once the server is running, navigate to the following URL in your web browser:

http://localhost:3000/api-docs

### 4.2. Authentication Flow

Most endpoints are protected. To access them, follow these steps:

1.  **Login:** Send a POST request to `/api/v1/auth/login` with your email and password.
2.  **Get Token:** Copy the token string from the JSON response body.
3.  **Authorize Requests:** For all subsequent requests, include the Authorization header: `Bearer [your_jwt_token]`

### 4.3. Default User Accounts

The database seeder creates the following user accounts:

Password for all users: `Password123!`

| Role      | Email               | Description                    |
|-----------|---------------------|--------------------------------|
| ADMIN     | admin@library.com   | Full permissions across the entire system. |
| LIBRARIAN | librarian@library.com | Can manage books, authors, and all members. |
| MEMBER    | member@library.com  | Can browse books and manage their own loans.|

## 🛠️ Section 5: Available Scripts

The `package.json` file includes several useful scripts to streamline development when running from source:

- `npm run dev`: Starts the local development server with nodemon for live-reloading.
- `npm run start`: Starts the application in production mode.
- `npm run seed`: Wipes and repopulates the database with a large, realistic dataset.
- `npm run lint`: Runs ESLint to check the code for style and syntax errors.

## ❤️ Section 6: Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please feel free to fork the repository and create a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## Section 7: 📄 License
## 📄 Section 7: License

This project is distributed under the MIT License. See the `LICENSE` file in the repository for more information.

## Section 8: ✉️ Contact

[Rajesh Suryaprakash]

*   Email: rajesh.learning1994@gmail.com
*   Project Link: https://github.com/YOUR_USERNAME/YOUR_REPO

## 📜 Section 9: Document Control

| Version | Date        | Author             | Change Description      |
|---------|-------------|--------------------|-------------------------|
| 1.0     | 19/June/2025| Rajesh Suryaprakash| Initial document creation.|
