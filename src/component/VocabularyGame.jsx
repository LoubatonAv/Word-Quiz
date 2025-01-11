import { useState, useEffect } from "react";
import vocabularyPairs from "../data.js";

// Utility function to shuffle an array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const VocabularyGame = () => {
  const itemsPerPage = 10;
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [matches, setMatches] = useState(new Set());

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const totalPages = Math.ceil(vocabularyPairs.length / itemsPerPage);
    const newPages = [];

    // Split vocabulary pairs into pages
    for (let i = 0; i < totalPages; i++) {
      const pageStart = i * itemsPerPage;
      const pageEnd = Math.min(
        pageStart + itemsPerPage,
        vocabularyPairs.length
      );
      const pagePairs = vocabularyPairs.slice(pageStart, pageEnd);

      // Shuffle words and translations
      const words = shuffleArray(
        pagePairs.map((pair) => ({
          text: pair.word,
          type: "word",
        }))
      );
      const translations = shuffleArray(
        pagePairs.map((pair) => ({
          text: pair.translation,
          type: "translation",
        }))
      );

      // Store words and translations separately in the page object
      newPages.push({ words, translations });
    }

    setPages(newPages);
    setCurrentPage(0);
    setMatches(new Set());
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDrop = (targetItem) => {
    const itemToMatch = draggedItem || selectedItem;

    if (!itemToMatch || itemToMatch.text === targetItem.text) return;

    // Check if the dropped or clicked items form a correct pair
    const isMatch = vocabularyPairs.some(
      (pair) =>
        (itemToMatch.type === "word" &&
          targetItem.type === "translation" &&
          itemToMatch.text === pair.word &&
          targetItem.text === pair.translation) ||
        (itemToMatch.type === "translation" &&
          targetItem.type === "word" &&
          itemToMatch.text === pair.translation &&
          targetItem.text === pair.word)
    );

    if (isMatch) {
      setMatches(
        (prev) => new Set([...prev, itemToMatch.text, targetItem.text])
      );
    } else {
      // Remove colors if no match
      setSelectedItem(null);
      setDraggedItem(null);
    }

    setDraggedItem(null);
    setSelectedItem(null);
  };

  const handleItemClick = (item) => {
    if (!selectedItem) {
      setSelectedItem(item); // First item is selected
    } else {
      // Attempt to match
      handleDrop(item); // Reuse drop logic for clicks
    }
  };

  useEffect(() => {
    console.log("matches", selectedItem);
  }, [selectedItem]);

  const isMatched = (text) => matches.has(text);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        משחק התאמת מילים
      </h1>

      <button
        onClick={initializeGame}
        className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        משחק חדש
      </button>

      <div className="flex justify-center gap-16 max-w-4xl mx-auto p-4">
        {/* Words Column (Left) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
            מילים
          </h2>
          {pages[currentPage]?.words.map((item, index) => (
            <div
              key={`word-${index}`}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(item)}
              onClick={() => handleItemClick(item)}
              className={`p-4 bg-white border-2 ${
                isMatched(item.text)
                  ? "border-green-500"
                  : selectedItem?.text === item.text
                  ? "border-blue-500"
                  : "border-gray-200"
              } rounded-lg shadow-sm cursor-pointer text-center min-w-[200px]`}
            >
              <span className="text-lg">{item.text}</span>
              {isMatched(item.text) && (
                <span className="absolute top-2 right-2 text-green-500 text-xl">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Translations Column (Right) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
            תרגומים
          </h2>
          {pages[currentPage]?.translations.map((item, index) => (
            <div
              key={`translation-${index}`}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(item)}
              onClick={() => handleItemClick(item)}
              className={`p-4 bg-white border-2 ${
                isMatched(item.text)
                  ? "border-green-500"
                  : selectedItem?.text === item.text
                  ? "border-blue-500"
                  : "border-gray-200"
              } rounded-lg shadow-sm cursor-pointer text-center min-w-[200px]`}
            >
              <span className="text-lg">{item.text}</span>
              {isMatched(item.text) && (
                <span className="absolute top-2 right-2 text-green-500 text-xl">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          הקודם
        </button>

        <span className="text-lg font-medium">
          עמוד {currentPage + 1} מתוך {pages.length}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === pages.length - 1}
          className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          הבא
        </button>
      </div>
    </div>
  );
};

export default VocabularyGame;
