import React from "../_snowpack/pkg/react.js";
export const CodeInput = ({onChange}) => {
  const submit = (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code");
    if (typeof code === "string") {
      onChange(code);
    }
  };
  return /* @__PURE__ */ React.createElement("form", {
    className: "CodeInput",
    onSubmit: submit
  }, /* @__PURE__ */ React.createElement("input", {
    type: "text",
    name: "code"
  }), /* @__PURE__ */ React.createElement("input", {
    type: "submit",
    value: "send"
  }));
};
