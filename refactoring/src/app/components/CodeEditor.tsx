import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import { SAMPLES_LISTS, ACTIVITIES_LISTS, type TitleValues } from '../constants/activities';

interface CodeEditorProps {
  selectedTopic: TitleValues;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ selectedTopic }) => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [selectedExample, setSelectedExample] = useState('');

  const samples = SAMPLES_LISTS[selectedTopic] || [];
  const activities = ACTIVITIES_LISTS[selectedTopic] || [];
  
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const handleExampleSelect = (example: any) => {
    setSelectedExample(example.title);
    setCode(example.code);
    setOutput('');
  };

  const runCode = () => {
    try {
      // Create a custom console.log implementation
      const logs: string[] = [];
      const customLog = (...args: any[]) => {
        logs.push(args.join(' '));
      };
  
      // Replace print statements and prepare the code
      const compiledCode = code
        .replace(/print\((.*?)\)/g, 'customLog($1)')
        .replace(/int /g, 'let ');
  
      // Create execution context
      const executionContext = `
        const logs = [];
        const customLog = ${customLog.toString()};
        ${compiledCode}
        logs.join('\\n');
      `;
  
      // Execute the code
      const result = new Function(executionContext)();
      setOutput(logs.join('\n') || 'Código ejecutado exitosamente');
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="editor-section">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Ejemplos</h3>
          <div className="flex flex-wrap gap-2">
            {samples.map((example) => (
              <button
                key={example.title}
                onClick={() => handleExampleSelect(example)}
                className={`px-4 py-2 rounded ${
                  selectedExample === example.title 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Actividades</h3>
          <div className="flex flex-wrap gap-2">
  {activities.map((activity) => {
    if (typeof activity === 'string') return <div className="w-full" key="newline" />;
    return (
      <button
        key={activity.title}
        onClick={() => handleExampleSelect(activity)}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
      >
        {activity.title}
      </button>
    );
  })}
</div>
        </div>
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 font-mono p-4 border rounded"
        />
        
        <button 
          onClick={runCode}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Ejecutar Código
        </button>
      </div>

      <div className="output-section">
        <h3 className="text-xl font-bold mb-4">Resultado:</h3>
        <pre className="p-4 bg-gray-100 rounded min-h-[200px] whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;

