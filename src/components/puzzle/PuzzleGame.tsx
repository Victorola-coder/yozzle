import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  pieceSize?: "small" | "medium" | "large"; // Size option for fixed piece sizes
}

export interface Score {
  playerName: string;
  score: number;
  time: number;
  difficulty: string;
  date: string;
}

// Fixed piece size dimensions in pixels
const PIECE_SIZES = {
  small: { width: 60, height: 60 },
  medium: { width: 80, height: 80 },
  large: { width: 100, height: 100 },
};

const PuzzleGame: React.FC<PuzzleGameProps> = ({
  imageSrc = "/images/puz.jpg",
  rows = 3,
  columns = 3,
  pieceSize = "medium",
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [peekUsed, setPeekUsed] = useState(false);
  const [peekPenalty, setPeekPenalty] = useState(0);
  const [currentPieceSize, setCurrentPieceSize] = useState(
    PIECE_SIZES[pieceSize]
  );
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const peekTimeout = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update piece size when props change
  useEffect(() => {
    setCurrentPieceSize(PIECE_SIZES[pieceSize]);
  }, [pieceSize]);

  // Fixed dimensions for original puzzle image
  const PEEK_DURATION = 1500; // Duration in ms to show the solution
  const PEEK_PENALTY = 20; // Time penalty in seconds for using peek

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

        // Set canvas to the full image size
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const piecesArray: PuzzlePiece[] = [];
        let index = 0;

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
            try {
              // Calculate source dimensions from the original image
              const srcWidth = Math.floor(img.width / columns);
              const srcHeight = Math.floor(img.height / rows);

              // Create a new canvas for each piece
              const pieceCanvas = document.createElement("canvas");
              pieceCanvas.width = currentPieceSize.width;
              pieceCanvas.height = currentPieceSize.height;
              const pieceCtx = pieceCanvas.getContext("2d");

              if (pieceCtx) {
                // Draw the image portion scaled to our fixed piece size
                pieceCtx.drawImage(
                  canvas,
                  x * srcWidth,
                  y * srcHeight,
                  srcWidth,
                  srcHeight,
                  0,
                  0,
                  currentPieceSize.width,
                  currentPieceSize.height
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
                  x: x * srcWidth,
                  y: y * srcHeight,
                  width: srcWidth, // Original dimensions for background positioning
                  height: srcHeight,
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
  }, [imageSrc, rows, columns, currentPieceSize]);

  // Reset game when configuration changes
  useEffect(() => {
    if (gameStarted) {
      startGame();
    }
  }, [rows, columns, imageSrc, pieceSize]);

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
    setShowInstructions(false);
    setShowPeek(false);
    setPeekUsed(false);
    setPeekPenalty(0);

    // Clear any existing timers
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    if (peekTimeout.current) {
      window.clearTimeout(peekTimeout.current);
    }

    startTimeRef.current = Date.now();

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
      // Apply penalty for using peek
      const finalTimeBonus = Math.max(0, timeBonus - peekPenalty);
      const calculatedScore = 1000 + finalTimeBonus * 10;
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
  }, [pieces, gameStarted, elapsedTime, rows, columns, peekPenalty]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (peekTimeout.current) {
        window.clearTimeout(peekTimeout.current);
      }
    };
  }, []);

  // Handler for piece selection
  const handlePieceClick = (index: number) => {
    if (isComplete || showPeek) return;

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

  // Toggle instructions
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Handle peek button click
  const handlePeek = () => {
    if (isComplete || !gameStarted) return;

    setShowPeek(true);

    // If this is the first peek, apply the penalty
    if (!peekUsed) {
      setPeekUsed(true);
      setPeekPenalty(PEEK_PENALTY);
    }

    // Clear any existing peek timeout
    if (peekTimeout.current) {
      window.clearTimeout(peekTimeout.current);
    }

    // Set timeout to hide the peek
    peekTimeout.current = window.setTimeout(() => {
      setShowPeek(false);
    }, PEEK_DURATION);
  };

  // Handle piece size change
  const handlePieceSizeChange = (size: "small" | "medium" | "large") => {
    setCurrentPieceSize(PIECE_SIZES[size]);
  };

  // Render the correct solution (for peek)
  const renderSolution = () => {
    if (!imageLoaded || !originalImage || pieces.length === 0) return null;

    return (
      <AnimatePresence>
        {showPeek && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-2 bg-white rounded-md">
              <img
                src={imageSrc}
                alt="Complete Yozzle"
                style={{
                  maxWidth: `${columns * currentPieceSize.width}px`,
                  maxHeight: `${rows * currentPieceSize.height}px`,
                  objectFit: "contain",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Render pieces in their current positions
  const renderPieces = () => {
    if (!imageLoaded || pieces.length === 0) return null;

    // Sort pieces by current index for rendering
    const sortedPieces = [...pieces].sort(
      (a, b) => a.currentIndex - b.currentIndex
    );

    return (
      <div className="relative w-full flex justify-center overflow-auto">
        {renderSolution()}
        <div
          className="grid gap-1 bg-gray-800"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            width: `${columns * currentPieceSize.width + (columns - 1)}px`,
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
                width: `${currentPieceSize.width}px`,
                height: `${currentPieceSize.height}px`,
              }}
            >
              {piece.img ? (
                // If we have a data URL, use it
                <img
                  src={piece.img}
                  alt={`Yozzle piece ${piece.id}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Otherwise, use a div with the original image as background
                originalImage && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${imageSrc})`,
                      backgroundPosition: `-${
                        (piece.x / piece.width) * currentPieceSize.width
                      }px -${
                        (piece.y / piece.height) * currentPieceSize.height
                      }px`,
                      backgroundSize: `${
                        (originalImage.width / pieces[0].width) *
                        currentPieceSize.width
                      }px ${
                        (originalImage.height / pieces[0].height) *
                        currentPieceSize.height
                      }px`,
                    }}
                  ></div>
                )
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Game instructions
  const renderInstructions = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 max-w-2xl mx-auto text-left">
        <h3 className="text-xl font-bold mb-2">How to Play Yozzle</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            The image is split into {rows}x{columns} pieces and shuffled
            randomly.
          </li>
          <li>
            <strong>To move pieces:</strong> Click on a piece to select it (it
            will be highlighted with a yellow border), then click on another
            piece to swap their positions.
          </li>
          <li>
            Your goal is to rearrange the pieces to recreate the original image.
          </li>
          <li>
            A timer starts when the game begins - the faster you solve the
            Yozzle, the higher your score!
          </li>
          <li>
            <strong>Peek button:</strong> Use it to briefly see the complete
            image, but beware - using it adds a {PEEK_PENALTY}-second penalty to
            your score calculation.
          </li>
          <li>
            When you complete the Yozzle, you can submit your score to the
            leaderboard.
          </li>
        </ol>
        <div className="mt-4 pt-2 border-t border-gray-200">
          <h4 className="font-bold">Scoring</h4>
          <p>
            Your score is calculated based on how quickly you solve the Yozzle:
          </p>
          <ul className="list-disc pl-5">
            <li>Base score: 1000 points</li>
            <li>Time bonus: 10 points for each second under 5 minutes</li>
            <li>
              Peek penalty: {PEEK_PENALTY} seconds deducted from your time bonus
              if used
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Size selector component
  const renderSizeSelector = () => {
    return (
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-sm font-medium">Piece Size:</span>
        <div className="flex gap-1">
          <button
            onClick={() => handlePieceSizeChange("small")}
            className={`px-2 py-1 text-xs rounded ${
              currentPieceSize === PIECE_SIZES.small
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Small
          </button>
          <button
            onClick={() => handlePieceSizeChange("medium")}
            className={`px-2 py-1 text-xs rounded ${
              currentPieceSize === PIECE_SIZES.medium
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => handlePieceSizeChange("large")}
            className={`px-2 py-1 text-xs rounded ${
              currentPieceSize === PIECE_SIZES.large
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Large
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-4 min-h-[80vh] w-full"
      ref={gameContainerRef}
    >
      <canvas ref={canvasRef} className="hidden" />

      {!gameStarted ? (
        <div className="text-center w-full max-w-xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Yozzle Challenge
          </h1>
          <p className="mb-4">
            Rearrange the pieces to complete the image. The faster you solve,
            the more points you get!
          </p>

          {renderSizeSelector()}

          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            disabled={!imageLoaded}
          >
            {imageLoaded ? "Start Yozzle" : "Loading Image..."}
          </button>
          <div className="mt-2">
            <button
              onClick={toggleInstructions}
              className="text-blue-600 underline text-sm"
            >
              {showInstructions ? "Hide Instructions" : "Show Instructions"}
            </button>
          </div>

          {showInstructions && renderInstructions()}
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full max-w-xl mb-2 gap-2">
            <div className="text-lg font-medium">
              Time: <span className="font-bold">{elapsedTime}s</span>
              {peekUsed && (
                <span className="text-sm text-orange-600 ml-1">
                  (+{PEEK_PENALTY}s penalty)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePeek}
                className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isComplete || showPeek}
              >
                Peek
              </button>

              <button
                onClick={toggleInstructions}
                className="text-sm text-blue-600 underline"
              >
                {showInstructions ? "Hide Help" : "Show Help"}
              </button>
            </div>

            {isComplete && (
              <div className="text-lg font-medium">
                Score: <span className="font-bold text-green-600">{score}</span>
              </div>
            )}
          </div>

          {!isComplete && renderSizeSelector()}

          {showInstructions && renderInstructions()}

          {renderPieces()}

          {isComplete ? (
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Yozzle Complete!
              </h2>
              <p className="text-lg mb-4">
                You solved it in {elapsedTime} seconds.
                {peekUsed && (
                  <span className="text-orange-600">
                    {" "}
                    (Used peek: {PEEK_PENALTY}s penalty applied)
                  </span>
                )}
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
