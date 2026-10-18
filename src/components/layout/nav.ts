import { Atom, Beaker, BarChart3, FlaskConical, GraduationCap, LayoutDashboard, Leaf, Microscope, Thermometer, type LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { path: '/', label: 'Inicio', short: 'Inicio', icon: LayoutDashboard },
  { path: '/laboratorio', label: 'Laboratorio (prácticas)', short: 'Laboratorio', icon: Beaker },
  { path: '/simulador', label: 'Simulador (modo libre)', short: 'Simulador', icon: Thermometer },
  { path: '/quimica', label: 'Química de semiconductores', short: 'Química', icon: Atom },
  { path: '/dopaje', label: 'Dopaje químico', short: 'Dopaje', icon: FlaskConical },
  { path: '/comparador', label: 'Comparador de materiales', short: 'Comparador', icon: BarChart3 },
  { path: '/nanomateriales', label: 'Nanomateriales y TIC', short: 'Nano', icon: Microscope },
  { path: '/resultados', label: 'Resultados y sostenibilidad', short: 'Resultados', icon: Leaf },
  { path: '/proyecto', label: 'Sobre el proyecto', short: 'Proyecto', icon: GraduationCap },
];
