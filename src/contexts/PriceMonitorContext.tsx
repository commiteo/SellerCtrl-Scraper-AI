import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PriceMonitorState {
  monitoredProducts: any[];
  priceHistory: any[];
  isLoading: boolean;
  isMonitoring: boolean;
  showAddForm: boolean;
  showHistory: boolean;
  lastUpdated: string;
}

interface PriceMonitorContextType {
  state: PriceMonitorState;
  setState: React.Dispatch<React.SetStateAction<PriceMonitorState>>;
  updateMonitoredProducts: (products: any[]) => void;
  updatePriceHistory: (history: any[]) => void;
  setLoading: (loading: boolean) => void;
  setMonitoring: (monitoring: boolean) => void;
  toggleAddForm: (show: boolean) => void;
  toggleHistory: (show: boolean) => void;
  updateLastUpdated: () => void;
}

const initialState: PriceMonitorState = {
  monitoredProducts: [],
  priceHistory: [],
  isLoading: false,
  isMonitoring: false,
  showAddForm: false,
  showHistory: false,
  lastUpdated: new Date().toLocaleTimeString()
};

const PriceMonitorContext = createContext<PriceMonitorContextType | undefined>(undefined);

export const usePriceMonitor = () => {
  const context = useContext(PriceMonitorContext);
  if (context === undefined) {
    throw new Error('usePriceMonitor must be used within a PriceMonitorProvider');
  }
  return context;
};

interface PriceMonitorProviderProps {
  children: ReactNode;
}

export const PriceMonitorProvider: React.FC<PriceMonitorProviderProps> = ({ children }) => {
  const [state, setState] = useState<PriceMonitorState>(initialState);

  const updateMonitoredProducts = (products: any[]) => {
    setState(prev => ({ ...prev, monitoredProducts: products }));
  };

  const updatePriceHistory = (history: any[]) => {
    setState(prev => ({ ...prev, priceHistory: history }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setMonitoring = (monitoring: boolean) => {
    setState(prev => ({ ...prev, isMonitoring: monitoring }));
  };

  const toggleAddForm = (show: boolean) => {
    setState(prev => ({ ...prev, showAddForm: show }));
  };

  const toggleHistory = (show: boolean) => {
    setState(prev => ({ ...prev, showHistory: show }));
  };

  const updateLastUpdated = () => {
    setState(prev => ({ ...prev, lastUpdated: new Date().toLocaleTimeString() }));
  };

  const value: PriceMonitorContextType = {
    state,
    setState,
    updateMonitoredProducts,
    updatePriceHistory,
    setLoading,
    setMonitoring,
    toggleAddForm,
    toggleHistory,
    updateLastUpdated
  };

  return (
    <PriceMonitorContext.Provider value={value}>
      {children}
    </PriceMonitorContext.Provider>
  );
}; 