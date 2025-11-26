import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '../icons';
import { generateUUID } from '../../utils/uuid';
import { IMG_BASE_URL, topicsData } from '../../data/topics';

function BulkMetadataEntry({ bulkImages, setBulkStage, setQuestions, globalMetadata, setGlobalMetadata }) {
  const [questionsData, setQuestionsData] = useState(
    bulkImages.map((img, idx) => ({
      id: idx,
      image: img,
      correctAnswer: '',
      week: '',
      year: '',
      paper: '',
      mainTopic: '',
      subTopic1: '',
      subTopic2: ''
    }))
  );

  const updateQuestion = (id, field, value) => {
    setQuestionsData(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const applyGlobalToAll = () => {
    setQuestionsData(prev => prev.map(q => ({
      ...q,
      paper: globalMetadata.paper || q.paper,
      mainTopic: globalMetadata.mainTopic || q.mainTopic,
      subTopic1: globalMetadata.subTopic1 || q.subTopic1
    })));
  };

  const handleSubmit = () => {
    const incomplete = questionsData.find(q => !q.correctAnswer || !q.week || !q.year || !q.paper || !q.mainTopic || !q.subTopic1);
    if (incomplete) {
      alert('Please fill in all required fields for all questions');
      return;
    }

    const baseTimestamp = Math.floor(Date.now() / 1000);
    const newQuestions = questionsData.map((q, index) => {
      const timestamp = baseTimestamp + index;
      const uniqueId = generateUUID();
      const fileExtension = q.image.file.name.split('.').pop() || 'png';
      const fileName = `${timestamp}_${uniqueId.slice(0, 8)}.${fileExtension}`;

      return {
        id: uniqueId,
        idnumber: timestamp.toString(),
        generatedImageFileName: fileName,
        imgUrl: IMG_BASE_URL + fileName,
        imageDataUrl: q.image.dataUrl,
        imageBase64: q.image.dataUrl.split(',')[1],
        originalImageFileName: q.image.name,
        correctAnswer: q.correctAnswer,
        week: q.week,
        year: q.year,
        paper: q.paper,
        mainTopic: q.mainTopic,
        subTopic1: q.subTopic1,
        subTopic2: q.subTopic2 || ''
      };
    });

    setQuestions(prev => [...prev, ...newQuestions]);
    setBulkStage('preview');
  };

  return (
    <div className="container mx-auto px-4 pb-12 max-w-7xl">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Global Settings (Optional)</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <select
            value={globalMetadata.paper}
            onChange={(e) => {
              setGlobalMetadata({
                paper: e.target.value,
                mainTopic: '',
                subTopic1: ''
              });
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Paper *</option>
            {Object.keys(topicsData).map(paper => (
              <option key={paper} value={paper}>{paper}</option>
            ))}
          </select>
          
          <select
            value={globalMetadata.mainTopic}
            onChange={(e) => {
              setGlobalMetadata(prev => ({
                ...prev,
                mainTopic: e.target.value,
                subTopic1: ''
              }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            disabled={!globalMetadata.paper}
          >
            <option value="">Select Main Topic *</option>
            {globalMetadata.paper && Object.keys(topicsData[globalMetadata.paper] || {}).map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <select
            value={globalMetadata.subTopic1}
            onChange={(e) => {
              setGlobalMetadata(prev => ({
                ...prev,
                subTopic1: e.target.value
              }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            disabled={!globalMetadata.mainTopic}
          >
            <option value="">Select Sub Topic 1 *</option>
            {globalMetadata.paper && globalMetadata.mainTopic && 
             topicsData[globalMetadata.paper]?.[globalMetadata.mainTopic]?.subTopic1List.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        <button
          onClick={applyGlobalToAll}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Apply to All Questions
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Answer*</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Week*</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Year*</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Paper*</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Main Topic*</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Sub Topic 1*</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Sub Topic 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questionsData.map((q, idx) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <img src={q.image.dataUrl} alt="" className="w-20 h-16 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">-</option>
                      {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={q.week}
                      onChange={(e) => updateQuestion(q.id, 'week', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={q.year}
                      onChange={(e) => updateQuestion(q.id, 'year', e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.paper}
                      onChange={(e) => updateQuestion(q.id, 'paper', e.target.value)}
                      className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">-</option>
                      {Object.keys(topicsData).map(paper => (
                        <option key={paper} value={paper}>{paper}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.mainTopic}
                      onChange={(e) => updateQuestion(q.id, 'mainTopic', e.target.value)}
                      className="w-40 px-2 py-1 border border-gray-300 rounded text-sm"
                      disabled={!q.paper}
                    >
                      <option value="">-</option>
                      {q.paper && Object.keys(topicsData[q.paper] || {}).map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.subTopic1}
                      onChange={(e) => updateQuestion(q.id, 'subTopic1', e.target.value)}
                      className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                      disabled={!q.mainTopic}
                    >
                      <option value="">-</option>
                      {q.paper && q.mainTopic && topicsData[q.paper]?.[q.mainTopic]?.subTopic1List.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.subTopic2}
                      onChange={(e) => updateQuestion(q.id, 'subTopic2', e.target.value)}
                      className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                      disabled={!q.subTopic1}
                    >
                      <option value="">-</option>
                      {q.paper && q.mainTopic && topicsData[q.paper]?.[q.mainTopic]?.subTopic1List
                        .filter(sub => sub !== q.subTopic1)
                        .map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setBulkStage('upload')}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Images
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
        >
          Preview Questions <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default BulkMetadataEntry;
