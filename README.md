# Massed User Database Connections

This document details which parts of the Massed User application are connected to a database and which are not.

## Connected to Database

- **User Authentication and Profile Data**: User login, profile information (name, username, avatar) is fetched from the backend API at `https://massed-web.vercel.app/api/get-me`. User data is stored in localStorage for caching, but the source of truth is the database.

## Not Connected to Database

- **Event Creation and Management**: Events are created and managed locally in the browser. The `events` array is stored in memory or localStorage. No API calls to save or load events from database.

- **Ticket Generation and Validation**: Tickets are generated locally using a formula based on event ID, tier, and index. Ticket validation in the scanner checks against locally created events and tickets. No database storage for tickets.

- **Payment Processing**: Payment simulation is done locally. Functions like `payCreator`, `completeCheckout` simulate payments but do not interact with a real payment gateway or database. References to Stripe are for display purposes.

- **Analytics and Dashboard Data**: Numbers shown in the dashboard (profile views, revenue, etc.) appear to be hardcoded or locally generated. No API calls to fetch real analytics data.

- **Products and Store**: Product creation and management is handled locally. No API calls to save products to database.

- **Other Features**: Forms, polls, listings, reviews, messages, etc., are all handled client-side without database persistence.

## Architecture Notes

- The application is primarily a client-side SPA (Single Page Application) with minimal backend integration.

- User authentication is the main server-side component.

- Data persistence is limited to localStorage for user session and possibly some cached data.

- For production use, features like events, tickets, products, and analytics would need backend database integration.