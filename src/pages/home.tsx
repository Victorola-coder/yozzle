import { SEO } from "../components/global";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <SEO title="Yozzle - Image Puzzle Game" />
      <div className="min-h-[100dvh] mx-auto flex flex-col items-center justify-center px-4 py-12 text-black">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to Yozzle
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Test your puzzle-solving skills with our interactive image puzzle
            game. Rearrange scrambled pieces, race against the clock, and
            compete for the highest score!
          </p>

          <div className="mb-10">
            <Link
              to="/puzzle"
              className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium text-lg hover:bg-blue-700 transition-colors"
            >
              Start Yozzle Game
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">
                Customizable Difficulty
              </h2>
              <p>
                Adjust the number of rows and columns to make your Yozzle as
                challenging as you want, from beginner to expert level.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">Time-Based Scoring</h2>
              <p>
                The faster you solve the puzzle, the higher your score! Compete
                against yourself or check the Yozzle leaderboard to see top
                players.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">Custom Images</h2>
              <p>
                Choose from our selection of images or upload your own to create
                a personalized Yozzle experience.
              </p>
            </div>
          </div>

          <p className="mt-10 text-gray-600">
            Ready to challenge your puzzle-solving skills? Click Start to begin
            your Yozzle adventure!
          </p>
        </div>
      </div>
    </>
  );
}
