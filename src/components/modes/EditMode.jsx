import { useState, useRef } from 'react';
import { Upload, ArrowLeft, X, Undo, Redo } from '../icons';
import { generateUUID } from '../../utils/uuid';
import { IMG_BASE_URL } from '../../data/topics';

function EditMode({ questions, setQuestions, setMode, undo, redo, canUndo, canRedo }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format. Please check your file and try again.');
      }

      const questionElements = xmlDoc.getElementsByTagName('question');
      if (questionElements.length === 0) {
        throw new Error('No questions found in the XML file.');
      }

      const parsedQuestions = [];

      for (let i = 0; i < questionElements.length; i++) {
        const qEl = questionElements[i];
        if (qEl.getAttribute('type') !== 'multichoice') continue;

        const idnumber = qEl.getElementsByTagName('idnumber')[0]?.textContent || '';
        const tags = Array.from(qEl.getElementsByTagName('tag')).map(t => t.textContent);
        
        const week = tags.find(t => t.startsWith('Week_'))?.replace('Week_', '') || '';
        const year = tags.find(t => t.startsWith('Year_'))?.replace('Year_', '') || '';
        const paper = tags.find(t => t.startsWith('Paper_'))?.replace('Paper_', 'Paper ') || '';
        const mainTopic = tags.find(t => t.startsWith('MainTopic_'))?.replace('MainTopic_', '').replace(/_/g, ' ') || '';
        const subTopics = tags.filter(t => t.startsWith('SubTopic_')).map(t => t.replace('SubTopic_', '').replace(/_/g, ' '));

        const answers = qEl.getElementsByTagName('answer');
        let correctAnswer = '';
        for (let j = 0; j < answers.length; j++) {
          if (answers[j].getAttribute('fraction') === '100') {
            correctAnswer = answers[j].getElementsByTagName('text')[0]?.textContent || '';
          }
        }

        const fileEl = qEl.getElementsByTagName('file')[0];
        const base64 = fileEl?.textContent?.trim() || '';
        const fileName = fileEl?.getAttribute('name') || `${idnumber}.png`;

        if (base64) {
          const mimeType = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
          const dataUrl = `data:${mimeType};base64,${base64}`;

          parsedQuestions.push({
            id: generateUUID(),
            idnumber,
            generatedImageFileName: fileName,
            imgUrl: IMG_BASE_URL + fileName,
            imageDataUrl: dataUrl,
            imageBase64: base64,
            originalImageFileName: fileName,
            correctAnswer,
            week,
            year,
            paper,
            mainTopic,
            subTopic1: subTopics[0] || '',
            subTopic2: subTopics[1] || ''
          });
        }
      }

      if (parsedQuestions.length === 0) {
        throw new Error('No valid questions with images found in the XML file.');
      }

      setQuestions(parsedQuestions);
      setError(null);
    } catch (err) {
      console.error('XML parsing error:', err);
      setError(err.message || 'Failed to parse XML file. Please check the file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md mb-6">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setMode('select')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h2 className="text-2xl font-bold text-gray-800">Import & Edit XML</h2>

            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading XML</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto flex-shrink-0 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg p-16 text-center ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-purple-400 hover:bg-purple-50'} transition-colors`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            {isLoading ? (
              <div>
                <p className="text-purple-600 text-lg font-medium mb-2">Loading XML file...</p>
                <p className="text-gray-500 text-sm">Please wait while we parse your file</p>
              </div>
            ) : (
              <div>
                <div className="inline-block mb-4"><Upload /></div>
                <p className="text-gray-600 text-lg font-medium mb-2">Click to upload XML file</p>
                <p className="text-gray-500 text-sm">Upload a Moodle XML file to edit questions</p>
              </div>
            )}
          </div>

          {questions.length > 0 && !error && (
            <div className="mt-8">
              <p className="text-green-600 font-semibold mb-4 text-center">{questions.length} questions loaded successfully</p>
              <button
                onClick={() => setMode('single')}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Edit Questions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditMode;
