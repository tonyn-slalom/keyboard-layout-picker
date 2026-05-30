import { useState, useEffect, useRef, useCallback } from 'react';
import type { Layout } from '../../types';
import { KeyboardViz } from '../KeyboardViz/KeyboardViz';
import {
  buildQwertyToLayoutMap,
  qwertyPosIndex,
  passageToQwerty,
  DEMO_PASSAGE,
} from '../../utils/layoutRemap';

interface TryoutPanelProps {
  layout: Layout;
}

export function TryoutPanel({ layout }: TryoutPanelProps) {
  const [text, setText] = useState('');
  const [activePositions, setActivePositions] = useState<Set<number>>(new Set());
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const remapRef = useRef(buildQwertyToLayoutMap(layout));
  // Tracks how many output chars have been produced — used to disambiguate
  // space presses for thumb-cluster layouts (thumb char vs. word space)
  const passageCursorRef = useRef(0);

  const qwertyPassage = passageToQwerty(DEMO_PASSAGE, layout);

  useEffect(() => {
    remapRef.current = buildQwertyToLayoutMap(layout);
    setText('');
    setActivePositions(new Set());
    passageCursorRef.current = 0;
  }, [layout.id]);

  function addActivePos(pos: number) {
    setActivePositions(prev => {
      if (prev.has(pos)) return prev;
      const next = new Set(prev);
      next.add(pos);
      return next;
    });
  }

  function removeActivePos(pos: number) {
    setActivePositions(prev => {
      if (!prev.has(pos)) return prev;
      const next = new Set(prev);
      next.delete(pos);
      return next;
    });
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.key === 'Backspace') {
      setText(prev => prev.slice(0, -1));
      if (passageCursorRef.current > 0) passageCursorRef.current--;
      return;
    }
    if (e.key === ' ') {
      const thumbChar = remapRef.current.get(' ');
      if (thumbChar) {
        // Use passage position to decide: if the next expected output char is
        // the thumb letter, produce it; otherwise produce a word space
        const expected = DEMO_PASSAGE[passageCursorRef.current];
        setText(prev => prev + (expected === thumbChar ? thumbChar : ' '));
      } else {
        setText(prev => prev + ' ');
      }
      passageCursorRef.current++;
      return;
    }
    if (e.key === 'Enter') {
      setText(prev => prev + '\n');
      return;
    }

    const lower = e.key.toLowerCase();
    const targetChar = remapRef.current.get(lower);
    if (!targetChar) return;

    const outputChar = e.shiftKey ? targetChar.toUpperCase() : targetChar;
    setText(prev => prev + outputChar);
    passageCursorRef.current++;

    const posIdx = qwertyPosIndex(lower);
    if (posIdx >= 0) addActivePos(posIdx);
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const posIdx = qwertyPosIndex(e.key.toLowerCase());
    if (posIdx >= 0) removeActivePos(posIdx);
  }, []);

  function handleClear() {
    setText('');
    setActivePositions(new Set());
    passageCursorRef.current = 0;
    containerRef.current?.focus();
  }

  return (
    <div className="space-y-6">

      {/* ── Demo passage ─────────────────────────────────────────── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Demo passage
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/60">
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {layout.name} output
              </span>
            </div>
            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all leading-relaxed">
              {DEMO_PASSAGE}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 dark:border-blue-800 p-3 bg-blue-50 dark:bg-blue-950/40">
            <div className="mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Type this on QWERTY
              </span>
            </div>
            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all leading-relaxed">
              {qwertyPassage}
            </p>
          </div>

        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Type the right box in the live panel below — you'll produce the passage on {layout.name} and feel the key positions.
        </p>
      </div>

      {/* ── Live tryout ──────────────────────────────────────────── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Live typing
        </h4>

        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setActivePositions(new Set()); }}
          className="outline-none"
        >
          {!focused && (
            <button
              onClick={() => containerRef.current?.focus()}
              className="w-full mb-3 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Click here to start typing
            </button>
          )}
          {focused && (
            <div className="w-full mb-3 py-2 rounded-lg border-2 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-sm text-blue-600 dark:text-blue-400 text-center">
              Typing active — keys highlight as you press them
            </div>
          )}

          <KeyboardViz layout={layout} size="lg" activePositions={activePositions} />

          <div className="mt-4 min-h-[72px] p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-lg text-gray-900 dark:text-gray-100 break-all whitespace-pre-wrap">
            {text || <span className="text-gray-400 dark:text-gray-500 font-sans text-base">Output appears here…</span>}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Physical QWERTY keys → {layout.name} characters</span>
            <button
              onClick={handleClear}
              className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
