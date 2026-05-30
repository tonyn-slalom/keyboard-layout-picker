import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { TestResultsProvider } from './context/TestResultsContext';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import LayoutDetailPage from './pages/LayoutDetailPage';

function NavBar({ darkMode, onToggleDark }: { darkMode: boolean; onToggleDark: () => void }) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
      <Link
        to="/"
        className="text-lg font-bold text-gray-900 dark:text-white tracking-tight"
        aria-label="Keyboard Layout Picker home"
      >
        KLP
      </Link>
      <div className="flex items-center gap-4">
        <NavLink
          to="/browse"
          aria-label="Browse layouts"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          Browse
        </NavLink>
        <NavLink
          to="/test"
          aria-label="Take the typing test"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          Test
        </NavLink>
        <button
          onClick={onToggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  function handleToggleDark() {
    setDarkMode(prev => !prev);
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <TestResultsProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white dark:bg-gray-950">
            <Routes>
              {/* Test page gets full screen without nav */}
              <Route path="/test" element={<TestPage />} />
              <Route
                path="*"
                element={
                  <>
                    <NavBar darkMode={darkMode} onToggleDark={handleToggleDark} />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/browse" element={<BrowsePage />} />
                      <Route path="/browse/:id" element={<LayoutDetailPage />} />
                      <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                  </>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </TestResultsProvider>
    </div>
  );
}
