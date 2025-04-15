import { useState, useEffect } from "react";

interface Score {
  playerName: string;
  score: number;
  time: number;
  difficulty: string;
  date: string;
}

interface LeaderboardProps {
  currentScore?: Score | null;
  onNewScore?: (score: Score) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  currentScore,
  onNewScore,
}) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load scores from localStorage on component mount
  useEffect(() => {
    const savedScores = localStorage.getItem("yozzleScores");
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Error parsing saved scores:", e);
        setScores([]);
      }
    }
  }, []);

  // Show score submission form if there's a current score
  useEffect(() => {
    if (currentScore) {
      setIsSubmitting(true);
    }
  }, [currentScore]);

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentScore || !playerName.trim()) return;

    const newScore = {
      ...currentScore,
      playerName: playerName.trim(),
      date: new Date().toISOString(),
    };

    const updatedScores = [...scores, newScore].sort(
      (a, b) => b.score - a.score
    );
    setScores(updatedScores);

    // Save to localStorage
    localStorage.setItem("yozzleScores", JSON.stringify(updatedScores));

    // Reset form
    setPlayerName("");
    setIsSubmitting(false);

    // Notify parent
    if (onNewScore) {
      onNewScore(newScore);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Yozzle Leaderboard</h2>

      {isSubmitting && currentScore && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-medium mb-2">Submit Your Score</h3>
          <p className="mb-1">
            Score: <span className="font-bold">{currentScore.score}</span>
          </p>
          <p className="mb-3">
            Time: <span className="font-bold">{currentScore.time}s</span>
          </p>

          <form onSubmit={handleSubmitScore}>
            <label className="block mb-2">
              Your Name:
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Score
            </button>
          </form>
        </div>
      )}

      {scores.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scores.map((score, index) => (
                <tr key={index} className={index < 3 ? "bg-yellow-50" : ""}>
                  <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap font-medium">
                    {score.playerName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{score.score}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{score.time}s</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {score.difficulty}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(score.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">No scores yet. Be the first to complete a Yozzle!</p>
      )}
    </div>
  );
};

export default Leaderboard;
