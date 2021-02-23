import React from 'react';

import './styles.css';

import { HashRouter, Route, Switch } from 'react-router-dom';
import { DeviceList } from './DeviceList';
import { Device, DEVICE_ROUTE } from './Device';

interface AppProps { }

function App({ }: AppProps) {
  return (
    <HashRouter>
      <div className="h-full max-w-lg bg-gray-50 shadow-lg m-auto rounded-md overflow-auto">
        <Switch>
          <Route path={DEVICE_ROUTE}>
            <Device />
          </Route>
          <Route>
            <DeviceList />
          </Route>
        </Switch>
      </div>
    </HashRouter>
  );
}

export default App;
