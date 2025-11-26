import { ArrowLeft } from '../icons';
import BulkImageUpload from '../bulk/BulkImageUpload';
import BulkMetadataEntry from '../bulk/BulkMetadataEntry';
import BulkPreview from '../bulk/BulkPreview';

function BulkMode({ questions, setQuestions, setMode, bulkStage, setBulkStage, bulkImages, setBulkImages, globalMetadata, setGlobalMetadata }) {
  const renderStage = () => {
    switch (bulkStage) {
      case 'upload':
        return <BulkImageUpload bulkImages={bulkImages} setBulkImages={setBulkImages} setBulkStage={setBulkStage} />;
      case 'metadata':
        return <BulkMetadataEntry 
          bulkImages={bulkImages} 
          setBulkStage={setBulkStage} 
          setQuestions={setQuestions}
          globalMetadata={globalMetadata}
          setGlobalMetadata={setGlobalMetadata}
        />;
      case 'preview':
        return <BulkPreview questions={questions} setBulkStage={setBulkStage} setMode={setMode} />;
      default:
        return null;
    }
  };

  const getStageTitle = () => {
    switch (bulkStage) {
      case 'upload': return 'Bulk Upload - Add Images';
      case 'metadata': return 'Bulk Upload - Add Metadata';
      case 'preview': return 'Bulk Upload - Preview';
      default: return 'Bulk Upload';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md mb-6">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (bulkStage === 'upload') {
                  setMode('select');
                } else {
                  setBulkStage('upload');
                  setBulkImages([]);
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h2 className="text-2xl font-bold text-gray-800">{getStageTitle()}</h2>

            <div className="w-32"></div>
          </div>
        </div>
      </div>
      {renderStage()}
    </div>
  );
}

export default BulkMode;
