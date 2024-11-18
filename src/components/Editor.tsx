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
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
      >
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="p-4 bg-gray-800 rounded-lg">
        <CodeMirror
          value={code}
          height="calc(100vh - 300px)"
          theme={isDarkMode ? oneDark : 'light'}
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
          className={`text-base text-left ${isDarkMode ? '' : 'border border-gray-200 rounded-md'}`}
        />
      </div>
    </div>
  );
};

export default Editor;
