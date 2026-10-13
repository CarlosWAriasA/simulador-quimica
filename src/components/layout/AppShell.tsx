import { AnimatePresence, motion } from 'framer-motion';
import { Cpu, Menu, Pause, Play, Presentation, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { temperatureTextColor } from '../../utils/color';
import { fmt } from '../../utils/format';
import { NAV } from './nav';

function Brand() {
  return (
    <a href="#/" className="flex items-center gap-3" aria-label="ThermoChip Lab, ir al inicio">
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-orange-500 shadow-glow">
        <Cpu size={20} className="text-white" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold text-white">ThermoChip Lab</span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Laboratorio virtual</span>
      </span>
    </a>
  );
}

function LiveMini() {
  const { state, actions, derived } = useSimulation();
  const c = temperatureTextColor(state.T);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-lab-950/60 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Chip en vivo</span>
        <button type="button" onClick={actions.toggle} className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-slate-200 hover:bg-white/10" aria-label={state.running ? 'Pausar simulación' : 'Iniciar simulación'}>
          {state.running ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
        </button>
      </div>
      <a href="#/simulador" className="mt-1 flex items-baseline gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} aria-hidden />
        <span className="num text-2xl font-bold" style={{ color: c }}>
          {fmt(state.T, 1)} °C
        </span>
      </a>
      <div className="text-xs text-slate-400">{derived.status.label}</div>
    </div>
  );
}

function NavLinks({ current, onNavigate }: { current: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Secciones" className="space-y-1">
      {NAV.map((item) => {
        const active = current === item.path;
        const Icon = item.icon;
        return (
          <a
            key={item.path}
            href={`#${item.path}`}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
            }`}
          >
            {active && <motion.span layoutId="nav-active" className="absolute inset-y-2 left-0 w-1 rounded-full bg-cyan-400" />}
            <Icon size={18} aria-hidden className={active ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

export function AppShell({ current, children }: { current: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [current]);

  return (
    <div className="min-h-screen">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-lab-950">
        Saltar al contenido
      </a>

      {/* Barra lateral (escritorio) */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 flex-col gap-6 border-r border-white/[0.06] bg-lab-950/80 p-5 backdrop-blur-xl lg:flex">
        <Brand />
        <div className="scrollbar-thin -mx-1 flex-1 overflow-y-auto px-1">
          <NavLinks current={current} />
        </div>
        <LiveMini />
        <a href="#/presentacion" className="btn-primary w-full">
          <Presentation size={18} aria-hidden /> Modo presentación
        </a>
        <p className="text-[11px] leading-snug text-slate-500">Química General I · UNIBE · Ingeniería en TIC</p>
      </aside>

      {/* Barra superior (móvil / tableta) */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-lab-950/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <a href="#/presentacion" className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-lab-950" aria-label="Modo presentación">
            <Presentation size={18} aria-hidden />
          </a>
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5" aria-label="Abrir menú" aria-expanded={open}>
            <Menu size={20} aria-hidden />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col gap-5 border-l border-white/10 bg-lab-900 p-5"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-end">
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-white/5" aria-label="Cerrar menú">
                  <X size={20} aria-hidden />
                </button>
              </div>
              <NavLinks current={current} onNavigate={() => setOpen(false)} />
              <LiveMini />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="contenido" className="lg:pl-72">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
