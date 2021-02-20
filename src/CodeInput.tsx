import { assert } from 'chai';
import React, {
  FormEventHandler,
  FunctionComponent,
} from 'react';

interface Props {
  onChange: (value: string) => void;
}

export const CodeInput: FunctionComponent<Props> = ({ onChange }) => {
  const submit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get('code');

    if (typeof code === 'string') {
      onChange(code);
    }
  };

  return (
    <form className="flex right-0" onSubmit={submit}>
      <input type="text" name="code" className="flex-1 p-4"></input>
      <input type="submit" value="send" className="p-4" />
    </form>
  );
};
