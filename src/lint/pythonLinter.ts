import { EditorView } from '@codemirror/view';
import { Diagnostic } from '@codemirror/lint';
export function pythonLinter() {
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
