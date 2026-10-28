import { docsPathname } from './docs-path';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './catalog/App';
import { Preview } from './visual/Preview';
import './kit/tokens.css';
import './kit/components.css';
// App builds can tree-shake style-only barrels. Keep each kit stylesheet explicit.
import './kit/portal/shell.css';
import './kit/portal/portal.css';
import './kit/mobile/mobile.css';
import './kit/landing/landing.css';
import './catalog/catalog.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {docsPathname(location.pathname).startsWith('/preview/') ? <Preview /> : <App />}
  </React.StrictMode>,
);
