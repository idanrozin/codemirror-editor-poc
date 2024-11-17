import { useState } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import { indentUnit } from '@codemirror/language';
import { Diagnostic, linter, lintGutter } from '@codemirror/lint';

import './App.css';

function pythonLinter() {
  return (view: EditorView) => {
    const diagnostics: Diagnostic[] = [];
    const text = view.state.doc.toString();
    const lines = text.split('\n');

    lines.forEach((line, i) => {
      // Ignore empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) return;

      // Check for missing colons after if/for/while/def/class
      // This regex checks for keywords followed by any characters but not ending with a colon
      const missingColonRegex = /^(if|for|while|def|class)\b[^:]*$/;
      if (line.trim().match(missingColonRegex)) {
        const linePos = view.state.doc.line(i + 1);
        diagnostics.push({
          from: linePos.from,
          to: linePos.to,
          severity: 'error',
          message: 'Missing colon (:)',
        });
      }

      // Check for incorrect indentation
      // This regex checks for indentation that's not a multiple of 4 spaces
      const incorrectIndentRegex = /^( {1,3}|\t+ +| +\t+)/;
      if (line.match(incorrectIndentRegex)) {
        const linePos = view.state.doc.line(i + 1);
        diagnostics.push({
          from: linePos.from,
          to: linePos.to,
          severity: 'error',
          message: 'Incorrect indentation. Use 4 spaces or tab',
        });
      }

      // Check for unmatched parentheses/brackets/braces in the line
      const brackets = line.split('').reduce((acc, char) => {
        if ('([{'.includes(char)) acc.push(char);
        else if (')]}'.includes(char)) {
          const lastOpen = acc[acc.length - 1];
          if (
            (char === ')' && lastOpen === '(') ||
            (char === ']' && lastOpen === '[') ||
            (char === '}' && lastOpen === '{')
          ) {
            acc.pop();
          }
        }
        return acc;
      }, [] as string[]);

      if (brackets.length > 0) {
        const linePos = view.state.doc.line(i + 1);
        diagnostics.push({
          from: linePos.from,
          to: linePos.to,
          severity: 'error',
          message: `Unmatched ${brackets.join(', ')}`,
        });
      }
    });

    return diagnostics;
  };
}

function App() {
  const [code, setCode] = useState('# Write your Python code here\n');

  return (
    <div className="min-h-[calc(100vh-64px)] p-8 bg-gray-900">
      <div className="w-full mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">
          CodeMirror Editor Example
        </h1>
        <div className="p-4 bg-gray-800 rounded-lg">
          <CodeMirror
            value={code}
            height="400px"
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
            style={{ textAlign: 'left' }}
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
