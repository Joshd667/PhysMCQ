import { topicsData } from '../../data/topics';

function TopicSelectors({ currentQuestion, setCurrentQuestion, validationErrors = {}, setValidationErrors = () => {} }) {
  const papers = Object.keys(topicsData);
  const mainTopics = currentQuestion.paper ? Object.keys(topicsData[currentQuestion.paper] || {}) : [];
  const subTopic1List = currentQuestion.paper && currentQuestion.mainTopic
    ? topicsData[currentQuestion.paper]?.[currentQuestion.mainTopic]?.subTopic1List || []
    : [];
  const subTopic2List = subTopic1List.filter(s => s !== currentQuestion.subTopic1);

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Paper *</label>
        <select
          value={currentQuestion.paper}
          onChange={(e) => {
            setCurrentQuestion(prev => ({ ...prev, paper: e.target.value, mainTopic: '', subTopic1: '', subTopic2: '' }));
            setValidationErrors(prev => ({ ...prev, paper: null }));
          }}
          className={`w-full px-3 py-2 border ${validationErrors.paper ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
        >
          <option value="">Select Paper</option>
          {papers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {validationErrors.paper && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.paper}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Main Topic *</label>
        <select
          value={currentQuestion.mainTopic}
          onChange={(e) => {
            setCurrentQuestion(prev => ({ ...prev, mainTopic: e.target.value, subTopic1: '', subTopic2: '' }));
            setValidationErrors(prev => ({ ...prev, mainTopic: null }));
          }}
          className={`w-full px-3 py-2 border ${validationErrors.mainTopic ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          disabled={!currentQuestion.paper}
        >
          <option value="">Select Main Topic</option>
          {mainTopics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {validationErrors.mainTopic && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.mainTopic}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sub Topic 1 *</label>
        <select
          value={currentQuestion.subTopic1}
          onChange={(e) => {
            setCurrentQuestion(prev => ({ ...prev, subTopic1: e.target.value, subTopic2: '' }));
            setValidationErrors(prev => ({ ...prev, subTopic1: null }));
          }}
          className={`w-full px-3 py-2 border ${validationErrors.subTopic1 ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          disabled={!currentQuestion.mainTopic}
        >
          <option value="">Select Sub Topic 1</option>
          {subTopic1List.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {validationErrors.subTopic1 && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.subTopic1}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sub Topic 2 (Optional)</label>
        <select
          value={currentQuestion.subTopic2}
          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, subTopic2: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={!currentQuestion.subTopic1}
        >
          <option value="">Select Sub Topic 2</option>
          {subTopic2List.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </>
  );
}

export default TopicSelectors;
