import { EditorView } from '@codemirror/view';
import { Diagnostic } from '@codemirror/lint';

export function pythonLinter() {
  return (view: EditorView) => {
    const diagnostics: Diagnostic[] = [];
    const text = view.state.doc.toString();
    const lines = text.split('\n');

    // Keep track of decorator context
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

      // Check for missing colons after if/for/while/def/class
      const missingColonRegex = /^(if|for|while|def|class)\b[^:]*$/;
      if (trimmedLine.match(missingColonRegex)) {
        // Only skip error if it's a decorated function
        if (!(hasHlpDecorator && trimmedLine.startsWith('def'))) {
          const linePos = view.state.doc.line(i + 1);
          diagnostics.push({
            from: linePos.from,
            to: linePos.to,
            severity: 'error',
            message: 'Missing colon (:)',
          });
        }
      }

      // Reset decorator flag after processing a function definition
      if (trimmedLine.startsWith('def')) {
        hasHlpDecorator = false;
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
