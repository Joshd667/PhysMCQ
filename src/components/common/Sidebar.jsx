import { X, Download } from '../icons';
import QuestionCard from './QuestionCard';
import { generateMoodleXML } from '../../utils/xmlGenerator';

function Sidebar({ 
  showSidebar, 
  setShowSidebar, 
  questions, 
  questionsByWeek, 
  selectedQuestionId, 
  selectQuestion 
}) {
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

  return (
    <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
      <div className="p-6 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Questions</h3>
          <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No questions uploaded yet</p>
        ) : (
          <div>
            {Object.keys(questionsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).map(week => (
              <div key={week} className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2 px-2">
                  Week {week} ({questionsByWeek[week].length} questions)
                </h4>
                {questionsByWeek[week]
                  .sort((a, b) => parseInt(a.idnumber) - parseInt(b.idnumber))
                  .map(q => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      isSelected={selectedQuestionId === q.id}
                      onClick={() => selectQuestion(q.id)}
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
        {questions.length > 0 && (
          <button
            onClick={downloadXML}
            className="w-full mt-6 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download XML
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
