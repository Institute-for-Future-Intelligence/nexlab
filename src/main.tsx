// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Import styled compatibility layer for React 19 + MUI FIRST
import './utils/styledCompat';
import App from './App';
import UserProvider from './contexts/UserContext';

// Since we're sure the element with ID 'root' exists, we can use the non-null assertion operator '!'
const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <UserProvider>
    <App />
  </UserProvider>
);
