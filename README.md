# ExpenseAI — Personal Finance Tracker

**Live demo:** https://expense-tracker-ai-pied-gamma.vercel.app

A modern, full-featured expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dashboard** — Summary cards (total spent, monthly spending, top category, avg per transaction) with bar and donut charts
- **Expense Management** — Add, edit, and delete expenses with inline forms and confirmation prompts
- **Smart Filtering** — Search by description or category, filter by date range, sort by date
- **Visual Analytics** — Last 6 months bar chart + category breakdown pie chart powered by Recharts
- **CSV Export** — One-click export of all expenses to a timestamped CSV file
- **Data Persistence** — localStorage keeps your data between sessions, no backend required
- **Fully Responsive** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Date Utils | date-fns |
| Storage | localStorage |

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx                  # Dashboard page
  DashboardClient.tsx        # Dashboard client component
  expenses/
    page.tsx                 # All expenses page
    ExpensesClient.tsx        # Expenses client component
components/
  Navbar.tsx                 # Sticky navigation with CSV export
  ExpenseForm.tsx            # Add/edit form with validation
  ExpenseList.tsx            # Filterable, searchable expense list
  SummaryCards.tsx           # KPI summary cards
  Charts.tsx                 # Bar + donut spending charts
hooks/
  useExpenses.ts             # localStorage state management
lib/
  types.ts                   # TypeScript types and constants
  storage.ts                 # localStorage read/write helpers
  utils.ts                   # Formatting, filtering, aggregations, CSV export
```

## Expense Categories

Food · Transportation · Entertainment · Shopping · Bills · Other
