import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Upload, ArrowLeft, ChevronLeft, ChevronRight, Undo, Redo } from '../icons';
import TopicSelectors from '../common/TopicSelectors';
import Sidebar from '../common/Sidebar';
import { generateUUID } from '../../utils/uuid';
import { compressImage } from '../../utils/imageUtils';
import { generateMoodleXML } from '../../utils/xmlGenerator';
import { IMG_BASE_URL } from '../../data/topics';

function SingleQuestionMode({ questions, setQuestions, setMode, undo, redo, canUndo, canRedo }) {
  const [currentQuestion, setCurrentQuestion] = useState({
    image: null,
    imageDataUrl: '',
    correctAnswer: '',
    week: '',
    year: '',
    paper: '',
    mainTopic: '',
    subTopic1: '',
    subTopic2: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setCurrentQuestion(prev => ({
          ...prev,
          image: compressed.file,
          imageDataUrl: compressed.dataUrl
        }));
        setValidationErrors(prev => ({ ...prev, image: null }));
      } catch (error) {
        console.error('Image compression failed:', error);
        // Fallback to uncompressed
        const reader = new FileReader();
        reader.onload = (e) => {
          setCurrentQuestion(prev => ({
            ...prev,
            image: file,
            imageDataUrl: e.target.result
          }));
          setValidationErrors(prev => ({ ...prev, image: null }));
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        handleImageUpload(file);
        e.preventDefault();
        break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const getSortedQuestions = () => {
    return [...questions].sort((a, b) => {
      if (a.week !== b.week) return parseInt(a.week) - parseInt(b.week);
      return parseInt(a.idnumber) - parseInt(b.idnumber);
    });
  };

  const sortedQuestions = useMemo(() => getSortedQuestions(), [questions]);

  const validateQuestion = useCallback(() => {
    const errors = {};
    if (!currentQuestion.image) {
      errors.image = 'Please add an image';
    }
    if (!currentQuestion.correctAnswer) {
      errors.correctAnswer = 'Please select the correct answer';
    }
    if (!currentQuestion.week) {
      errors.week = 'Week is required';
    }
    if (!currentQuestion.year) {
      errors.year = 'Year is required';
    }
    if (!currentQuestion.paper) {
      errors.paper = 'Paper is required';
    }
    if (!currentQuestion.mainTopic) {
      errors.mainTopic = 'Main topic is required';
    }
    if (!currentQuestion.subTopic1) {
      errors.subTopic1 = 'Sub topic 1 is required';
    }
    return errors;
  }, [currentQuestion]);

  const getCurrentQuestionIndex = () => {
    if (!selectedQuestionId) return -1;
    const sorted = getSortedQuestions();
    return sorted.findIndex(q => q.id === selectedQuestionId);
  };

  const navigateToPreviousQuestion = () => {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex > 0) {
      const sorted = getSortedQuestions();
      selectQuestion(sorted[currentIndex - 1].id);
    }
  };

  const navigateToNextQuestion = () => {
    const currentIndex = getCurrentQuestionIndex();
    const sorted = getSortedQuestions();
    if (currentIndex < sorted.length - 1) {
      selectQuestion(sorted[currentIndex + 1].id);
    }
  };

  const handleSubmit = () => {
    const errors = validateQuestion();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const timestamp = Math.floor(Date.now() / 1000);
    const uniqueId = generateUUID();
    const fileExtension = currentQuestion.image.name.split('.').pop() || 'png';
    const fileName = `${timestamp}_${uniqueId.slice(0, 8)}.${fileExtension}`;

    const newQuestion = {
      id: uniqueId,
      idnumber: timestamp.toString(),
      generatedImageFileName: fileName,
      imgUrl: IMG_BASE_URL + fileName,
      imageDataUrl: currentQuestion.imageDataUrl,
      imageBase64: currentQuestion.imageDataUrl.split(',')[1],
      originalImageFileName: currentQuestion.image.name,
      correctAnswer: currentQuestion.correctAnswer,
      week: currentQuestion.week,
      year: currentQuestion.year,
      paper: currentQuestion.paper,
      mainTopic: currentQuestion.mainTopic,
      subTopic1: currentQuestion.subTopic1,
      subTopic2: currentQuestion.subTopic2 || ''
    };

    if (editingId) {
      setQuestions(prev => prev.map(q => q.id === editingId ? { ...newQuestion, id: editingId, idnumber: q.idnumber } : q));
      setEditingId(null);
      setSelectedQuestionId(null);
    } else {
      setQuestions(prev => [...prev, newQuestion]);
    }

    setCurrentQuestion(prev => ({
      ...prev,
      image: null,
      imageDataUrl: '',
      correctAnswer: ''
    }));
  };

  const selectQuestion = (questionId) => {
    setSelectedQuestionId(questionId);
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
      setCurrentQuestion({
        image: { name: question.originalImageFileName },
        imageDataUrl: question.imageDataUrl,
        correctAnswer: question.correctAnswer,
        week: question.week,
        year: question.year,
        paper: question.paper,
        mainTopic: question.mainTopic,
        subTopic1: question.subTopic1,
        subTopic2: question.subTopic2
      });
      setEditingId(question.id);
      setShowSidebar(false);
    }
  };

  const downloadXML = () => {
    const xmlContent = generateMoodleXML(questions);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const questionsByWeek = useMemo(() => {
    return questions.reduce((acc, q) => {
      if (!acc[q.week]) acc[q.week] = [];
      acc[q.week].push(q);
      return acc;
    }, {});
  }, [questions]);

  const currentIndex = getCurrentQuestionIndex();
  const totalQuestions = questions.length;

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

            <h2 className="text-2xl font-bold text-gray-800">Add Questions</h2>

            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" /> Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" /> Redo
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                {showSidebar ? 'Hide' : 'Show'} Questions ({questions.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        questions={questions}
        questionsByWeek={questionsByWeek}
        selectedQuestionId={selectedQuestionId}
        selectQuestion={selectQuestion}
      />

      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        {/* Current Question Status */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={navigateToPreviousQuestion}
              disabled={currentIndex <= 0 || !selectedQuestionId}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center flex-1">
              {editingId && selectedQuestionId ? (
                <div>
                  <div className="font-bold">
                    Editing: Week {currentQuestion.week}, ID {questions.find(q => q.id === editingId)?.idnumber}
                  </div>
                  <div className="text-sm mt-1 opacity-90">
                    Question {currentIndex + 1} of {totalQuestions}
                  </div>
                </div>
              ) : currentQuestion.week ? (
                <div>
                  <div className="font-bold">Ready to add question for Week {currentQuestion.week}</div>
                  <div className="text-sm mt-1 opacity-90">
                    Total questions in Week {currentQuestion.week}: {questionsByWeek[currentQuestion.week]?.length || 0}
                  </div>
                </div>
              ) : (
                <div className="font-bold">Ready to add questions</div>
              )}
            </div>
            <button
              onClick={navigateToNextQuestion}
              disabled={currentIndex >= totalQuestions - 1 || !selectedQuestionId}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Image *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${validationErrors.image ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
              />
              {isCompressing ? (
                <div>
                  <p className="text-indigo-600 font-medium">Compressing image...</p>
                </div>
              ) : currentQuestion.imageDataUrl ? (
                <img src={currentQuestion.imageDataUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
              ) : (
                <div>
                  <div className="inline-block"><Upload /></div>
                  <p className="text-gray-600 mt-2">Click to upload or paste image (Ctrl/Cmd + V)</p>
                </div>
              )}
            </div>
            {validationErrors.image && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.image}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
            <div className="flex gap-4">
              {['A', 'B', 'C', 'D'].map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={option}
                    checked={currentQuestion.correctAnswer === option}
                    onChange={(e) => {
                      setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, correctAnswer: null }));
                    }}
                    className="mr-2"
                  />
                  <span className="font-medium">{option}</span>
                </label>
              ))}
            </div>
            {validationErrors.correctAnswer && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.correctAnswer}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Week *</label>
              <input
                type="number"
                value={currentQuestion.week}
                onChange={(e) => {
                  setCurrentQuestion(prev => ({ ...prev, week: e.target.value }));
                  setValidationErrors(prev => ({ ...prev, week: null }));
                }}
                className={`w-full px-3 py-2 border ${validationErrors.week ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
              {validationErrors.week && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.week}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <input
                type="number"
                value={currentQuestion.year}
                onChange={(e) => {
                  setCurrentQuestion(prev => ({ ...prev, year: e.target.value }));
                  setValidationErrors(prev => ({ ...prev, year: null }));
                }}
                className={`w-full px-3 py-2 border ${validationErrors.year ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
              {validationErrors.year && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.year}</p>
              )}
            </div>
          </div>

          <TopicSelectors
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />

          <button
            onClick={handleSubmit}
            className={`w-full ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-3 rounded-lg font-semibold transition-colors`}
          >
            {editingId ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleQuestionMode;
