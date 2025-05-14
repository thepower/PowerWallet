import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { App } from 'application/components/App';
import './styles/main.scss';
import i18n from './locales/initTranslation';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);
