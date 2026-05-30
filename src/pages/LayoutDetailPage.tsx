import { useParams, Navigate } from 'react-router-dom';
import type { Layout } from '../types';
import layoutsData from '../data/layouts.json';
import { LayoutDetail } from '../components/LayoutBrowser/LayoutDetail';

const layouts = layoutsData as Layout[];

export default function LayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const layout = layouts.find(l => l.id === id);

  if (!layout) {
    return <Navigate to="/browse" replace />;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <LayoutDetail layout={layout} allLayouts={layouts} />
    </main>
  );
}
