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
        hsl(${c1}deg, 90%,60%), 
        hsl(${c2}deg, 90%,60%)
    )`
  };
};
export function assert(value) {
  if (!value) {
    throw new Error("Assertation Error");
  }
}
export class Queue {
  constructor(value = null) {
    this.value = value;
    this.resolve = () => {
    };
    this.next = new Promise((resolve) => this.resolve = resolve);
  }
  add(value) {
    const next = new Queue(value);
    this.resolve(next);
    this.resolve = next.resolve;
  }
  end() {
    this.resolve(new Queue());
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const current = await this.next;
      this.next = current.next;
      if (current.value === null)
        break;
      yield current.value;
    }
  }
}
