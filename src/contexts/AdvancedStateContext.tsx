import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ScrapingResult, ToastMessage } from '@/types';

// Types
interface AppState {
  // Scraping State
  scraping: {
    isActive: boolean;
    progress: number;
    currentTask: string;
    results: ScrapingResult[];
    errors: string[];
  };
  
  // Price Monitor State
  priceMonitor: {
    isRunning: boolean;
    monitoredProducts: number;
    alerts: ToastMessage[];
    lastUpdate: string;
  };
  
  // UI State
  ui: {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    notifications: ToastMessage[];
    loadingStates: Record<string, boolean>;
  };
  
  // Performance State
  performance: {
    responseTimes: Record<string, number>;
    cacheHits: number;
    cacheMisses: number;
    memoryUsage: number;
  };
}

// Action Types
type Action =
  | { type: 'START_SCRAPING'; payload: { task: string } }
  | { type: 'UPDATE_SCRAPING_PROGRESS'; payload: { progress: number; currentTask: string } }
  | { type: 'SCRAPING_COMPLETE'; payload: { results: ScrapingResult[]; errors: string[] } }
  | { type: 'STOP_SCRAPING' }
  | { type: 'UPDATE_PRICE_MONITOR'; payload: Partial<AppState['priceMonitor']> }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: ToastMessage }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: { key: string; loading: boolean } }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<AppState['performance']> };

// Initial State
const initialState: AppState = {
  scraping: {
    isActive: false,
    progress: 0,
    currentTask: '',
    results: [],
    errors: []
  },
  priceMonitor: {
    isRunning: false,
    monitoredProducts: 0,
    alerts: [],
    lastUpdate: ''
  },
  ui: {
    theme: 'dark',
    sidebarCollapsed: false,
    notifications: [],
    loadingStates: {}
  },
  performance: {
    responseTimes: {},
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0
  }
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_SCRAPING':
      return {
        ...state,
        scraping: {
          ...state.scraping,
          isActive: true,
          progress: 0,
          currentTask: action.payload.task,
          results: [],
          errors: []
        }
      };
      
    case 'UPDATE_SCRAPING_PROGRESS':
      return {
        ...state,
        scraping: {
          ...state.scraping,
          progress: action.payload.progress,
          currentTask: action.payload.currentTask
        }
      };
      
    case 'SCRAPING_COMPLETE':
      return {
        ...state,
        scraping: {
          ...state.scraping,
          isActive: false,
          progress: 100,
          results: action.payload.results,
          errors: action.payload.errors
        }
      };
      
    case 'STOP_SCRAPING':
      return {
        ...state,
        scraping: {
          ...state.scraping,
          isActive: false,
          progress: 0
        }
      };
      
    case 'UPDATE_PRICE_MONITOR':
      return {
        ...state,
        priceMonitor: {
          ...state.priceMonitor,
          ...action.payload
        }
      };
      
    case 'TOGGLE_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: state.ui.theme === 'light' ? 'dark' : 'light'
        }
      };
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed
        }
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload]
        }
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload.id)
        }
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loadingStates: {
            ...state.ui.loadingStates,
            [action.payload.key]: action.payload.loading
          }
        }
      };
      
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          ...action.payload
        }
      };
      
    default:
      return state;
  }
}

// Context
const AdvancedStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  actions: {
    startScraping: (task: string) => void;
    updateScrapingProgress: (progress: number, currentTask: string) => void;
    completeScraping: (results: ScrapingResult[], errors: string[]) => void;
    stopScraping: () => void;
    updatePriceMonitor: (updates: Partial<AppState['priceMonitor']>) => void;
    toggleTheme: () => void;
    toggleSidebar: () => void;
    addNotification: (notification: ToastMessage) => void;
    removeNotification: (id: string) => void;
    setLoading: (key: string, loading: boolean) => void;
    updatePerformance: (updates: Partial<AppState['performance']>) => void;
  };
} | null>(null);

// Provider Component
export function AdvancedStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    startScraping: useCallback((task: string) => {
      dispatch({ type: 'START_SCRAPING', payload: { task } });
    }, []),
    
    updateScrapingProgress: useCallback((progress: number, currentTask: string) => {
      dispatch({ type: 'UPDATE_SCRAPING_PROGRESS', payload: { progress, currentTask } });
    }, []),
    
    completeScraping: useCallback((results: ScrapingResult[], errors: string[]) => {
      dispatch({ type: 'SCRAPING_COMPLETE', payload: { results, errors } });
    }, []),
    
    stopScraping: useCallback(() => {
      dispatch({ type: 'STOP_SCRAPING' });
    }, []),
    
    updatePriceMonitor: useCallback((updates: Partial<AppState['priceMonitor']>) => {
      dispatch({ type: 'UPDATE_PRICE_MONITOR', payload: updates });
    }, []),
    
    toggleTheme: useCallback(() => {
      dispatch({ type: 'TOGGLE_THEME' });
    }, []),
    
    toggleSidebar: useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []),
    
    addNotification: useCallback((notification: ToastMessage) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }, []),
    
    removeNotification: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
    }, []),
    
    setLoading: useCallback((key: string, loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: { key, loading } });
    }, []),
    
    updatePerformance: useCallback((updates: Partial<AppState['performance']>) => {
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: updates });
    }, [])
  };

  return (
    <AdvancedStateContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AdvancedStateContext.Provider>
  );
}

// Hook
export function useAdvancedState() {
  const context = useContext(AdvancedStateContext);
  if (!context) {
    throw new Error('useAdvancedState must be used within AdvancedStateProvider');
  }
  return context;
}

// Selector Hooks
export function useScrapingState() {
  const { state } = useAdvancedState();
  return state.scraping;
}

export function usePriceMonitorState() {
  const { state } = useAdvancedState();
  return state.priceMonitor;
}

export function useUIState() {
  const { state } = useAdvancedState();
  return state.ui;
}

export function usePerformanceState() {
  const { state } = useAdvancedState();
  return state.performance;
}