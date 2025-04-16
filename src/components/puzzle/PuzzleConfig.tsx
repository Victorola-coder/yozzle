import { useState } from "react";

interface PuzzleConfigProps {
  onConfigChange: (config: {
    rows: number;
    columns: number;
    imageSrc: string;
    pieceSize: "small" | "medium" | "large";
  }) => void;
  defaultRows?: number;
  defaultColumns?: number;
  defaultImageSrc?: string;
  defaultPieceSize?: "small" | "medium" | "large";
}

const PuzzleConfig: React.FC<PuzzleConfigProps> = ({
  onConfigChange,
  defaultRows = 3,
  defaultColumns = 3,
  defaultImageSrc = "/images/puz.jpg",
  defaultPieceSize = "medium",
}) => {
  const [rows, setRows] = useState(defaultRows);
  const [columns, setColumns] = useState(defaultColumns);
  const [imageSrc, setImageSrc] = useState(defaultImageSrc);
  const [pieceSize, setPieceSize] = useState<"small" | "medium" | "large">(
    defaultPieceSize
  );
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [showCorsWarning, setShowCorsWarning] = useState(false);

  // Predefined images
  const predefinedImages = [
    { src: "/images/puz.jpg", label: "Default Image" },
    { src: "/images/image.png", label: "Secondary Image" },
  ];

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 2 && value <= 8) {
      setRows(value);
    }
  };

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 2 && value <= 8) {
      setColumns(value);
    }
  };

  const handleImageSelect = (src: string) => {
    setImageSrc(src);
    setCustomImageUrl("");
    setShowCorsWarning(false);
  };

  const handleCustomImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl.trim()) {
      // Check if URL is from a different origin
      const isCrossOrigin =
        !customImageUrl.startsWith("/") &&
        !customImageUrl.startsWith(window.location.origin);

      setShowCorsWarning(isCrossOrigin);
      setImageSrc(customImageUrl);
    }
  };

  const handleApplyConfig = () => {
    onConfigChange({
      rows,
      columns,
      imageSrc,
      pieceSize,
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        Yozzle Configuration
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rows (2-8):
            <input
              type="number"
              min="2"
              max="8"
              value={rows}
              onChange={handleRowsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Columns (2-8):
            <input
              type="number"
              min="2"
              max="8"
              value={columns}
              onChange={handleColumnsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Piece Size:
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded text-sm ${
              pieceSize === "small"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setPieceSize("small")}
          >
            Small
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded text-sm ${
              pieceSize === "medium"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setPieceSize("medium")}
          >
            Medium
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded text-sm ${
              pieceSize === "large"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setPieceSize("large")}
          >
            Large
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Select Image:
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {predefinedImages.map((img, index) => (
            <div
              key={index}
              className={`cursor-pointer border rounded-md p-1 ${
                imageSrc === img.src
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-300"
              }`}
              onClick={() => handleImageSelect(img.src)}
            >
              <img src={img.src} alt={img.label} className="w-full h-auto" />
              <p className="text-xs text-center mt-1">{img.label}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleCustomImageSubmit} className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Image URL:
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </label>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
            >
              Use Custom Image
            </button>
          </div>

          {showCorsWarning && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
              <p className="font-medium">Note about external images:</p>
              <p>
                Some external images may not work properly due to cross-origin
                restrictions. For best results, use images from the same domain
                or images that support CORS.
              </p>
            </div>
          )}
        </form>
      </div>

      <div className="mt-6">
        <button
          onClick={handleApplyConfig}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Configuration
        </button>
      </div>
    </div>
  );
};

export default PuzzleConfig;
