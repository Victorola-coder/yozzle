import { useState } from "react";

interface PuzzleConfigProps {
  onConfigChange: (config: {
    rows: number;
    columns: number;
    imageSrc: string;
  }) => void;
  defaultRows?: number;
  defaultColumns?: number;
  defaultImageSrc?: string;
}

const PuzzleConfig: React.FC<PuzzleConfigProps> = ({
  onConfigChange,
  defaultRows = 3,
  defaultColumns = 3,
  defaultImageSrc = "/images/puz.jpg",
}) => {
  const [rows, setRows] = useState(defaultRows);
  const [columns, setColumns] = useState(defaultColumns);
  const [imageSrc, setImageSrc] = useState(defaultImageSrc);
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
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Puzzle Configuration</h2>

      <div className="mb-4">
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

      <div className="mb-4">
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

        <form onSubmit={handleCustomImageSubmit} className="mt-2">
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
          <button
            type="submit"
            className="mt-1 px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
          >
            Use Custom Image
          </button>

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

      <button
        onClick={handleApplyConfig}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Apply Configuration
      </button>
    </div>
  );
};

export default PuzzleConfig;
