import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import { indentUnit } from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import { FC, useState } from 'react';
import { pythonLinter } from '../lint/pythonLinter';

const Editor: FC = () => {
  const [code, setCode] = useState('# Write your Python code here\n');

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <CodeMirror
        value={code}
        height="calc(100vh - 300px)"
        theme={oneDark}
        extensions={[
          python(),
          autocompletion(),
          indentUnit.of('    '),
          lintGutter(),
          linter(pythonLinter()),
        ]}
        onChange={(value, _viewUpdate) => {
          setCode(value);
        }}
        className="text-base text-left"
      />
    </div>
  );
};

export default Editor;
