export const useGradientStyle = (key) => {
  let h = 0;
  for (const letter of key) {
    h += letter.charCodeAt(0);
  }
  const rotate = h % 60;
  const c1 = h * 10 % 360;
  const c2 = (c1 + 180 + Math.round(Math.sin(h) * 90)) % 360;
  return {
    background: `linear-gradient(
        ${rotate}deg, 
        hsl(${c1}deg, 70%,50%), 
        hsl(${c2}deg, 90%,40%)
    )`
  };
};
