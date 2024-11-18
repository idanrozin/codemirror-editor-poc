import { EditorView } from '@codemirror/view';
import { Diagnostic } from '@codemirror/lint';

export function pythonLinter() {
  return (view: EditorView) => {
    const diagnostics: Diagnostic[] = [];
    const text = view.state.doc.toString();
    const lines = text.split('\n');

    let hasHlpDecorator = false;

    lines.forEach((line, i) => {
      // Ignore empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) return;

      // Check for @hlp decorator
      if (line.trim() === '@hlp') {
        hasHlpDecorator = true;
        return;
      }

      const trimmedLine = line.trim();

      // Check function definitions
      if (trimmedLine.startsWith('def ')) {
        // Check for missing colons
        const missingColonRegex = /^(if|for|while|def|class)\b[^:]*$/;
        if (trimmedLine.match(missingColonRegex) && !hasHlpDecorator) {
          const linePos = view.state.doc.line(i + 1);
          diagnostics.push({
            from: linePos.from,
            to: linePos.to,
            severity: 'error',
            message: 'Missing colon (:)',
          });
        }

        // Check for @hlp decorated functions without arguments
        if (hasHlpDecorator) {
          // This regex checks for empty parentheses or missing parentheses
          const noArgsRegex = /def\s+\w+\s*\(\s*\)|def\s+\w+\s*:/;
          if (trimmedLine.match(noArgsRegex)) {
            const linePos = view.state.doc.line(i + 1);
            diagnostics.push({
              from: linePos.from,
              to: linePos.to,
              severity: 'error',
              message:
                '@hlp decorated functions must have at least one argument',
            });
          }
        }

        // Reset decorator flag after processing function definition
        hasHlpDecorator = false;
      }
      // Check other statements for missing colons
      else if (trimmedLine.match(/^(if|for|while|class)\b[^:]*$/)) {
        const linePos = view.state.doc.line(i + 1);
        diagnostics.push({
          from: linePos.from,
          to: linePos.to,
          severity: 'error',
          message: 'Missing colon (:)',
        });
      }

      // Check for incorrect indentation
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

      // Check for unmatched brackets
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
