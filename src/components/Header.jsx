import { Sparkles, RotateCcw } from 'lucide-react';

export default function Header({ onReset }) {
  return (
    <header className="app-header">
      <div className="logo">
        <Sparkles size={24} color="#ffe15a" />
        <h1>Introduction to Artificial Intelligence</h1>
      </div>
      <button className="reset-button" onClick={onReset} title="Start Over">
        <RotateCcw size={18} /> <span>Reset</span>
      </button>
    </header>
  );
}
