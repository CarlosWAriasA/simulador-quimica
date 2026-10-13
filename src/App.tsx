import { motion } from 'framer-motion';
import { Component, useEffect, type ReactNode } from 'react';
import { AppShell } from './components/layout/AppShell';
import { SimulationProvider } from './context/SimulationContext';
import { useHashRoute } from './hooks/useHashRoute';
import { AboutPage } from './pages/AboutPage';
import { ChemistryPage } from './pages/ChemistryPage';
import { ComparatorPage } from './pages/ComparatorPage';
import { DashboardPage } from './pages/DashboardPage';
import { DopingPage } from './pages/DopingPage';
import { NanoPage } from './pages/NanoPage';
import { PresentationMode } from './pages/PresentationMode';
import { ResultsPage } from './pages/ResultsPage';
import { SimulatorPage } from './pages/SimulatorPage';

const PAGES: Record<string, () => ReactNode> = {
  '/': () => <DashboardPage />,
  '/simulador': () => <SimulatorPage />,
  '/quimica': () => <ChemistryPage />,
  '/dopaje': () => <DopingPage />,
  '/comparador': () => <ComparatorPage />,
  '/nanomateriales': () => <NanoPage />,
  '/resultados': () => <ResultsPage />,
  '/proyecto': () => <AboutPage />,
};

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="panel mx-auto mt-10 max-w-xl p-6 text-center">
          <h1 className="text-xl font-bold">Se produjo un error en esta sección</h1>
          <p className="mt-2 text-sm text-slate-400">{this.state.error.message}</p>
          <button type="button" className="btn-primary mt-4" onClick={() => this.setState({ error: null })}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="panel mx-auto mt-10 max-w-xl p-6 text-center">
      <h1 className="text-xl font-bold">Sección no encontrada</h1>
      <a href="#/" className="btn-primary mt-4">
        Volver al inicio
      </a>
    </div>
  );
}

export default function App() {
  const { route } = useHashRoute();
  const page = PAGES[route.path];

  useEffect(() => {
    if (route.query.get('ref')) {
      requestAnimationFrame(() => document.getElementById(route.query.get('ref') ?? '')?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [route]);

  return (
    <SimulationProvider>
      {route.path === '/presentacion' ? (
        <ErrorBoundary>
          <PresentationMode />
        </ErrorBoundary>
      ) : (
        <AppShell current={route.path}>
          <ErrorBoundary key={route.path}>
            <motion.div key={route.path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {page ? page() : <NotFound />}
            </motion.div>
          </ErrorBoundary>
        </AppShell>
      )}
    </SimulationProvider>
  );
}
