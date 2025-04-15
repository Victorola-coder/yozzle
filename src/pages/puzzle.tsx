import { SEO } from "../components/global";
import { PuzzleGame, PuzzleConfig, Leaderboard } from "../components/puzzle";
import { useState, useEffect } from "react";
import type { Score } from "../components/puzzle/PuzzleGame";

export default function PuzzlePage() {
  const [puzzleConfig, setPuzzleConfig] = useState({
    rows: 3,
    columns: 3,
    imageSrc: "/images/puz.jpg",
  });

  const [showConfig, setShowConfig] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  const [gameKey, setGameKey] = useState(0); // Used to force re-render of game component

  const handleConfigChange = (newConfig: {
    rows: number;
    columns: number;
    imageSrc: string;
  }) => {
    setPuzzleConfig(newConfig);
    setShowConfig(false);
    // Reset game by changing key
    setGameKey((prev) => prev + 1);
  };

  // Check for game completion by looking for the data attribute
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-current-score"
        ) {
          const target = mutation.target as HTMLElement;
          const scoreData = target.getAttribute("data-current-score");
          if (scoreData) {
            try {
              const parsedScore = JSON.parse(scoreData);
              setCurrentScore(parsedScore);
              setShowLeaderboard(true);
            } catch (e) {
              console.error("Error parsing score data:", e);
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-current-score"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const handleNewScore = (score: Score) => {
    setCurrentScore(null);
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <>
      <SEO title="Image Puzzle Challenge" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Image Puzzle Challenge</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleLeaderboard}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {showLeaderboard ? "Hide Leaderboard" : "Leaderboard"}
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              {showConfig ? "Hide Settings" : "Configure Puzzle"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`${showLeaderboard ? "lg:col-span-2" : "lg:col-span-3"}`}
          >
            {showConfig ? (
              <PuzzleConfig
                onConfigChange={handleConfigChange}
                defaultRows={puzzleConfig.rows}
                defaultColumns={puzzleConfig.columns}
                defaultImageSrc={puzzleConfig.imageSrc}
              />
            ) : (
              <PuzzleGame
                key={gameKey}
                imageSrc={puzzleConfig.imageSrc}
                rows={puzzleConfig.rows}
                columns={puzzleConfig.columns}
              />
            )}
          </div>

          {showLeaderboard && (
            <div className="lg:col-span-1">
              <Leaderboard
                currentScore={currentScore}
                onNewScore={handleNewScore}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
