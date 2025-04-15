import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface PuzzlePiece {
  id: number;
  correctIndex: number;
  currentIndex: number;
  img: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PuzzleGameProps {
  imageSrc: string;
  rows: number;
  columns: number;
}

export interface Score {
  playerName: string;
  score: number;
  time: number;
  difficulty: string;
  date: string;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({
  imageSrc = "/images/puz.jpg",
  rows = 3,
  columns = 3,
}) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null
  );
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load and process the image
  useEffect(() => {
    const img = new Image();
    // Add crossOrigin attribute for CORS-enabled servers
    // For local images or same-origin images, this won't be necessary
    if (
      !imageSrc.startsWith("/") &&
      !imageSrc.startsWith(window.location.origin)
    ) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      setOriginalImage(img);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const pieceWidth = Math.floor(img.width / columns);
        const pieceHeight = Math.floor(img.height / rows);

        const piecesArray: PuzzlePiece[] = [];
        let index = 0;

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
            try {
              // Create a new canvas for each piece
              const pieceCanvas = document.createElement("canvas");
              pieceCanvas.width = pieceWidth;
              pieceCanvas.height = pieceHeight;
              const pieceCtx = pieceCanvas.getContext("2d");

              if (pieceCtx) {
                pieceCtx.drawImage(
                  canvas,
                  x * pieceWidth,
                  y * pieceHeight,
                  pieceWidth,
                  pieceHeight,
                  0,
                  0,
                  pieceWidth,
                  pieceHeight
                );

                let pieceDataUrl = "";
                try {
                  // Try to get the data URL (may fail with cross-origin images)
                  pieceDataUrl = pieceCanvas.toDataURL();
                } catch (e) {
                  console.warn(
                    "Canvas tainted by cross-origin data. Using coordinate-based rendering instead."
                  );
                  // If toDataURL fails, we'll use the original image and coordinates for rendering
                }

                piecesArray.push({
                  id: index,
                  correctIndex: index,
                  currentIndex: index,
                  img: pieceDataUrl,
                  x: x * pieceWidth,
                  y: y * pieceHeight,
                  width: pieceWidth,
                  height: pieceHeight,
                });
              }

              index++;
            } catch (e) {
              console.error("Error creating puzzle piece:", e);
            }
          }
        }

        setPieces(piecesArray);
        setImageLoaded(true);
      }
    };

    img.onerror = (e) => {
      console.error("Error loading image:", e);
      setImageLoaded(false);
    };

    img.src = imageSrc;
  }, [imageSrc, rows, columns]);

  // Reset game when configuration changes
  useEffect(() => {
    if (gameStarted) {
      startGame();
    }
  }, [rows, columns, imageSrc]);

  // Shuffle pieces
  const shufflePieces = () => {
    if (pieces.length === 0) return;

    setPieces((prevPieces) => {
      const newPieces = [...prevPieces];
      // Fisher-Yates shuffle
      for (let i = newPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        // Swap current indices
        const temp = newPieces[i].currentIndex;
        newPieces[i].currentIndex = newPieces[j].currentIndex;
        newPieces[j].currentIndex = temp;
      }
      return newPieces;
    });
  };

  // Start the game
  const startGame = () => {
    shufflePieces();
    setGameStarted(true);
    setIsComplete(false);
    setElapsedTime(0);
    setScore(0);
    setCurrentScore(null);

    startTimeRef.current = Date.now();

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 100);
  };

  // Check if puzzle is completed
  useEffect(() => {
    if (!gameStarted || pieces.length === 0) return;

    const isCompleted = pieces.every(
      (piece) => piece.correctIndex === piece.currentIndex
    );

    if (isCompleted) {
      setIsComplete(true);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      // Calculate score (more points for faster completion)
      const maxTime = 300; // 5 minutes max time
      const timeBonus = Math.max(0, maxTime - elapsedTime);
      const calculatedScore = 1000 + timeBonus * 10;
      setScore(calculatedScore);

      // Create score object for leaderboard
      setCurrentScore({
        playerName: "",
        score: calculatedScore,
        time: elapsedTime,
        difficulty: `${rows}x${columns}`,
        date: new Date().toISOString(),
      });
    }
  }, [pieces, gameStarted, elapsedTime, rows, columns]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handler for piece selection
  const handlePieceClick = (index: number) => {
    if (isComplete) return;

    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      // Swap pieces
      setPieces((prevPieces) => {
        const newPieces = [...prevPieces];
        const selectedPieceObj = newPieces.find(
          (p) => p.currentIndex === selectedPiece
        );
        const targetPieceObj = newPieces.find((p) => p.currentIndex === index);

        if (selectedPieceObj && targetPieceObj) {
          // Swap current indices
          const tempIndex = selectedPieceObj.currentIndex;
          selectedPieceObj.currentIndex = targetPieceObj.currentIndex;
          targetPieceObj.currentIndex = tempIndex;
        }

        return newPieces;
      });

      setSelectedPiece(null);
    }
  };

  // Handle new score submission
  const handleNewScore = (score: Score) => {
    setCurrentScore(null);
  };

  // Render pieces in their current positions
  const renderPieces = () => {
    if (!imageLoaded) return null;

    // Sort pieces by current index for rendering
    const sortedPieces = [...pieces].sort(
      (a, b) => a.currentIndex - b.currentIndex
    );

    return (
      <div
        className="grid gap-1 bg-gray-800"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          maxWidth: "90vw",
          maxHeight: "70vh",
        }}
      >
        {sortedPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className={`relative cursor-pointer overflow-hidden ${
              selectedPiece === piece.currentIndex
                ? "ring-4 ring-yellow-400"
                : ""
            }`}
            onClick={() => handlePieceClick(piece.currentIndex)}
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            style={{
              aspectRatio: "1/1",
            }}
          >
            {piece.img ? (
              // If we have a data URL, use it
              <img
                src={piece.img}
                alt={`Puzzle piece ${piece.id}`}
                className="w-full h-full object-cover"
              />
            ) : (
              // Otherwise, use a div with the original image as background
              originalImage && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${imageSrc})`,
                    backgroundPosition: `-${piece.x}px -${piece.y}px`,
                    backgroundSize: `${originalImage.width}px ${originalImage.height}px`,
                    width: "100%",
                    height: "100%",
                  }}
                ></div>
              )
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4 min-h-[80vh]">
      <canvas ref={canvasRef} className="hidden" />

      {!gameStarted ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Image Puzzle Challenge</h1>
          <p className="mb-4">
            Rearrange the pieces to complete the image. The faster you solve,
            the more points you get!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            disabled={!imageLoaded}
          >
            {imageLoaded ? "Start Game" : "Loading Image..."}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between w-full max-w-md mb-2">
            <div className="text-lg font-medium">
              Time: <span className="font-bold">{elapsedTime}s</span>
            </div>
            {isComplete && (
              <div className="text-lg font-medium">
                Score: <span className="font-bold text-green-600">{score}</span>
              </div>
            )}
          </div>

          {renderPieces()}

          {isComplete ? (
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Puzzle Complete!
              </h2>
              <p className="text-lg mb-4">
                You solved it in {elapsedTime} seconds.
              </p>
              <button
                onClick={startGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          ) : (
            <button
              onClick={startGame}
              className="px-4 py-1 mt-4 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
            >
              Restart
            </button>
          )}
        </>
      )}

      {/* Return the current score for the parent to use with the leaderboard */}
      {currentScore && (
        <div
          className="sr-only"
          data-current-score={JSON.stringify(currentScore)}
        ></div>
      )}
    </div>
  );
};

export default PuzzleGame;
