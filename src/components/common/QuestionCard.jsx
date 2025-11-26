function QuestionCard({ question, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`question-card ${isSelected ? 'selected' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-sm">ID {question.idnumber} - {question.paper}</p>
          <p className="text-xs text-gray-600 mt-1">{question.mainTopic}</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">Answer: {question.correctAnswer}</p>
        </div>
        <div className="text-xs text-gray-400">{question.year}</div>
      </div>
    </div>
  );
}

export default QuestionCard;
