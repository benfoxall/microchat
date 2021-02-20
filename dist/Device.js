import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "../_snowpack/pkg/react.js";
import {Link, useRouteMatch} from "../_snowpack/pkg/react-router-dom.js";
import {CodeInput} from "./CodeInput.js";
import {assert, requestDeviceByName, LSocket} from "./puck-stuff.js";
export const DEVICE_ROUTE = "/\u2192/:id/:name";
export const Device = ({devices, setDevices}) => {
  const route = useRouteMatch(DEVICE_ROUTE);
  assert(route);
  const device = devices.find((device2) => device2.id === decodeURIComponent(route.params.id));
  const {rx, send} = useSocket(device);
  const main = useRef(null);
  useEffect(() => {
    if (main.current) {
      main.current.scrollTo({
        top: main.current.scrollHeight - main.current.clientHeight,
        behavior: "smooth"
      });
    }
  }, [rx]);
  if (!device) {
    console.log(devices, route);
    const connect = async () => {
      console.log("NAME", route.params.name);
      const device2 = await requestDeviceByName(route.params.name);
      setDevices((prev) => prev.concat(device2));
    };
    return /* @__PURE__ */ React.createElement("div", {
      className: "m-4 p-4 bg-yellow-400 rounded-md shadow-lg"
    }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Link, {
      className: "p-4 hover:text-blue-600",
      to: "/"
    }, "\u2190"), "connection lost"), /* @__PURE__ */ React.createElement("button", {
      className: "m-4 text-xl hover:text-blue-600",
      onClick: connect
    }, "Reconnect ", decodeURIComponent(route.params.name), " "));
  }
  return /* @__PURE__ */ React.createElement("section", {
    className: "h-full flex flex-col"
  }, /* @__PURE__ */ React.createElement("header", {
    className: "bg-yellow-400 p-4 flex items-center"
  }, /* @__PURE__ */ React.createElement(Link, {
    className: "px-4 py-2 hover:text-blue-600",
    to: "/"
  }, "\u2190"), /* @__PURE__ */ React.createElement("div", {
    className: "rounded-full bg-gray-800 w-7 h-7 transition shadow-md"
  }), /* @__PURE__ */ React.createElement("p", {
    className: "px-4 text-xl font-mono"
  }, device.name)), /* @__PURE__ */ React.createElement("main", {
    ref: main,
    className: "flex-1 font-mono whitespace-pre-wrap p-4 overflow-scroll"
  }, rx), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement(CodeInput, {
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
      const value = new LSocket(device, controller.signal);
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
