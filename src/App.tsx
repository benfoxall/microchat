import React, { useState, useEffect } from 'react';
import './App.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Devices } from './Devices';

interface AppProps {}

function App({}: AppProps) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  return (
    <>
      <div className="App">
        <header>
          <Devices value={devices} onChange={setDevices} />
        </header>
        <main></main>
        <footer></footer>
      </div>
      <ToastContainer hideProgressBar />
    </>
  );
}

export default App;
