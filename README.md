# personal_trainer_frontend_iuliia_guseva
Front-end application for managing customers and trainings as a Front-End Programming course final project.

## Features

- Customer and training list pages with sortable columns and search.
- Customer creation, editing, and deletion. Deleting a customer also deletes their training sessions.
- Training creation for a selected customer and training deletion with confirmation.
- Calendar views for scheduled trainings.
- Statistics for a selected date range, including customer and training totals, total duration, training minutes by activity, and trainings per week.
- Navigation between the customer, training, calendar, and statistics pages.
- Customer names displayed in the training list.
- Loading and API error states.

## Technologies

- React
- TypeScript
- Vite
- Recharts
- Personal Trainer REST API

## Development

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Create a production build or run the linter:

```sh
npm run build
npm run lint
```

## API

The application loads customer and training data from the [Personal Trainer REST API](https://juhahinkula.github.io/personaltrainerdocs/).
