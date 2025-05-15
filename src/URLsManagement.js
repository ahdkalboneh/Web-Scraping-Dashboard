import { useState } from 'react';
import { Globe, PlusCircle, PlayCircle, XCircle, Database, AlertCircle, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

function URLManagementPanel({
  urls,
  onAddUrl,
  onRemoveAllUrls,
  onStartScraping,
  scrapingResults,
  isScrapingError,
  errorMessage,
  projectName,
}) {
  const [newUrl, setNewUrl] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [paginationEnabled, setPaginationEnabled] = useState(true);

  const isAddButtonDisabled = !newUrl.trim() || !newCondition.trim();

  const handleAddClick = () => {
    if (newUrl.trim() && newCondition.trim()) {
        onAddUrl({ url: newUrl, conditions: newCondition });
        setNewUrl('');
        setNewCondition('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAddButtonDisabled) {
      handleAddClick();
    }
  };

  const togglePagination = () => {
    setPaginationEnabled(!paginationEnabled);
    if (!paginationEnabled) {
      setCurrentPage(1);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedUrls = paginationEnabled && urls
    ? urls.slice(startIndex, endIndex)
    : urls;

  const totalPages = urls ? Math.ceil(urls.length / itemsPerPage) : 1;

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (urls && urls.length === 0 && currentPage !== 1) {
    setCurrentPage(1);
  }

  const downloadAsCSV = (data, filename) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Title,Value", ...data.map(item => `${item.title},${item.value}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="mb-6">
         <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-200">
            URL Management: <span className="text-indigo-300">{projectName}</span>
          </h2>
          <div className="flex items-center space-x-2 bg-purple-800 bg-opacity-60 p-2 rounded-lg">
            <span className="text-sm">Pagination:</span>
            <button onClick={togglePagination} className="hover:bg-purple-700 p-1 rounded">
              {paginationEnabled ? (
                <ToggleRight size={22} className="text-green-400" />
              ) : (
                <ToggleLeft size={22} className="text-purple-400" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-purple-800 bg-opacity-60 p-4 rounded-lg shadow-lg mb-6 border border-purple-700">
          <h3 className="text-lg font-medium mb-3 text-purple-200">Add New URL</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="new-url-input" className="block text-purple-300 text-sm mb-1">URL <span className="text-red-400">*</span></label>
              <input
                id="new-url-input"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 rounded-md bg-purple-700 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label htmlFor="new-condition-input" className="block text-purple-300 text-sm mb-1">Scraping Conditions <span className="text-red-400">*</span></label>
              <input
                id="new-condition-input"
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g., title, price, description"
                className="w-full p-2 rounded-md bg-purple-700 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                onKeyDown={handleKeyPress}
                required
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleAddClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  isAddButtonDisabled
                    ? 'bg-purple-800 text-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
                disabled={isAddButtonDisabled}
              >
                <PlusCircle size={16} />
                <span>Add URL</span>
              </button>

               <button
                onClick={onRemoveAllUrls}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    !urls || urls.length === 0
                    ? 'bg-purple-900 text-purple-500 cursor-not-allowed'
                    : 'bg-purple-700 hover:bg-purple-600 text-white'
                }`}
                disabled={!urls || urls.length === 0}
              >
                <XCircle size={16} />
                <span>Remove URLs</span>
              </button>

              <button
                onClick={onStartScraping}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    !urls || urls.length === 0
                    ? 'bg-purple-900 text-purple-500 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
                disabled={!urls || urls.length === 0}
              >
                <PlayCircle size={16} />
                <span>Scrape</span>
              </button>
            </div>
             {isAddButtonDisabled && (newUrl.length > 0 || newCondition.length > 0) && (
                <p className="text-xs text-yellow-400 mt-2">Please fill in both URL and Scraping Conditions.</p>
            )}
          </div>
        </div>

        {isScrapingError && (
          <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg border border-red-700 mb-6">
            <div className="flex items-center text-red-300">
              <AlertCircle className="mr-2" size={20} />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {scrapingResults && (
          <div className="bg-indigo-900 bg-opacity-40 p-4 rounded-lg border border-indigo-700 mb-6">
            <h3 className="text-lg font-medium mb-3 text-indigo-200 flex items-center">
              <Database className="mr-2" size={18} />
              Scraping Results
            </h3>
            <div className="space-y-4">
              {scrapingResults.map((result, resultIndex) => {
                const conditionsArray = result.conditions.split(',').map(c => c.trim());
                return (
                  <div key={resultIndex} className="bg-indigo-800 bg-opacity-50 p-3 rounded-lg border border-indigo-700">
                    <div className="font-medium text-indigo-200 mb-2 break-all">{result.url}</div>
                    <div className="text-sm text-indigo-300 mb-2">Conditions: {result.conditions}</div>
                    <div className="bg-indigo-900 p-2 rounded-md overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-indigo-300 border-b border-indigo-700">
                            <th className="text-left py-1 px-2">#</th>
                            {conditionsArray.map((condition, idx) => (
                              <th key={idx} className="text-left py-1 px-2">{condition}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.results.reduce((rows, item, idx) => {
                            const rowIndex = Math.floor(idx / conditionsArray.length);
                            if (!rows[rowIndex]) rows[rowIndex] = { index: rowIndex };
                            const columnIndex = idx % conditionsArray.length;
                            rows[rowIndex][conditionsArray[columnIndex]] = item.value;
                            return rows;
                          }, []).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-indigo-800 text-indigo-200">
                              <td className="py-1 px-2">{rowIdx + 1}</td>
                              {conditionsArray.map((condition, colIdx) => (
                                <td key={colIdx} className="py-1 px-2">{row[condition] || ''}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex space-x-3 mt-3">
                        <button
                          onClick={() => downloadAsCSV(result.results, `scraping_${result.url.replace(/[^a-zA-Z0-9]/g, '_')}_${resultIndex + 1}.csv`)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-sm">
                          Download CSV
                        </button>
                        <button
                          onClick={() => downloadAsJSON(result.results, `scraping_${result.url.replace(/[^a-zA-Z0-9]/g, '_')}_${resultIndex + 1}.json`)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-sm">
                          Download JSON
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {urls && urls.length > 0 && (
          <>
            <h3 className="text-lg font-medium mb-3 text-purple-200">URL List ({urls.length} total)</h3>
            <div className="space-y-4 mb-6">
              {displayedUrls.map(url => (
                <div key={url.id} className="bg-purple-800 bg-opacity-40 p-4 rounded-lg shadow-md border border-purple-700 flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                     <div className="font-medium text-purple-200 truncate" title={url.url}>{url.url}</div>
                     <div className="text-sm text-purple-300 truncate" title={url.conditions}>Conditions: {url.conditions}</div>
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        url.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                        url.status === 'completed' ? 'bg-green-800 text-green-200' :
                        'bg-red-800 text-red-200'
                      }`}>
                        {url.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {paginationEnabled && urls.length > itemsPerPage && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-purple-800 text-purple-500 cursor-not-allowed'
                      : 'bg-purple-700 hover:bg-purple-600 text-white'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center px-3 bg-purple-800 bg-opacity-60 rounded-md">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-purple-800 text-purple-500 cursor-not-allowed'
                      : 'bg-purple-700 hover:bg-purple-600 text-white'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {(!urls || urls.length === 0) && !isScrapingError && !scrapingResults && (
          <div className="bg-purple-800 bg-opacity-30 p-8 rounded-lg text-center border border-purple-700">
            <Globe size={40} className="mx-auto text-purple-400 mb-4" />
            <p className="text-purple-300">No URLs added to project "{projectName}" yet.</p>
            <p className="text-purple-400">Add URLs with scraping conditions above to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default URLManagementPanel;