// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UserProvider from './contexts/UserContext';
// Import styled compatibility layer for React 19 + MUI
import './utils/styledCompat';

// Since we're sure the element with ID 'root' exists, we can use the non-null assertion operator '!'
const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
