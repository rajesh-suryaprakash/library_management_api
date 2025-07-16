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
  - [⚙️ 4.4 Key Business Logic and Application Rules](#44-️-key-business-logic-and-application-rules)
    - [👤 4.4.1 User Roles & Permissions (RBAC)](#441--user-roles--permissions-rbac)
    - [📝 4.4.2 Registration Workflows](#442--registration-workflows)
    - [🔐 4.4.3 Authentication & Security](#443--authentication--security)
    - [📖 4.4.4 Loan Management Rules](#444--loan-management-rules)
    - [💰 4.4.5 Fine Calculation System](#445--fine-calculation-system)
    - [🔍 4.4.6 Advanced API Querying](#446--advanced-api-querying)
    - [4.4.7 Endpoints & Role-Based Access Control (RBAC)](#447-endpoints--role-based-access-control-rbac)
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
docker pull theeagle94/library-api:latest
```

**Step 2: Run the Docker container**

This command starts the container, which will automatically seed its internal database and launch the application.

```bash
docker run --rm -p 3000:3000 -e PORT=3000 -e NODE_ENV=development -e JWT_SECRET="this-is-a-super-secret-key-for-jwt-and-should-be-long" -e JWT_EXPIRES_IN="30m" -e RATE_LIMIT_WINDOW_MINUTES=15 -e RATE_LIMIT_GENERAL_MAX=300 -e RATE_LIMIT_AUTH_MAX=30 library-api
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
git clone https://github.com/rajesh-suryaprakash/library_management_api.git
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
# Application Configuration
PORT=3000

# Security Configuration
JWT_SECRET=this-is-a-super-secret-key-for-jwt-and-should-be-long
JWT_EXPIRES_IN=30m # Other valid formats include "2h" for 2 hours, "7d" for 7 days, or just seconds as a number.

# Environment Setting
NODE_ENV=development

# Rate Limiting Configuration
# The time window for rate limiting in minutes.
RATE_LIMIT_WINDOW_MINUTES=15
# Max requests per window for general API endpoints.
RATE_LIMIT_GENERAL_MAX=300
# Max requests per window for sensitive authentication endpoints.
RATE_LIMIT_AUTH_MAX=30
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
| MEMBER    | member1@library.com  | Can browse books and manage their own loans.|
| VERIFIED Student    | verified_student1@library.com  | Can browse books and manage their own loans.|
| UNVERIFIED Student    | unverified_student1@library.com  | Can browse books and manage their own loans.|

### 4.4 ⚙️ Key Business Logic and Application Rules

This API goes beyond simple CRUD operations and implements a series of robust business rules to simulate a real-world application environment. Understanding these rules is key to effectively testing the API's functionality.

#### 4.4.1 👤 User Roles & Permissions (RBAC)

The API enforces a strict Role-Based Access Control (RBAC) system. A user's role, included in their JWT, determines what actions they are permitted to perform.

*   **`ADMIN`**
    *   **Description:** Possesses the highest level of access with full system privileges.
    *   **Permissions:** Inherits all permissions of a `LIBRARIAN`.
    *   **Unique Capabilities:**
        *   Can change the role of any user (e.g., promote a `MEMBER` to a `LIBRARIAN`) using the `PUT /api/v1/users/{userId}/role` endpoint.

*   **`LIBRARIAN`**
    *   **Description:** The primary operational role for managing the library's day-to-day activities.
    *   **Permissions:** Inherits all permissions of a `STUDENT` and `MEMBER`.
    *   **Unique Capabilities:**
        *   **Inventory Management:** Has full CRUD (Create, Read, Update, Delete) access to all `Books` and `Authors`.
        *   **Member & Loan Oversight:** Can view the complete loan history for any specific member using `GET /api/v1/members/{memberId}/loans`.
        *   **Student Verification:** Can approve a member's student status via `PATCH /api/v1/members/{memberId}/verify-student-status`. This action elevates the member's borrowing limit and grants them fine exemptions.

*   **`STUDENT`**
    *   **Description:** A specialized member role with enhanced borrowing privileges, which are only active after being verified by a Librarian or Admin.
    *   **Permissions:** Inherits all permissions of a `MEMBER`.
    *   **Unique Business Logic:**
        *   **Increased Loan Limit:** A **verified** student can borrow a maximum of **10 books** simultaneously. An unverified student has the standard limit of 5.
        *   **Late Fee Exemption:** A **verified** student is exempt from all late fees when returning a book.
    *   **Registration:** A user is assigned this role by registering via the `POST /api/v1/auth/register/student` endpoint.

*   **`MEMBER`**
    *   **Description:** The baseline role for all standard library patrons, focused on self-service actions.
    *   **Permissions & Business Logic:**
        *   **Loan Limit:** Can borrow a maximum of **5 books** simultaneously.
        *   **Late Fees:** Is subject to the tiered late fee system upon returning a book past its due date.
        *   **Account Management:** Can manage their own user profile and password.
        *   **Catalogue Browsing:** Can get the full list of available `Books`.
        *   **Borrowing & Returning:** Can borrow and return books, which creates and updates their own `Loan` records.
        *   **Personal History:** Can **only** view their own loan history via the `GET /api/v1/loans/my_loan_history` endpoint.
        *   **Upgrade Path:** Can request to become a student at any time via `PATCH /api/v1/members/me/request-student-status`, which flags their account for verification.

#### 4.4.2 📝 Registration Workflows

The API provides two distinct registration endpoints to handle different user types, each with its own set of required data.

*   **Standard Member Registration (`POST /api/v1/auth/register/member`)**
    *   Assigns the `MEMBER` role.
    *   Requires `username`, `email` (for login), `password`, `contactEmail`, and `mobileNumber`.

*   **Student Member Registration (`POST /api/v1/auth/register/student`)**
    *   Assigns the `STUDENT` role.
    *   Requires all standard member fields.
    *   **Additionally requires:** `institutionType` (`SCHOOL` or `COLLEGE`), `studentIdCardNumber`, and `institutionAddress`.
    *   Upon successful registration, the member is created with `isStudent: true` but `isVerified: false`, pending approval.

#### 4.4.3 🔐 Authentication & Security

*   **Password Strength:** User passwords must be a minimum of **8 characters** long upon registration or reset.
*   **Data Validation:** All incoming data is validated. For example, empty titles, invalid ISBNs, or invalid email formats are rejected with a `400 Bad Request`.
*   **Password Reset Flow:** A secure, token-based password reset mechanism is implemented:
    1.  A user requests a reset via `POST /api/v1/auth/forgot-password` with their email.
    2.  A unique, single-use, expiring token is generated. (For this project, it is logged to the console instead of being emailed).
    3.  The user provides this token and a new password to `PATCH /api/v1/auth/reset-password/{token}` to complete the reset.

#### 4.4.4 📖 Loan Management Rules

The core business logic resides in the borrowing and returning of books.

*   **Maximum Loan Limit:**
    *   A standard `MEMBER` or an `Unverified Student` can borrow a maximum of **5 books** simultaneously.
    *   A `Verified Student` can borrow a maximum of **10 books**.
    *   Attempting to borrow a book beyond this limit will result in a `403 Forbidden` error.

*   **Duplicate Loan Prevention:**
    *   A member is not allowed to borrow a second copy of a book title if they already have an active (non-returned) loan for that same book. This will result in a `409 Conflict` error.

#### 4.4.5 💰 Fine Calculation System

Fines are automatically calculated and applied when a book is returned late via `PUT /api/v1/loans/{loanId}/return`.

*   **Student Exemption:** **Verified students are exempt from all late fees.**
*   **Fine Tiers (for non-students):**
    *   **Days 1-10 late:** **Rs. 50** per day.
    *   **Days 11-20 late:** **Rs. 100** per day for this bracket.
    *   **Days 21+ late:** **Rs. 200** per day for this bracket.

**Example Calculation:** A non-student member returning a book 12 days late will incur a fine of:
`(10 days * Rs. 50) + (2 days * Rs. 100) = Rs. 700`

The calculated `fineAmount` is saved to the Loan record, and the API response message will include the fine details.

#### 4.4.6 🔍 Advanced API Querying

All endpoints that return a list of resources (e.g., `/books`, `/authors`, `/loans`) support a powerful and consistent set of querying features.

*   **Advanced Filtering:**
    *   Uses the format `filter[fieldName_operator]=value`.
    *   **Partial Match (contains):** `?filter[title_like]=Dune`
    *   **Exact Match (case-insensitive):** `?filter[genre_eq]=Fantasy`
    *   **Numeric Comparison:** `?filter[publicationYear_gt]=1980`
    *   **Nested Filtering:** You can filter a resource by the attributes of a related resource using dot notation. For example, to find all books by a specific author:
        `?filter[Author.name_like]=Orwell`

*   **Sorting:**
    *   Supports multiple fields, separated by commas.
    *   Use a hyphen (`-`) prefix for descending order.
    *   Example: `?sort=-publicationYear,title`

*   **Pagination:**
    *   Controlled via `page` and `limit` query parameters.
    *   Example: `?page=2&limit=25`

#### 4.4.7 🔑 🛡️ Endpoints & Role-Based Access Control (RBAC)

This table provides a comprehensive overview of all available API endpoints and the permissions required to access them for each role.

| Endpoint                                              | Method | Description                                       | `MEMBER` | `STUDENT` | `LIBRARIAN` | `ADMIN` |
|-------------------------------------------------------|--------|---------------------------------------------------|:--------:|:---------:|:-----------:|:-------:|
| **Authentication & Health**                           |        |                                                   |          |           |             |         |
| `/api/v1/health`                                      | `GET`  | Check the health status of the API.               | ✅ Public | ✅ Public | ✅ Public   | ✅ Public |
| `/api/v1/auth/register/member`                        | `POST` | Register a new standard member account.           | ✅ Public | ✅ Public | ✅ Public   | ✅ Public |
| `/api/v1/auth/register/student`                       | `POST` | Register a new student member account.            | ✅ Public | ✅ Public | ✅ Public   | ✅ Public |
| `/api/v1/auth/login`                                  | `POST` | Log in to receive a JSON Web Token (JWT).         | ✅ Public | ✅ Public | ✅ Public   | ✅ Public |
| `/api/v1/auth/forgot-password`                        | `POST` | Request a password reset token.                   | ✅ Public | ✅ Public | ✅ Public   | ✅ Public |
| `/api/v1/auth/reset-password/{token}`                 | `PATCH`| Reset a password using a valid token.             | ✅ Public | ✅ Public | ✅ Public   | ✅ Public |
| **Users**                                             |        |                                                   |          |           |             |         |
| `/api/v1/users/me`                                    | `GET`  | Get the profile of the currently logged-in user.  | ✅       | ✅        | ✅          | ✅      |
| `/api/v1/users`                                       | `GET`  | List all user accounts in the system.             | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/users/{userId}/role`                         | `PUT`  | Change the role of a specific user.               | ❌       | ❌        | ❌          | ✅      |
| **Authors**                                           |        |                                                   |          |           |             |         |
| `/api/v1/authors`                                     | `GET`  | Get a list of all authors (with filtering).       | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/authors/{id}`                                | `GET`  | Get a single author by their ID.                  | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/authors`                                     | `POST` | Create a new author.                              | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/authors/{id}`                                | `PUT`  | Update an existing author.                        | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/authors/{id}`                                | `DELETE`| Delete an author.                               | ❌       | ❌        | ✅          | ✅      |
| **Books**                                             |        |                                                   |          |           |             |         |
| `/api/v1/books`                                       | `GET`  | Get a list of all books (with filtering).         | ✅       | ✅        | ✅          | ✅      |
| `/api/v1/books/{id}`                                  | `GET`  | Get a single book by its ID.                      | ✅       | ✅        | ✅          | ✅      |
| `/api/v1/books`                                       | `POST` | Create a new book.                                | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/books/{id}`                                  | `PUT`  | Update an existing book.                          | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/books/{id}`                                  | `DELETE`| Delete a book.                                  | ❌       | ❌        | ✅          | ✅      |
| **Loans**                                             |        |                                                   |          |           |             |         |
| `/api/v1/loans`                                       | `POST` | Borrow a book (creates a loan for oneself).       | ✅       | ✅        | ✅          | ✅      |
| `/api/v1/loans/{loanId}/return`                       | `PUT`  | Return a book (for a loan belonging to oneself).  | ✅       | ✅        | ✅          | ✅      |
| `/api/v1/loans/my_loan_history`                       | `GET`  | Get personal loan history for the logged-in user. | ✅       | ✅        | ✅          | ✅      |
| `/api/v1/loans`                                       | `GET`  | Get a list of ALL loans in the system.            | ❌       | ❌        | ✅          | ✅      |
| **Members**                                           |        |                                                   |          |           |             |         |
| `/api/v1/members/me/request-student-status`           | `PATCH`| Request student status for oneself.               | ✅       | ✅        | ✅          | ✅      |
| `/api/v1/members/{memberId}/loans`                    | `GET`  | Get the loan history for a specific member.       | ❌       | ❌        | ✅          | ✅      |
| `/api/v1/members/{memberId}/verify-student-status`    | `PATCH`| Verify a member's student status.                 | ❌       | ❌        | ✅          | ✅      |

**Legend:**
*   **✅ Public:** Endpoint is accessible without authentication.
*   **✅:** Role has permission to access the endpoint.
*   **❌:** Role does not have permission and will receive a `403 Forbidden` error.

## 🛠️ Section 5: Available Scripts

The `package.json` file includes a set of useful scripts to streamline the development and maintenance workflow. Run these commands from the root of the project.

### Development

*   **`npm run dev`**
    Starts the local development server using `nodemon`. The server will automatically restart whenever you save a change to a source file.

*   **`npm run start`**
    Starts the application in a production-like mode using a standard `node` process.

### Data Management

*   **`npm run cleanse`**
    Runs the data cleansing utility (`scripts/cleanseData.js`). This script reads your raw `authors.json` and `books.json` files, removes any records with duplicate names or ISBNs, and saves the output to new `*.cleaned.json` files. **This should be run before seeding the database for the first time or after updating the raw data files.**

*   **`npm run seed`**
    Wipes the entire database and repopulates it using the **cleaned** data files (`authors.cleaned.json` and `books.cleaned.json`). This is perfect for starting with a fresh, predictable dataset.

### Code Quality

*   **`npm run format`**
    Automatically formats all JavaScript files in the `src` directory according to the rules in `.prettierrc.json`.

*   **`npm run lint`**
    Runs ESLint to statically analyze the entire codebase, checking for potential bugs, style violations, and formatting issues.

*   **`npm run lint:fix`**
    Attempts to automatically fix all fixable ESLint and Prettier errors. This is a great command to run before committing your code.

## ❤️ Section 6: Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please feel free to fork the repository and create a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## Section 7: 📄 License

This project is distributed under the MIT License. See the `LICENSE` file in the repository for more information.

## Section 8: ✉️ Contact
*   Email: rajesh.learning1994@gmail.com
*   Project Link: https://github.com/rajesh-suryaprakash/library_management_api.git

## 📜 Section 9: Document Control

| Version | Date        | Author             | Change Description                                                                                               |
|---------|-------------|--------------------|------------------------------------------------------------------------------------------------------------------|
| 1.0     | 19/June/2025| Rajesh Suryaprakash| Initial document creation. Covers core application setup, basic CRUD, JWT authentication, and Dockerization.       |
| 1.1     | 20/June/2025| Rajesh Suryaprakash| **Enhanced Querying & Data:** Implemented advanced querying (pagination, sorting, filtering) and a file-based data seeder. |
| 1.2     | 24/June/2025| Rajesh Suryaprakash| **Added Core Business Logic:** Implemented loan limits, fine calculation system, and student verification status.   |
| 1.3     | 27/June/2025| Rajesh Suryaprakash| **Refactored API Design:** Separated registration endpoints and improved data collection fields (`contactEmail`, `mobileNumber`). |
| 1.4     | 30/June/2025| Rajesh Suryaprakash| **Improved Error Handling:** Integrated a robust, centralized error handling system (`AppError`, `catchAsync`).     |
| 1.5     | 01/July/2025| Rajesh Suryaprakash| **Added Developer Tooling:** Integrated Prettier for code formatting and a standalone data cleansing script.           |
| 1.6     | 12/July/2025| Rajesh Suryaprakash| **Hardening & Finalization:** Fixed numerous bugs related to data validation, filtering logic, and startup stability. Added system health check endpoint and finalized all documentation and RBAC tables. |
