import { useState, useEffect } from 'react';
import { useUndoRedo } from './hooks/useUndoRedo';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storageUtils';
import ModeSelector from './components/modes/ModeSelector';
import SingleQuestionMode from './components/modes/SingleQuestionMode';
import BulkMode from './components/modes/BulkMode';
import EditMode from './components/modes/EditMode';
import PreviewQuizMode from './components/modes/PreviewQuizMode';

function App() {
  const [mode, setMode] = useState('select');

  // Use undo/redo hook for questions
  const {
    state: questions,
    updateState: setQuestions,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo(loadFromLocalStorage());

  const [bulkStage, setBulkStage] = useState('upload');
  const [bulkImages, setBulkImages] = useState([]);
  const [globalMetadata, setGlobalMetadata] = useState({
    paper: '',
    mainTopic: '',
    subTopic1: ''
  });

  // Save to localStorage whenever questions change
  useEffect(() => {
    saveToLocalStorage(questions);
  }, [questions]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const renderMode = () => {
    switch (mode) {
      case 'select':
        return <ModeSelector setMode={setMode} />;
      case 'single':
        return <SingleQuestionMode
          questions={questions}
          setQuestions={setQuestions}
          setMode={setMode}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />;
      case 'bulk':
        return <BulkMode
          questions={questions}
          setQuestions={setQuestions}
          setMode={setMode}
          bulkStage={bulkStage}
          setBulkStage={setBulkStage}
          bulkImages={bulkImages}
          setBulkImages={setBulkImages}
          globalMetadata={globalMetadata}
          setGlobalMetadata={setGlobalMetadata}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />;
      case 'edit':
        return <EditMode
          questions={questions}
          setQuestions={setQuestions}
          setMode={setMode}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />;
      case 'preview':
        return <PreviewQuizMode
          questions={questions}
          setQuestions={setQuestions}
          setMode={setMode}
        />;
      default:
        return <ModeSelector setMode={setMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderMode()}
    </div>
  );
}

export default App;
