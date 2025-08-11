import React from 'react';
import CVEditor from './components/CVEditor';

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Digital CV Generator</h1>
      </header>
      <main>
        <CVEditor />
      </main>
    </div>
  );
}
