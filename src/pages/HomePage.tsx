import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Keyboard Layout Picker
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mb-10">
        Find the keyboard layout that fits <em>your</em> fingers. Take a ~3.5 min
        typing test, get personalized recommendations from 41 layouts.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/test"
          aria-label="Start the typing test"
          className="px-8 py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Take the Test
        </Link>
        <Link
          to="/browse"
          aria-label="Browse all keyboard layouts"
          className="px-8 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Browse Layouts
        </Link>
        <Link
          to="/about"
          aria-label="Read about Keyboard Layout Picker"
          className="px-8 py-3 rounded-xl border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 text-lg font-semibold hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
        >
          Learn About KLP
        </Link>
      </div>
    </main>
  );
}
