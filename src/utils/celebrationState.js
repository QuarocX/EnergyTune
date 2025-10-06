// Simple global state for celebration
let celebrationState = {
  shouldCelebrate: false,
  completionType: 'complete'
};

export const setCelebrationState = (shouldCelebrate, completionType = 'complete') => {
  celebrationState.shouldCelebrate = shouldCelebrate;
  celebrationState.completionType = completionType;
};

export const getCelebrationState = () => {
  return { ...celebrationState };
};

export const clearCelebrationState = () => {
  celebrationState.shouldCelebrate = false;
  celebrationState.completionType = 'complete';
};
