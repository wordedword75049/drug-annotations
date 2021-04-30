import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'flexboxgrid2/flexboxgrid2.css';
import axios from 'axios';
import {apiPath} from 'paths';

const isProduction = process.env.NODE_ENV === 'production';

(() => {
  const defaultHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json'
  };

  if (isProduction) {
    axios.defaults.headers.common = {
      ...defaultHeaders
    };
    axios.defaults.baseURL = apiPath;
  } else {
    const developmentHeaders = {
      'X-Forwarded-Proto': 'http',
      'X-Forwarded-Host': 'localhost',
      'X-Forwarded-Port': '3000'
    };
    axios.defaults.headers.common = {
      ...developmentHeaders,
      ...defaultHeaders
    };
    axios.defaults.baseURL = '/local';
  }

  const rootElement = document.getElementById('root');
  ReactDOM.render(<App />, rootElement);
})();
