import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

interface AppProps {}

function App({}: AppProps) {
  // Create the count state.
  const [count, setCount] = useState(0);
  // Create the counter (+1 every second).
  useEffect(() => {
    const timer = setTimeout(() => setCount(count + 1), 1000);
    return () => clearTimeout(timer);
  }, [count, setCount]);
  // Return the App component.
  return (
    <div className="App">
      <header>
        <p>
          Page has been open for <code>{count}</code> seconds.
        </p>
      </header>
      <main></main>
      <footer></footer>
    </div>
  );
}

export default App;
