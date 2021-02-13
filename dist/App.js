import React, {useState, useEffect} from "../_snowpack/pkg/react.js";
import "./App.css.proxy.js";
import {ToastContainer} from "../_snowpack/pkg/react-toastify.js";
import "../_snowpack/pkg/react-toastify/dist/ReactToastify.css.proxy.js";
import {Devices} from "./Devices.js";
import {CodeInput} from "./CodeInput.js";
import {repl} from "./puck-stuff.js";
function App({}) {
  const [devices, setDevices] = useState([]);
  const [repl_, setRepl_] = useState();
  useEffect(() => {
    if (devices[0]) {
      const control = new AbortController();
      const r = repl(devices[0], {signal: control.signal});
      setRepl_(r);
      return () => {
        control.abort();
        setRepl_(void 0);
      };
    }
  }, [devices[0]]);
  const run = (src) => {
    console.log(repl_);
    console.group("run");
    repl_?.eval(src).then((result) => {
      console.groupEnd();
    });
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: "App"
  }, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement(Devices, {
    value: devices,
    onChange: setDevices
  })), /* @__PURE__ */ React.createElement("main", null), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement(CodeInput, {
    onChange: run
  }))), /* @__PURE__ */ React.createElement(ToastContainer, {
    hideProgressBar: true
  }));
}
export default App;
