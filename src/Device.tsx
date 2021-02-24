import React, {
  ChangeEventHandler,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useDevice } from './device-cache';
import { CodeInput } from './CodeInput';
import { db } from './db';
import { useSocket } from './puck-stuff';
import { assert, Bubble } from './util';
import { useLiveQuery } from 'dexie-react-hooks';

export const DEVICE_ROUTE = '/→/:id/:name';
export interface IDEVICE_ROUTE {
  id: string;
  name: string;
}

export const DEVICE_INFO_ROUTE = DEVICE_ROUTE + '/info';

export const Device: FunctionComponent = () => {
  const route = useRouteMatch<IDEVICE_ROUTE>(DEVICE_ROUTE);

  assert(route);
  const urlId = decodeURIComponent(route.params.id)

  const deviceQuery = useLiveQuery(() => db.devices.get(urlId), []);

  const [device, reconnect, clear] = useDevice(route.params.name);

  const { send, output, error, state } = useSocket(device);

  const main = useRef<HTMLElement>(null);

  const [sess] = useState(() =>
    db.sessions.add({
      deviceId: urlId,
      createdAt: Date.now(),
      content: '',
    }),
  );

  const [prev, setPrev] = useState('');

  useEffect(() => {
    const results = db.sessions
      .where('deviceId')
      .equals(urlId)
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
      .then(() => console.log('updated session'));
  }, [prev, output]);

  const [expanded, setExpanded] = useState(false);

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


        <div>
          <Bubble name={deviceQuery?.id} />
        </div>


        <p className="px-4 text-xl font-mono flex-1">
          {deviceQuery?.nickname ?
            <>
              <span>{deviceQuery?.nickname}</span>
              <span className="text-xs px-3">{device.name}</span>
            </> :

            device.name


          }


        </p>
      </header>

      {expanded && (
        <div className="bg-gray-800 text-white p-8">
          <Details id={decodeURIComponent(route.params.id)} />
        </div>
      )}

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

      <footer>
        <CodeInput onChange={send} />
      </footer>
    </section>
  );
};

const Details: FunctionComponent<{ id: string }> = ({ id }) => {
  const deviceQuery = useLiveQuery(() => db.devices.get(id), []);


  const setNickname: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nickname = e.currentTarget.value;
    db.devices.update(id, { nickname })
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label className="flex">
        <span className="p-2">nickname</span>
        <input
          type="text"
          className="text-black p-2"
          value={deviceQuery?.nickname || ''}
          onChange={setNickname}
        />
      </label>
    </form>
  );
};
