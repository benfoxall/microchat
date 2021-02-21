import React, { useState } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { HashRouter, Route, Switch } from 'react-router-dom';
import { DeviceList } from './DeviceList';
import { Device, DEVICE_ROUTE } from './Device';

interface AppProps {}

function App({}: AppProps) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  return (
    <HashRouter>
      <div className="h-full">
        <Switch>
          <Route path={DEVICE_ROUTE}>
            <Device devices={devices} setDevices={setDevices} />
          </Route>
          <Route>
            <header>
              <DeviceList value={devices} onChange={setDevices} />
            </header>
          </Route>
        </Switch>
      </div>
      <ToastContainer hideProgressBar />
    </HashRouter>
  );
}

export default App;
