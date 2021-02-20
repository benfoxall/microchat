import React from "../_snowpack/pkg/react.js";
import {requestDevice} from "./puck-stuff.js";
import {toast} from "../_snowpack/pkg/react-toastify.js";
import {generatePath, NavLink} from "../_snowpack/pkg/react-router-dom.js";
import {DEVICE_ROUTE} from "./Device.js";
export const DeviceList = ({
  value,
  onChange
}) => {
  const addDevice = async () => {
    try {
      const device = await requestDevice();
      if (value.includes(device)) {
        toast.warn("already added");
      } else {
        onChange((prev) => prev.concat(device));
      }
    } catch (e) {
      console.warn(e);
    }
  };
  const remove = (device) => (e) => {
    e.preventDefault();
    onChange((devices) => devices.filter((target) => device !== target));
  };
  return /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("ul", null, value.map((device) => /* @__PURE__ */ React.createElement(DeviceListItem, {
    key: device.id,
    device
  }))), /* @__PURE__ */ React.createElement("button", {
    className: "rounded-full bg-purple-800 w-12 h-12 hover:bg-purple-700 transition shadow-lg fixed bottom-4 right-4 text-white",
    onClick: addDevice
  }, "+"));
};
const DeviceListItem = ({device}) => {
  const link = generatePath(DEVICE_ROUTE, {
    id: device.id,
    name: device.name || "?"
  });
  return /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(NavLink, {
    className: "flex items-center text-gray-900 hover:bg-yellow-400",
    to: link,
    key: device.id
  }, /* @__PURE__ */ React.createElement("div", {
    className: "rounded-full bg-gray-800 w-10 h-10 hover:bg-gray-700 transition shadow-md m-5"
  }), /* @__PURE__ */ React.createElement("div", {
    className: "flex-1 font-monospace"
  }, /* @__PURE__ */ React.createElement("h2", {
    className: "text-lg"
  }, device.name), /* @__PURE__ */ React.createElement("h3", {
    className: "text-gray-800 text-sm"
  }, "-"))));
};
