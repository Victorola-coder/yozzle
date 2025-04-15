import { SEO } from "../components/global";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <SEO title="Home" />
      <div className="min-h-[100dvh] mx-auto flex flex-col items-center justify-center text-black">
        <h1 className="text-4xl font-bold mb-6">Welcome to Puzzle Challenge</h1>
        <p className="text-lg mb-8">
          Solve image puzzles and score points based on your speed!
        </p>
        <Link
          to="/puzzle"
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Start Puzzle Game
        </Link>
      </div>
    </>
  );
}
