import { assert } from 'chai';
import React, {
  FormEventHandler,
  FunctionComponent,
  SyntheticEvent,
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
    <form className="CodeInput" onSubmit={submit}>
      <input type="text" name="code"></input>
      <input type="submit" value="send" />
    </form>
  );
};
