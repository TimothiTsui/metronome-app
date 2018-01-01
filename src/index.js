import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

// tell webpack to use our scss
import './scss/main.scss';
// web audio api monkeypatch
import './utils/monkeypatch';
// parent component
import App from './components/App';

const renderApp = Component => {
  render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

renderApp(App);

if (module.hot) {
  module.hot.accept('./components/App', () => renderApp(App));
}
