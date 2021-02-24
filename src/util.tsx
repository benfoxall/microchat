import React, { CSSProperties, FC } from 'react';


export const Bubble: FC<{ name?: string, className?: string, variant?: 'small' | 'large' }> = ({ name, className = '', variant = "small" }) => {

  const style = useGradientStyle(name || '')

  return <div
    className={className + " rounded-full bg-gray-800 transition shadow-md " + (variant === 'small' ? 'h-7 w-7' : 'h-12 w-12')}
    style={style}
  > </div>

}

/** A deterministic gradient generator */
const useGradientStyle = (key: string): CSSProperties => {
  let h = 0;
  for (const letter of key) {
    h += letter.charCodeAt(0);
  }

  const rotate = h % 60;
  const c1 = (h * 10) % 360;
  const c2 = (c1 + 180 + Math.round(Math.sin(h) * 90)) % 360;

  return {
    background: `linear-gradient(
        ${rotate}deg, 
        hsl(${c1}deg, 90%,60%), 
        hsl(${c2}deg, 90%,60%)
    )`,
  };
};


export function assert(value: any): asserts value {
  if (!value) {
    throw new Error('Assertation Error');
  }
}

/** An async readable queue */
export class Queue<T> implements AsyncIterable<T> {
  private next: Promise<Queue<T>>;
  private resolve: (value: Queue<T>) => void = () => { };

  constructor(readonly value: T | null = null) {
    this.next = new Promise((resolve) => (this.resolve = resolve));
  }

  add(value: T) {
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

      if (current.value === null) break;

      yield current.value;
    }
  }
}
