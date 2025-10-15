# NexLAB: Next-Generation Experiments and Learning for Advanced Biotech

> 🧪 **Educational Laboratory Management System** - A comprehensive web application for managing laboratory notebooks, designed for the MICR course with real-time collaboration features.

This is an ATE project's web application for managing laboratory notebooks, designed for the MICR course. It features user authentication with Google Sign-In, and allows users to create, edit, and view their design projects in real-time, integrated with Firestore.

## Features

- User authentication with Google Sign-In
- Create, read, update, and delete operations for designs
- Image uploads associated with specific designs
- Real-time updates from Firestore
- Course management and student tracking
- Supplemental materials management
- Chatbot integration for enhanced learning
- Message board for course communications

## Local Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/institute-for-future-intelligence/nexlab.git
   ```
2. Navigate to the project directory:
    ```bash
    cd nexlab
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the development server:
    ```bash
    npm run dev
    ```
5. The app should now be running on [http://localhost:3000](http://localhost:3000).

## Deployment

The application is deployed on GitHub Pages with a custom domain and can be accessed at [https://nexlab.bio/](https://nexlab.bio/).

## Built With

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [Vite](https://vitejs.dev/) - Frontend build tool that significantly improves the frontend development experience.
- [Firestore](https://firebase.google.com/docs/firestore) - Cloud-hosted NoSQL database for storing and syncing data in real-time.
- [Firebase Storage](https://firebase.google.com/docs/storage) - Object storage for storing and serving user-generated content.
- [MUI ](https://mui.com/material-ui/) - A comprehensive library of components that features implementation of Google's Material Design system.

## Authors

- **Andriy Kashyrskyy (Institute for Future Intelligence)** 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
