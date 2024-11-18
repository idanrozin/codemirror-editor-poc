import './App.css';
import Editor from './components/Editor';
function App() {
  return (
    <div className="min-h-[calc(100vh-64px)] p-8 bg-gray-900">
      <div className="w-full mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">
          CodeMirror Editor Example
        </h1>
        <Editor />
      </div>
    </div>
  );
}

export default App;
