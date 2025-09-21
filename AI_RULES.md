# AI Development Rules for RDO Mobile App

This document provides guidelines for the AI developer to follow when working on this project. Adhering to these rules ensures consistency, maintainability, and adherence to the chosen architectural patterns.

## 1. Core Tech Stack

The application is built on a modern, type-safe, and efficient technology stack.

-   **Framework**: React 18 with TypeScript, built using Vite for a fast development experience.
-   **Styling**: Tailwind CSS is used exclusively for styling, following a utility-first methodology.
-   **Routing**: React Router (`react-router-dom`) manages all client-side navigation and routes.
-   **State Management**: Zustand is used for simple, global client-side state.
-   **Data Fetching & Caching**: TanStack Query (React Query) handles all server state, including data fetching, caching, and synchronization with the backend.
-   **Forms**: React Hook Form provides performance-optimized form logic, coupled with Zod for robust schema definition and validation.
-   **UI Components**: Components are built using Radix UI primitives as a foundation, ensuring accessibility and unstyled flexibility.
-   **Animations**: Framer Motion is the designated library for all UI animations, transitions, and micro-interactions.
-   **Backend (BaaS)**: Supabase serves as the backend, providing the database (PostgreSQL), authentication, and file storage.
-   **Icons**: The `lucide-react` library is the primary source for all icons to maintain a consistent visual style.

## 2. Library Usage Rules

To maintain consistency, follow these specific rules for using libraries and structuring code.

### Styling & UI

-   **Styling**: **ALWAYS** use Tailwind CSS for styling. Do not write custom `.css` files, use CSS Modules, or introduce CSS-in-JS libraries (like Emotion or Styled Components).
-   **Class Merging**: Use the `cn` utility function from `src/lib/utils.ts` to combine and merge Tailwind classes conditionally.
-   **Components**: Build all new UI components from scratch using Radix UI primitives as a base. Do **NOT** install or use other component libraries like Material UI, Ant Design, or Chakra UI.
-   **Animations**: **ALWAYS** use `framer-motion` for any UI animations.

### State Management

-   **Server State**: **ALWAYS** use TanStack Query (`useQuery`, `useMutation`) for any data that is fetched or mutated from the Supabase backend. Do not store server data in Zustand or `useState`.
-   **Global Client State**: Use Zustand (`src/stores/`) for small, global client-side state that needs to be shared across many components (e.g., theme, mobile menu state).
-   **Local Component State**: Use React's built-in `useState` and `useReducer` hooks for state that is confined to a single component or its immediate children.

### Forms

-   **Form Logic**: **ALWAYS** use `react-hook-form` for all forms.
-   **Validation**: **ALWAYS** use `zod` to define validation schemas for your forms.

### Backend & Data

-   **Backend Interaction**: All communication with the backend (database queries, authentication, file uploads) **MUST** be done through the Supabase client.
-   **Routing**: All routes are defined in `src/App.tsx` using `react-router-dom`. Use the `<Link>` component for internal navigation.

### Code Structure & Conventions

-   **File Paths**:
    -   Pages (routable components): `src/pages/`
    -   Reusable UI components: `src/components/`
    -   Custom hooks: `src/hooks/`
    -   Zustand stores: `src/stores/`
    -   General utilities: `src/lib/utils.ts`
-   **Icons**: Use icons exclusively from `lucide-react`.
-   **Types**: Define TypeScript types and interfaces close to where they are used, or in a dedicated `src/types/` directory for shared types.