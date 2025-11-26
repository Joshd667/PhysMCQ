import { useState, useRef } from 'react';
import { Upload, ArrowLeft, X, ChevronLeft, ChevronRight, Eye, Edit } from '../icons';
import { generateUUID } from '../../utils/uuid';
import { IMG_BASE_URL } from '../../data/topics';

function PreviewQuizMode({ questions, setQuestions, setMode }) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'student'
  const [previewQuestions, setPreviewQuestions] = useState(questions.length > 0 ? questions : []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

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

      setPreviewQuestions(parsedQuestions);
      setError(null);
      setUserAnswers({});
      setShowResults(false);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('XML parsing error:', err);
      setError(err.message || 'Failed to parse XML file. Please check the file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };

  const calculateScore = () => {
    let correct = 0;
    previewQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: previewQuestions.length };
  };

  // Overview View
  const renderOverview = () => {
    if (previewQuestions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No questions loaded. Upload an XML file to preview.</p>
        </div>
      );
    }

    const questionsByWeek = previewQuestions.reduce((acc, q) => {
      if (!acc[q.week]) acc[q.week] = [];
      acc[q.week].push(q);
      return acc;
    }, {});

    return (
      <div className="space-y-8">
        {Object.keys(questionsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).map(week => (
          <div key={week}>
            <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 rounded-lg mb-4">
              Week {week} ({questionsByWeek[week].length} questions)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionsByWeek[week].map((q, idx) => (
                <div key={q.id} className="bg-white rounded-lg shadow-lg p-4">
                  <div className="mb-2">
                    <img src={q.imageDataUrl} alt={`Question ${q.idnumber}`} className="w-full rounded" />
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">ID:</span> {q.idnumber}</p>
                    <p><span className="font-semibold">Paper:</span> {q.paper}</p>
                    <p><span className="font-semibold">Topic:</span> {q.mainTopic}</p>
                    <div className="mt-2 bg-green-100 border border-green-300 rounded px-3 py-2">
                      <p className="font-bold text-green-800">Answer: {q.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Student View
  const renderStudentView = () => {
    if (previewQuestions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No questions loaded. Upload an XML file to preview.</p>
        </div>
      );
    }

    if (showResults) {
      const { correct, total } = calculateScore();
      const percentage = Math.round((correct / total) * 100);

      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
            <div className={`text-6xl font-bold mb-4 ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {percentage}%
            </div>
            <p className="text-xl text-gray-700 mb-8">
              You got {correct} out of {total} questions correct
            </p>

            <div className="space-y-4 mb-8">
              {previewQuestions.map((q, idx) => {
                const isCorrect = userAnswers[q.id] === q.correctAnswer;
                const answered = userAnswers[q.id] !== undefined;

                return (
                  <div key={q.id} className={`border-2 ${isCorrect ? 'border-green-500 bg-green-50' : answered ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={q.imageDataUrl} alt={`Question ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                        <div className="text-left">
                          <p className="font-semibold">Question {idx + 1}</p>
                          <p className="text-sm text-gray-600">{q.paper} - {q.mainTopic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {answered ? (
                          <div>
                            <p className="text-sm">Your answer: <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{userAnswers[q.id]}</span></p>
                            {!isCorrect && <p className="text-sm">Correct answer: <span className="font-bold text-green-600">{q.correctAnswer}</span></p>}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Not answered</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetQuiz}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = previewQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / previewQuestions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {previewQuestions.length}</span>
            <span>{Object.keys(userAnswers).length} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">{currentQuestion.paper}</p>
                <p className="text-sm text-gray-600">{currentQuestion.mainTopic}</p>
              </div>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                ID: {currentQuestion.idnumber}
              </span>
            </div>
            <img src={currentQuestion.imageDataUrl} alt={`Question ${currentQuestionIndex + 1}`} className="w-full rounded-lg shadow-md" />
          </div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(option => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                className={`w-full p-4 rounded-lg border-2 text-left font-semibold transition-all ${
                  userAnswers[currentQuestion.id] === option
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentQuestionIndex === previewQuestions.length - 1 ? (
              <button
                onClick={submitQuiz}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(previewQuestions.length - 1, prev + 1))}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="bg-white shadow-md mb-6">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setMode('select')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h2 className="text-2xl font-bold text-gray-800">Preview Quiz</h2>

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" /> {previewQuestions.length > 0 ? 'Load Different' : 'Load XML'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {previewQuestions.length > 0 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => {
                  setViewMode('overview');
                  setShowResults(false);
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'overview'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => {
                  setViewMode('student');
                  setShowResults(false);
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'student'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Student View
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <X className="w-5 h-5 text-red-600 flex-shrink-0" />
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
        </div>
      )}

      {isLoading && (
        <div className="container mx-auto px-4 text-center py-12">
          <p className="text-purple-600 text-lg font-medium">Loading XML file...</p>
        </div>
      )}

      {!isLoading && previewQuestions.length === 0 && (
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-12 text-center">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Questions Loaded</h3>
            <p className="text-gray-600 mb-6">Upload an XML file to preview your quiz in Overview or Student View mode</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Upload XML File
            </button>
          </div>
        </div>
      )}

      {!isLoading && previewQuestions.length > 0 && (
        <div className="container mx-auto px-4">
          {viewMode === 'overview' ? renderOverview() : renderStudentView()}
        </div>
      )}
    </div>
  );
}

export default PreviewQuizMode;
