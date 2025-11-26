import { Upload, Edit, List, Eye } from '../icons';

function ModeSelector({ setMode }) {
  const modes = [
    {
      id: 'single',
      title: 'Question by Question',
      description: 'Add questions one at a time with full control',
      icon: <Edit />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'bulk',
      title: 'Bulk Upload',
      description: 'Upload multiple images and add metadata in a table',
      icon: <Upload />,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'edit',
      title: 'Edit Existing',
      description: 'Import XML file and edit questions',
      icon: <List />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'preview',
      title: 'Preview Quiz',
      description: 'Upload XML and preview in Overview or Student View',
      icon: <Eye />,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">Moodle Question Uploader</h1>
        <p className="text-gray-600 text-center mb-12">Choose your workflow</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modes.map((modeOption) => (
            <button
              key={modeOption.id}
              onClick={() => setMode(modeOption.id)}
              className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${modeOption.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${modeOption.color} text-white mb-4`}>
                  {modeOption.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{modeOption.title}</h3>
                <p className="text-gray-600 text-sm">{modeOption.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModeSelector;
