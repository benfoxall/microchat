import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

import { ToastContainer, toast } from 'react-toastify';
import { HashRouter, Route, Switch } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { Devices } from './Devices';
import { CodeInput } from './CodeInput';
import { repl, IRepl } from './puck-stuff';
import { Device } from './Device';

interface AppProps {}

function App({}: AppProps) {
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

  const run = (src: string) => {
    // console.log(repl_);
    // // console.group('run');
    // repl_?.eval(src).then((result) => {
    //   // console.log('RSULT', result);
    //   // console.groupEnd();
    // });
  };

  return (
    <HashRouter>
      <div className="App">
        <header>
          <Devices value={devices} onChange={setDevices} />
        </header>

        <Switch>
          <Route path="/→/:deviceId+">
            <Device devices={devices} setDevices={setDevices} />
          </Route>
        </Switch>
      </div>
      <ToastContainer hideProgressBar />
    </HashRouter>
  );
}

export default App;
