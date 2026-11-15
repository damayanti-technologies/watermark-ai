import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { HomePage } from './pages/Home/HomePage';

// Lazy-load heavier routes to optimize initial bundle and page load
const PhotoRemoverPage = lazy(() => import('./pages/PhotoRemover/PhotoRemoverPage').then(m => ({ default: m.PhotoRemoverPage })));
const VideoRemoverPage = lazy(() => import('./pages/VideoRemover/VideoRemoverPage').then(m => ({ default: m.VideoRemoverPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorks/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const PrivacyPage = lazy(() => import('./pages/Privacy/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const AboutPage = lazy(() => import('./pages/About/AboutPage').then(m => ({ default: m.AboutPage })));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-semibold text-slate-500">Loading module...</span>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/photo" element={<PhotoRemoverPage />} />
              <Route path="/video" element={<VideoRemoverPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
