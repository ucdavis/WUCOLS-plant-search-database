import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ToastProvider } from 'react-toast-notifications'
fetch("WUCOLS.json")
.then(r => r.json())
.then(d => {
  d.plants.forEach(p => {
    p.searchName = (p.commonName + ' ' + p.botanicalName).toLowerCase();
  });

  d.plantTypeNameByCode = 
    d.plantTypes.reduce((dict,t) => { 
      dict[t.code] = t.name;
      return dict;
    },{});

  d.waterUseByCode = 
    d.waterUseClassifications.reduce((dict,wu) => { 
      dict[wu.code] = wu;
      return dict;
    },{});

  ReactDOM.render(
    <ToastProvider
      autoDismiss
      placement="bottom-center"
      autoDismissTimeout={6000}
    >
      <App data={d} />
    </ToastProvider>,
    document.getElementById('root')
  );
});


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
