
/* eslint-disable react-refresh/only-export-components */
import React from 'react';

export const Icon = ({ children, className = "h-6 w-6", style }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {children}
    </svg>
);

export const Icons = {
  PlayMatch: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></Icon>,
  Editor: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></Icon>,
  Leagues: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 14.25h.008v.008H12v-.008z" /></Icon>,
  News: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></Icon>,
  Lineups: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></Icon>,
  Home: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></Icon>,
  Settings: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.227l.128-.054a2.25 2.25 0 012.864 2.864l-.054.128c-.22.55-.685 1.02-1.227 1.11l-.442.166a2.25 2.25 0 00-1.942 1.942l-.166.442c-.09.542-.56 1.007-1.11 1.227l-.128.054a2.25 2.25 0 01-2.864-2.864l.054-.128c.22-.55.685-1.02 1.227-1.11l.442-.166a2.25 2.25 0 001.942-1.942l.166-.442zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></Icon>,
  Trophy: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 1011.64-8.094l-1.11-4.22a1.5 1.5 0 00-1.423-1.034H9.395a1.5 1.5 0 00-1.423 1.034l-1.11 4.22A9.75 9.75 0 007.5 18.75z" /></Icon>,
  Podium: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></Icon>,
  ChartPie: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></Icon>,
  DragHandle: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-gray-500" viewBox="0 0 20 20"><path d="M7 3a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zM7 8a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zm-5 5a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
  Info: ({ className }: { className?: string }) => <Icon className={className || "h-4 w-4 inline-block ml-1 text-gray-500"}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>,
  PlusCircle: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6 text-green-500"}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>,
  Transfers: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></Icon>,
  ArrowRightLeft: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></Icon>,
  Compare: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.992-1.218v4.992m0 0h-4.992m4.992 0l-3.181-3.183a8.25 8.25 0 00-11.667 0l-3.181 3.183" /></Icon>,
  RemoveCircle: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6 text-red-500"}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>,
  TrendingUp: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5L21 3m0 0h-7.5m7.5 0v7.5M3 12h18M3 12L7.5 7.5M3 12L7.5 16.5"/></Icon>,
  TrendingDown: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 13.5L21 21m0 0h-7.5m7.5 0v-7.5M3 12h18M3 12L7.5 7.5M3 12L7.5 16.5"/></Icon>,
  Bot: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></Icon>,
  Play: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></Icon>,
  RefreshCw: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M23 4v6h-6M1 20v-6h6"/><path strokeLinecap="round" strokeLinejoin="round" d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Icon>,
  X: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>,
  Check: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></Icon>,
  User: ({ className }: { className?: string }) => <Icon className={className || "h-6 w-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Icon>,
  Customize: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></Icon>,
  Download: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></Icon>,
  Smartphone: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></Icon>,
  Shield: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" /></Icon>,
  AlertCircle: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></Icon>,
  ShieldCheck: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" /></Icon>,
  Users: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-3.833-6.247 4.144 4.144 0 00-4.713 2.607 4.125 4.125 0 003.8 4.22zM9 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-3.833-6.247 4.144 4.144 0 00-4.713 2.607 4.125 4.125 0 003.8 4.22zM12 12.75a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75zM21 12.75a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75zM5.25 12.75a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75z" /></Icon>,
  Activity: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></Icon>,
  ChevronRight: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></Icon>,
  FastForward: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5v14l8-7-8-7zm8 0v14l8-7-8-7z" /></Icon>,
  ForwardMatch: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></Icon>,
  Zap: ({ className, style }: { className?: string, style?: React.CSSProperties }) => <Icon className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></Icon>,
  Stats: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></Icon>,
  Database: ({ className }: { className?: string }) => <Icon className={className || "h-7 w-7"}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.128 16.556 17.975 12 17.975s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75" /></Icon>,
  Plus: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></Icon>,
  Venue: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v14.25A2.25 2.25 0 006 19.5h12a2.25 2.25 0 002.25-2.25V3m-18 0V1.5H21V3m-18 0h18M5.25 6h4.5m-4.5 3h4.5m-4.5 3h4.5m4.5-6h4.5m-4.5 3h4.5m-4.5 3h4.5m4.5-6h4.5m-4.5 3h4.5m-4.5 3h4.5" /></Icon>,
  Cloud: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 00.396-7.48 4.5 4.5 0 00-8.192-3.02 3 3 0 00-4.454 4.004A4.5 4.5 0 002.25 15z" /></Icon>,
  MapPin: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></Icon>,
  Schedule: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></Icon>,
  Menu: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></Icon>,
  AlertTriangle: ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></Icon>,
  Search: ({ className }: { className?: string }) => <Icon className={className || "h-5 w-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></Icon>,
};

export const SlantedContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 skew-x-[-12deg] bg-current opacity-10" />
        <div className="relative z-10">{children}</div>
    </div>
);

export const ActionButton = ({ onClick, children, variant = "primary", className = "" }: { onClick: () => void, children: React.ReactNode, variant?: "primary" | "secondary" | "danger", className?: string }) => {
    const styles = {
        primary: "bg-pink-600 hover:bg-pink-500 text-white",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
        danger: "bg-red-600 hover:bg-red-500 text-white"
    };
    return (
        <button onClick={onClick} className={`${styles[variant]} py-3 px-6 rounded-xl font-black italic tracking-tighter uppercase transition-all active:scale-95 shadow-lg ${className}`}>
            {children}
        </button>
    );
};
