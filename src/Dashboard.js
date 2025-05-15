import { useState, useEffect } from 'react';
import { MessageCircle, Globe, Settings, AlertCircle, ChevronDown,
         Database, Clock, Folder, Home } from 'lucide-react';
import URLManagement from './URLsManagement';
import ChatPanel from './ChatPanel';
import HistoryPanel from './History';
import SettingsModal from './SettingsModal';
import ProjectsPanel from './ProjectsPanel';
import RagPromptModal from './RagPromptModal';

function WebScrapingDashboard() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const [activeTab, setActiveTab] = useState('projects');
  const [selectedAiModel, setSelectedAiModel] = useState('gpt-4o-mini');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isRagPromptModalOpen, setIsRagPromptModalOpen] = useState(false);
  const [projectToPromptRagId, setProjectToPromptRagId] = useState(null);

  const aiModels = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, more efficient version' },
    { id: 'gemini/gemini-2.0-flash', name: 'gemini/gemini-2.0-flash', description: 'Google\'s multimodal AI model' }
  ];

  const getSelectedModelName = () => {
    const model = aiModels.find(model => model.id === selectedAiModel);
    return model ? model.name : 'Unknown Model';
  };

  const handleAddProject = (projectName) => {
    const newProject = {
      id: Date.now(),
      name: projectName,
      urls: [],
      scrapingResults: null,
      isScrapingError: false,
      errorMessage: '',
      history: [],
      createdAt: new Date().toISOString(),
      ragStatus: 'unprompted',
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
    setActiveProjectId(newProject.id);
    setActiveTab('urls');
  };

  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    setActiveTab('urls');
  };

  const handleDeleteProject = (projectId) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
      setActiveTab('projects');
    }
  };

  const updateProjectById = (projectId, updates) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, ...updates } : p
      )
    );
  };

  const handleUpdateProjectName = (projectId, newName) => {
    updateProjectById(projectId, { name: newName.trim() });
  };


  const handleRagDecision = (projectId, decision) => {
    updateProjectById(projectId, { ragStatus: decision });
    setIsRagPromptModalOpen(false);
    setProjectToPromptRagId(null);
    if (decision === 'enabled') {
      console.log(`RAG enabled for project ${projectId}. All existing and future data will be considered for RAG.`);
    }
  };

  const handleSendMessage = (userMessage, modelName, addSystemResponseCallback) => {
      let responseText = `Processing your request with ${modelName}: "${userMessage}"`;
      if (activeProject && activeProject.ragStatus === 'enabled') {
        responseText += ` (Using RAG with scraped content from project: ${activeProject.name})`;
      }
      addSystemResponseCallback(responseText);
  };

  const handleAddUrl = (newUrlData) => {
    if (!activeProject) return;
    const newId = (activeProject.urls.length > 0 ? Math.max(...activeProject.urls.map(u => u.id)) : 0) + 1;
    const newUrlEntry = {
        id: newId,
        url: newUrlData.url,
        status: "pending",
        conditions: newUrlData.conditions
    };
    updateProjectById(activeProjectId, {
        urls: [...activeProject.urls, newUrlEntry],
        isScrapingError: false,
        errorMessage: ''
    });
  };

  const handleRemoveAllUrls = () => {
    if (!activeProject) return;
    updateProjectById(activeProjectId, {
        urls: [],
        scrapingResults: null,
        isScrapingError: false,
        errorMessage: '',
    });
  };

  const handleStartScraping = () => {
    if (!activeProject) return;

    let baseUpdates = {
      scrapingResults: null,
      isScrapingError: false,
      errorMessage: '',
    };

    if (activeProject.urls.length === 0) {
      updateProjectById(activeProjectId, {
        ...baseUpdates,
        isScrapingError: true,
        errorMessage: 'No URLs to scrape. Please add at least one URL to the project.',
      });
      return;
    }

    const urlsWithoutConditions = activeProject.urls.filter(url => !url.conditions || url.conditions.trim() === "");
    if (urlsWithoutConditions.length > 0) {
      updateProjectById(activeProjectId, {
        ...baseUpdates,
        isScrapingError: true,
        errorMessage: 'Error: Some URLs seem to be missing scraping conditions.',
      });
      console.error("Attempted to scrape with missing conditions:", urlsWithoutConditions);
      return;
    }

    const updatedUrlsForProject = activeProject.urls.map(url => ({ ...url, status: "completed" }));
    const mockResultsForProject = updatedUrlsForProject.map(url => ({
      url: url.url,
      conditions: url.conditions,
      results: [
        { title: "Title Example 1", value: "Value " + Math.floor(Math.random() * 100) },
        { title: "Price Example", value: "$" + (Math.random() * 100).toFixed(2) },
        { title: "Description Snippet", value: "Lorem ipsum dolor..." }
      ]
    }));

    const timestamp = new Date().toISOString();
    const newHistoryId = (activeProject.history.length > 0 ? Math.max(...activeProject.history.map(h => h.id)) : 0) + 1;
    const newHistoryItem = {
      id: newHistoryId,
      timestamp: timestamp,
      url: updatedUrlsForProject.length === 1 ? updatedUrlsForProject[0].url : `${updatedUrlsForProject.length} URLs scraped`,
      dataSize: (Math.random() * 5).toFixed(1) + " MB",
      itemsScraped: updatedUrlsForProject.length * 3,
      status: "completed"
    };
    
    const finalUpdatesForScraping = {
      ...baseUpdates,
      urls: updatedUrlsForProject,
      scrapingResults: mockResultsForProject,
      history: [newHistoryItem, ...activeProject.history],
    };

    setProjects(prevProjects => {
        const newProjects = prevProjects.map(p =>
            p.id === activeProjectId ? { ...p, ...finalUpdatesForScraping } : p
        );
        const projectAfterUpdate = newProjects.find(p => p.id === activeProjectId);
        if (projectAfterUpdate && (projectAfterUpdate.ragStatus === 'unprompted' || projectAfterUpdate.ragStatus === 'prompt_later')) {
            setProjectToPromptRagId(activeProjectId);
            setIsRagPromptModalOpen(true);
        }
        return newProjects;
    });
  };

  const handleDeleteHistoryItem = (historyItemId) => {
    if (!activeProject) return;
    const updatedHistory = activeProject.history.filter(item => item.id !== historyItemId);
    updateProjectById(activeProjectId, { history: updatedHistory });
  };

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  useEffect(() => {
    if (!activeProjectId && activeTab !== 'projects' && activeTab !== 'settings') {
      setActiveTab('projects');
    }
    if (activeProjectId && activeTab === 'projects') {
        setActiveTab('urls');
    }
  }, [activeProjectId, activeTab]);

  const renderActivePanel = () => {
    const currentActiveProject = projects.find(p => p.id === activeProjectId);

    if (!currentActiveProject && activeTab !== 'projects' && activeTab !== 'settings') {
      return <ProjectsPanel 
                projects={projects} 
                onAddProject={handleAddProject} 
                onSelectProject={handleSelectProject} 
                onDeleteProject={handleDeleteProject} 
                onUpdateProjectName={handleUpdateProjectName}
                activeProjectId={activeProjectId} 
              />;
    }

    switch (activeTab) {
      case 'projects':
        return (
          <ProjectsPanel
            projects={projects}
            onAddProject={handleAddProject}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
            onUpdateProjectName={handleUpdateProjectName}
            activeProjectId={activeProjectId}
          />
        );
      case 'urls':
        return currentActiveProject ? (
          <URLManagement
            key={currentActiveProject.id + '-urls'}
            urls={currentActiveProject.urls}
            scrapingResults={currentActiveProject.scrapingResults}
            isScrapingError={currentActiveProject.isScrapingError}
            errorMessage={currentActiveProject.errorMessage}
            onAddUrl={handleAddUrl}
            onRemoveAllUrls={handleRemoveAllUrls}
            onStartScraping={handleStartScraping}
            projectName={currentActiveProject.name}
          />
        ) : (<div className="p-6 text-center text-purple-300">Please select or create a project to manage URLs.</div>);
      case 'chat':
        return currentActiveProject ? (
           <ChatPanel
             key={currentActiveProject.id + '-chat'}
             isRagMode={currentActiveProject.ragStatus === 'enabled'}
             selectedModelName={getSelectedModelName()}
             onSendMessage={handleSendMessage}
             projectName={currentActiveProject.name}
            />
        ) : (<div className="p-6 text-center text-purple-300">Please select a project to use the chat.</div>);
      case 'history':
        return currentActiveProject ? (
            <HistoryPanel
              key={currentActiveProject.id + '-history'}
              scrapingHistory={currentActiveProject.history}
              projectName={currentActiveProject.name}
              onDeleteHistoryItem={handleDeleteHistoryItem}
            />
        ) : (<div className="p-6 text-center text-purple-300">Please select a project to view its history.</div>);
      default:
        if (activeTab !== 'settings') {
            setActiveTab('projects');
        }
        return null;
    }
  };

  const navigateToProjects = () => {
    setActiveProjectId(null);
    setActiveTab('projects');
  };
  
  const projectForModal = projects.find(p => p.id === projectToPromptRagId);

  return (
    <div className="flex flex-col h-screen bg-purple-900 text-white">
      <header className="bg-purple-800 p-4 shadow-lg border-b border-purple-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="text-purple-300" size={24} />
            <h1 className="text-2xl font-bold text-purple-200">
                Web Scraper {activeProject ? `/ ${activeProject.name}` : '/ Projects'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="bg-purple-700 hover:bg-purple-600 p-2 rounded-lg flex items-center space-x-2"
              >
                <Database size={16} className="text-purple-300 mr-1" />
                <span>AI: {getSelectedModelName()}</span>
                <ChevronDown size={16} />
              </button>
              {isModelDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-purple-800 rounded-lg shadow-xl border border-purple-600 z-20">
                  <div className="p-2">
                    <h3 className="text-sm font-semibold text-purple-300 mb-2 px-2">Select AI Model</h3>
                    {aiModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedAiModel(model.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-md flex flex-col ${
                          selectedAiModel === model.id
                            ? 'bg-indigo-700'
                            : 'hover:bg-purple-700'
                        }`}
                      >
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-purple-300">{model.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={openSettingsModal}
              className="bg-purple-700 hover:bg-purple-600 p-2 rounded-lg flex items-center space-x-2"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <div className="relative w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="font-bold">U</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 bg-purple-800 flex flex-col items-center py-4 border-r border-purple-700">
          <button
            onClick={navigateToProjects}
            className={`p-3 rounded-lg mb-4 ${activeTab === 'projects' && !activeProjectId ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
            title="Projects"
          >
            <Home size={20} className="text-purple-200" />
          </button>
          <button
            onClick={() => activeProjectId ? setActiveTab('urls') : alert("Please select or create a project first.")}
            className={`p-3 rounded-lg mb-4 ${activeTab === 'urls' && activeProjectId ? 'bg-purple-600' : 'hover:bg-purple-700'} ${!activeProjectId ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="URL Management"
            disabled={!activeProjectId}
          >
            <Globe size={20} className="text-purple-200" />
          </button>
          <button
            onClick={() => activeProjectId ? setActiveTab('chat') : alert("Please select or create a project first.")}
            className={`p-3 rounded-lg mb-4 ${activeTab === 'chat' && activeProjectId ? 'bg-purple-600' : 'hover:bg-purple-700'} ${!activeProjectId ? 'opacity-50 cursor-not-allowed' : ''}`}
             title="Chat"
             disabled={!activeProjectId}
          >
            <MessageCircle size={20} className="text-purple-200" />
          </button>
          <button
            onClick={() => activeProjectId ? setActiveTab('history') : alert("Please select or create a project first.")}
            className={`p-3 rounded-lg mb-4 ${activeTab === 'history' && activeProjectId ? 'bg-purple-600' : 'hover:bg-purple-700'} ${!activeProjectId ? 'opacity-50 cursor-not-allowed' : ''}`}
             title="History"
             disabled={!activeProjectId}
          >
            <Clock size={20} className="text-purple-200" />
          </button>
          <div className="flex-1"></div>
          <button className="p-3 rounded-lg hover:bg-purple-700" title="Help/Info">
            <AlertCircle size={20} className="text-purple-300" />
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-900 to-indigo-900 overflow-hidden relative">
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 3 + 'px',
                  height: Math.random() * 3 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.8
                }}
              ></div>
            ))}
          </div>
           <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
             {renderActivePanel()}
           </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
      />
      {projectForModal && (
        <RagPromptModal
          isOpen={isRagPromptModalOpen && projectToPromptRagId === projectForModal.id}
          onClose={() => {
            if (projectForModal.ragStatus === 'unprompted') {
              handleRagDecision(projectForModal.id, 'prompt_later');
            } else {
               setIsRagPromptModalOpen(false); 
               setProjectToPromptRagId(null);
            }
          }}
          onDecision={(decision) => handleRagDecision(projectForModal.id, decision)}
          projectName={projectForModal.name}
        />
      )}
    </div>
  );
}

export default WebScrapingDashboard;