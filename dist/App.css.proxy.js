// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".App {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n\n  display: flex;\n  flex-direction: column;\n}\n\nheader {\n  background: #0003;\n  padding: 0.5rem;\n}\n\nmain {\n  flex: 1;\n}\n\nfooter {\n  background: #0003;\n\n  display: flex;\n}\n\nbody .App .Toastify__toast {\n  min-height: 0 !important;\n}\n\n.CodeInput {\n  display: flex;\n  flex: 1;\n  margin: 0.5em;\n}\n\n.CodeInput [type='text'] {\n  flex: 1;\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}