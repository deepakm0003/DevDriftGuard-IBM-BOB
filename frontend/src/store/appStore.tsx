import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { DebtIssue, ScanResult, FixResult, ChatMessage } from '../types';

interface AppState {
  repoUrl: string;
  scanResult: ScanResult | null;
  selectedIssue: DebtIssue | null;
  fixResult: FixResult | null;
  chatMessages: ChatMessage[];
  isScanning: boolean;
  isFixing: boolean;
  isPushing: boolean;
  isChatLoading: boolean;
  activeTab: 'findings' | 'dashboard' | 'roadmap';
  activeDetailView: 'detail' | 'fix' | 'tests';
  scanProgress: number;
  scanLog: Array<{ type: 'ok' | 'info' | 'warn' | 'error'; text: string }>;
}

type AppAction =
  | { type: 'SET_REPO_URL'; payload: string }
  | { type: 'START_SCAN' }
  | { type: 'SCAN_PROGRESS'; payload: number }
  | { type: 'ADD_LOG'; payload: { type: 'ok' | 'info' | 'warn' | 'error'; text: string } }
  | { type: 'SCAN_COMPLETE'; payload: ScanResult }
  | { type: 'SCAN_ERROR'; payload: string }
  | { type: 'SELECT_ISSUE'; payload: DebtIssue }
  | { type: 'START_FIX' }
  | { type: 'FIX_COMPLETE'; payload: FixResult }
  | { type: 'START_PUSH' }
  | { type: 'PUSH_COMPLETE' }
  | { type: 'ADD_CHAT'; payload: ChatMessage }
  | { type: 'SET_CHAT_LOADING'; payload: boolean }
  | { type: 'SET_TAB'; payload: 'findings' | 'dashboard' | 'roadmap' }
  | { type: 'SET_DETAIL_VIEW'; payload: 'detail' | 'fix' | 'tests' }
  | { type: 'RESET' };

const initialState: AppState = {
  repoUrl: '',
  scanResult: null,
  selectedIssue: null,
  fixResult: null,
  chatMessages: [
    {
      id: '1',
      role: 'bob',
      content: "Hi! I'm Bob, your AI development partner. Paste a GitHub repo URL on the left and I'll scan it for technical debt, score every issue by business impact, and generate ready-to-merge fixes. Ask me anything about your codebase.",
      timestamp: new Date(),
    },
  ],
  isScanning: false,
  isFixing: false,
  isPushing: false,
  isChatLoading: false,
  activeTab: 'findings',
  activeDetailView: 'detail',
  scanProgress: 0,
  scanLog: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_REPO_URL':
      return { ...state, repoUrl: action.payload };
    
    case 'START_SCAN':
      return {
        ...state,
        isScanning: true,
        scanProgress: 0,
        scanLog: [],
        scanResult: null,
        selectedIssue: null,
        fixResult: null,
      };
    
    case 'SCAN_PROGRESS':
      return { ...state, scanProgress: action.payload };
    
    case 'ADD_LOG':
      return {
        ...state,
        scanLog: [...state.scanLog, action.payload],
      };
    
    case 'SCAN_COMPLETE': {
      const result = action.payload;
      const bobMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'bob',
        content: `Scan complete! Found ${result.summary.total_issues} issues in ${result.repo_url.split('/').slice(-2).join('/')}.\n\nCritical: ${result.summary.critical} | High: ${result.summary.high} | Medium: ${result.summary.medium} | Low: ${result.summary.low}\n\nAuto-fixable: ${result.summary.auto_fixable} issues\nMonthly cost: $${Math.round(result.monthly_cost_estimate).toLocaleString()}\n\nClick any issue to see details and generate fixes.`,
        timestamp: new Date(),
      };
      
      return {
        ...state,
        isScanning: false,
        scanProgress: 100,
        scanResult: result,
        activeTab: 'findings',
        chatMessages: [...state.chatMessages, bobMessage],
      };
    }
    
    case 'SCAN_ERROR':
      return {
        ...state,
        isScanning: false,
        scanProgress: 0,
        scanLog: [...state.scanLog, { type: 'error', text: action.payload }],
      };
    
    case 'SELECT_ISSUE': {
      const issue = action.payload;
      const bobMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'bob',
        content: `Issue: ${issue.title}\n\nSeverity: ${issue.severity.toUpperCase()} | DCS: ${issue.dcs_score.toFixed(1)} | Priority: ${issue.fix_priority}\nFile: ${issue.file_path}\nFix time: ${issue.estimated_fix_hours}h | ${issue.roi_if_fixed_now}\n\n${issue.auto_fixable ? 'This issue is auto-fixable. Click "Auto-Fix with Bob" to generate a solution.' : 'This issue requires manual review.'}`,
        timestamp: new Date(),
      };
      
      return {
        ...state,
        selectedIssue: issue,
        activeTab: 'findings',
        activeDetailView: 'detail',
        fixResult: null,
        chatMessages: [...state.chatMessages, bobMessage],
      };
    }
    
    case 'START_FIX':
      return { ...state, isFixing: true };
    
    case 'FIX_COMPLETE':
      return {
        ...state,
        isFixing: false,
        fixResult: action.payload,
        activeDetailView: 'fix',
      };
    
    case 'START_PUSH':
      return { ...state, isPushing: true };
    
    case 'PUSH_COMPLETE':
      return { ...state, isPushing: false };
    
    case 'ADD_CHAT':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };
    
    case 'SET_CHAT_LOADING':
      return { ...state, isChatLoading: action.payload };
    
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_DETAIL_VIEW':
      return { ...state, activeDetailView: action.payload };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within AppProvider');
  }
  return context;
}

// Made with Bob
