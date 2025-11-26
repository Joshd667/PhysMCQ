import { useMemo } from 'react';
import { Download } from '../icons';
import { generateMoodleXML } from '../../utils/xmlGenerator';

function BulkPreview({ questions, setBulkStage, setMode }) {
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

  return (
    <div className="container mx-auto px-4 pb-12 max-w-6xl">
      <div className="flex justify-end gap-4 mb-8">
        <button
          onClick={() => setBulkStage('metadata')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Edit Metadata
        </button>
        <button
          onClick={downloadXML}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> Download XML
        </button>
      </div>

      {Object.keys(questionsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).map(week => (
        <div key={week} className="mb-8">
          <h3 className="text-2xl font-bold text-gray-700 mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg">
            Week {week} ({questionsByWeek[week].length} questions)
          </h3>
          <div className="space-y-4">
            {questionsByWeek[week].map((q, idx) => (
              <div key={q.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <img src={q.imageDataUrl} alt="" className="w-64 rounded-lg" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <h4 className="text-xl font-bold text-gray-800">Question ID: {q.idnumber}</h4>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Answer: {q.correctAnswer}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="font-semibold">Paper:</span> {q.paper}</p>
                      <p><span className="font-semibold">Year:</span> {q.year}</p>
                      <p className="col-span-2"><span className="font-semibold">Main Topic:</span> {q.mainTopic}</p>
                      <p className="col-span-2"><span className="font-semibold">Sub Topic 1:</span> {q.subTopic1}</p>
                      {q.subTopic2 && <p className="col-span-2"><span className="font-semibold">Sub Topic 2:</span> {q.subTopic2}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BulkPreview;
