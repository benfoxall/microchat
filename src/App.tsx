import React, { useState } from 'react';

import { ToastContainer } from 'react-toastify';
import { HashRouter, Route, Switch } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { DeviceList } from './DeviceList';
import { Device, DEVICE_ROUTE } from './Device';

interface AppProps { }

function App({ }: AppProps) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  // const [repl_, setRepl_] = useState<IRepl>();

  // useEffect(() => {
  //   if (devices[0]) {
  //     const control = new AbortController();
  //     const r = repl(devices[0], { signal: control.signal });

  //     setRepl_(r);

  //     return () => {
  //       control.abort();
  //       setRepl_(undefined);
  //     };
  //   }
  // }, [devices[0]]);


  return (
    <HashRouter>
      <div className="h-screen">
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
