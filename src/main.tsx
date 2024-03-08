import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import './i18n';

import './main.css';

import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
