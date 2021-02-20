import React, {
  useCallback,
  useEffect,
  useState
} from "../_snowpack/pkg/react.js";
import {Link, useRouteMatch} from "../_snowpack/pkg/react-router-dom.js";
import {CodeInput} from "./CodeInput.js";
import {Socket, assert, requestDeviceByName} from "./puck-stuff.js";
export const DEVICE_ROUTE = "/\u2192/:id/:name";
export const Device = ({devices, setDevices}) => {
  const route = useRouteMatch(DEVICE_ROUTE);
  assert(route);
  const device = devices.find((device2) => device2.id === decodeURIComponent(route.params.id));
  const {rx, send} = useSocket(device);
  if (!device) {
    console.log(devices, route);
    const connect = async () => {
      console.log("NAME", route.params.name);
      const device2 = await requestDeviceByName(route.params.name);
      setDevices((prev) => prev.concat(device2));
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Link, {
      to: "/"
    }, "Back"), /* @__PURE__ */ React.createElement("h2", null, decodeURIComponent(route.params.name)), /* @__PURE__ */ React.createElement("h3", null, "not connected"), /* @__PURE__ */ React.createElement("button", {
      onClick: connect
    }, "Connect"));
  }
  return /* @__PURE__ */ React.createElement("section", {
    className: "Device"
  }, /* @__PURE__ */ React.createElement("h3", null, " ", /* @__PURE__ */ React.createElement(Link, {
    to: "/"
  }, "Back"), " \u2192 ", device.name), /* @__PURE__ */ React.createElement("main", null, rx), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement(CodeInput, {
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
