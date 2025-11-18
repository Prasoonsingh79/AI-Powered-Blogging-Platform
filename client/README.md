# Modern Blog Application

A full-stack blog application built with React, Node.js, Express, and MongoDB. This application features user authentication, rich text editing, and responsive design.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete blog posts
- Rich text editor with markdown support
- Image uploads for post covers
- Responsive design that works on all devices
- Protected routes for authenticated users
- Category and tag system for posts
- User dashboard to manage posts
- Premium content feature

## Tech Stack

- **Frontend:** React 18, Material-UI, React Router, React Query, Draft.js
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Material-UI with custom theme
- **Form Handling:** Formik with Yup validation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Getting Started

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd ../client/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory with the following variable:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

## Project Structure

```
client/
  src/
    components/     # Reusable UI components
    contexts/       # React context providers
    hooks/          # Custom React hooks
    pages/          # Page components
    services/       # API service functions
    utils/          # Utility functions
    App.jsx         # Main application component
    main.jsx        # Application entry point
    index.css       # Global styles

server/
  src/
    config/         # Configuration files
    controllers/    # Route controllers
    middleware/     # Express middleware
    models/         # Mongoose models
    routes/         # API routes
    utils/          # Utility functions
    server.js       # Express server entry point
```

## Environment Variables

### Frontend

- `VITE_API_URL`: The base URL for API requests

### Backend

- `PORT`: The port the server will run on
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRE`: JWT expiration time

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Material-UI](https://mui.com/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

## Support

For support, email sprasoo876@gmail.com or open an issue in the repository.
