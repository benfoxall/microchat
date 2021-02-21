import React, { useState } from 'react';

import './styles.css';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

import { HashRouter, Route, Switch } from 'react-router-dom';
import { DeviceList } from './DeviceList';
import { Device, DEVICE_INFO_ROUTE, DEVICE_ROUTE } from './Device';
import { DeviceInfo } from './DeviceInfo';

interface AppProps { }

function App({ }: AppProps) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  return (
    <HashRouter>
      <div className="h-full">
        <Switch>
          {/* <Route path={DEVICE_INFO_ROUTE}>
            <DeviceInfo devices={devices} setDevices={setDevices} />
          </Route> */}
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
