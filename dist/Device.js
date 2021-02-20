import React, {
  useCallback,
  useEffect,
  useState
} from "../_snowpack/pkg/react.js";
import {Link, useRouteMatch} from "../_snowpack/pkg/react-router-dom.js";
import {CodeInput} from "./CodeInput.js";
import {Socket} from "./puck-stuff.js";
export const DEVICE_ROUTE = "/\u2192/:deviceId";
export const Device = ({devices}) => {
  const route = useRouteMatch(DEVICE_ROUTE);
  const device = devices.find((device2) => btoa(device2.id) === route?.params.deviceId);
  const {socket, rx, send} = useSocket(device);
  if (!device) {
    console.log(devices, route);
    return /* @__PURE__ */ React.createElement("h1", null, /* @__PURE__ */ React.createElement(Link, {
      to: "/"
    }, "Back"), "no device");
  }
  return /* @__PURE__ */ React.createElement("section", {
    className: "Device"
  }, /* @__PURE__ */ React.createElement("h3", null, " ", /* @__PURE__ */ React.createElement(Link, {
    to: "/"
  }, "Back"), " \u2192 ", device.name), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement("pre", null, rx)), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement(CodeInput, {
    onChange: send
  })));
};
const useSocket = (device) => {
  const [socket, setSocket] = useState();
  const [rx, setRx] = useState("");
  const send = useCallback((value) => {
    socket?.send(value + "\n");
  }, [socket]);
  useEffect(() => {
    if (!device)
      return;
    const controller = new AbortController();
    setRx("");
    const t = setTimeout(() => {
      const value = new Socket(device, controller.signal);
      value.listen((v) => {
        setRx((prev) => prev + v);
      });
      setSocket(value);
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [device]);
  return {socket, rx, send};
};
