import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useDevice } from './device-cache';
import { CodeInput } from './CodeInput';
import { db } from './db';
import { useSocket } from './puck-stuff';
import { useGradientStyle, assert } from './util';

export const DEVICE_ROUTE = '/→/:id/:name';
export interface IDEVICE_ROUTE {
  id: string;
  name: string;
}

export const DEVICE_INFO_ROUTE = DEVICE_ROUTE + '/info';

export const Device: FunctionComponent = () => {
  const route = useRouteMatch<IDEVICE_ROUTE>(DEVICE_ROUTE);

  assert(route);

  const [device, reconnect, clear] = useDevice(route.params.name);
  const { send, output, error, state } = useSocket(device);

  const main = useRef<HTMLElement>(null);

  const [sess] = useState(() =>
    db.sessions.add({
      deviceId: route.params.id,
      createdAt: Date.now(),
      content: '',
    }),
  );

  const [prev, setPrev] = useState('');

  useEffect(() => {
    const results = db.sessions
      .where('deviceId')
      .equals(route.params.id)
      .sortBy('createdAt');

    results.then((r) => {
      const join = r
        .map((result) => result.content)
        .filter(Boolean)
        .join('\n');

      setPrev(join);
    });
  }, []);

  useEffect(() => {
    if (main.current) {
      main.current.scrollTo({
        top: main.current.scrollHeight - main.current.clientHeight,
        behavior: 'smooth',
      });
    }

    sess
      .then((id) => db.sessions.update(id, { content: output }))
      .then(() => console.log('wrote'));
  }, [prev, output]);

  const style = useGradientStyle(route.params.id);
  const [, setExpanded] = useState(false);

  if (!device) {
    return (
      <div className="m-4 p-4 bg-yellow-400 rounded-md shadow-lg">
        <div>
          <Link className="p-4 hover:text-blue-600" to="/">
            ←
          </Link>
          connection lost
        </div>

        <button className="m-4 text-xl hover:text-blue-600" onClick={reconnect}>
          Reconnect {decodeURIComponent(route.params.name)}{' '}
        </button>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col">
      <header
        className="bg-black text-white p-4 flex items-center justify-between cursor-pointer focus:outline-none"
        tabIndex={-1}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Link className="px-4 py-2 hover:text-blue-600" to="/">
          ←
        </Link>

        <div
          className="rounded-full bg-gray-800 w-7 h-7 transition shadow-md"
          style={style}
        ></div>

        <p className="px-4 text-xl font-mono flex-1">{device.name}</p>
      </header>

      {/* {expanded && <div className="bg-gray-800 text-white p-8">more info</div>} */}

      <main
        ref={main}
        className="flex-1 font-mono whitespace-pre-wrap p-4 overflow-scroll"
      >
        <span className="text-gray-400">{prev}</span>
        {output}
      </main>

      {error && (
        <p className="m-4 bg-red-100 text-red-500 rounded-md p-2 flex items-center">
          {error || 'Error'}

          <button
            className=" p-2 rounded-md block bg-red-200 hover:bg-red-300"
            onClick={clear}
          >
            Reconnect
          </button>
        </p>
      )}

      {/* <p className="mx-4">{state}</p>
      <button
        onClick={(e) => {
          e.preventDefault();
          reconnect();
        }}
      >
        RECONNET
      </button> */}
      <footer>
        <CodeInput onChange={send} />
      </footer>
    </section>
  );
};
