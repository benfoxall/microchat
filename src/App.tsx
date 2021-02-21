import React, { useState } from 'react';

import './styles.css';
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
      <div className="h-full max-w-lg bg-gray-50 shadow-lg m-auto rounded-md overflow-auto">
        <Switch>
          <Route path={DEVICE_ROUTE}>
            <Device devices={devices} setDevices={setDevices} />
          </Route>
          <Route>
            <DeviceList value={devices} onChange={setDevices} />
          </Route>
        </Switch>
      </div>
      <ToastContainer hideProgressBar />
    </HashRouter>
  );
}

export default App;
