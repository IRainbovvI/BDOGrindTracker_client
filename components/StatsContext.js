import React, { createContext, useContext, useState } from 'react';

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
  const [sharedState, setSharedState] = useState();

  const updateSharedState = (updatedState) => {
    setSharedState(updatedState);
  };

  return (
    <StatsContext.Provider value={{ sharedState, updateSharedState }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStatsContext = () => {
  return useContext(StatsContext);
};
