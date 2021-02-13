import React, { useState, useEffect } from 'react';
import './App.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Devices } from './Devices';
import { CodeInput } from './CodeInput';

interface AppProps {}

function App({}: AppProps) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  const run = (src: string) => {
    console.log('---> ', src);
  };

  return (
    <>
      <div className="App">
        <header>
          <Devices value={devices} onChange={setDevices} />
        </header>
        <main></main>
        <footer>
          <CodeInput onChange={run} />
        </footer>
      </div>
      <ToastContainer hideProgressBar />
    </>
  );
}

export default App;
