import { createContext, useState, useContext } from 'react';

const StatusContext = createContext();

export const StatusProvider = ({ children }) => {
  const [status, setStatusState] = useState(() => {
    return localStorage.getItem('status') || 'online';
  });

  const setStatus = (newStatus) => {
    localStorage.setItem('status', newStatus);
    setStatusState(newStatus);
  };
  return (
    <StatusContext.Provider value={{ status, setStatus }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => useContext(StatusContext);