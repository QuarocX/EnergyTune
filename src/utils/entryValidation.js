export const isStepComplete = (entry, stepIndex) => {
  if (!entry) return false;
  
  if (stepIndex === 0) { // morning
    return entry.energyLevels.morning !== null && entry.stressLevels.morning !== null;
  } else if (stepIndex === 1) { // afternoon
    return entry.energyLevels.afternoon !== null && entry.stressLevels.afternoon !== null;
  } else if (stepIndex === 2) { // evening
    return entry.energyLevels.evening !== null && entry.stressLevels.evening !== null;
  } else if (stepIndex === 3) { // sources
    return entry.energySources?.trim() && entry.stressSources?.trim();
  }
  return false;
};

export const canContinueFromStep = (entry, currentStep, steps) => {
  if (currentStep < 3) {
    // For time periods, both energy and stress must be filled
    const period = steps[currentStep];
    return entry && entry.energyLevels[period] !== null && entry.stressLevels[period] !== null;
  } else {
    // For sources, both fields must have content
    return entry && entry.energySources?.trim() && entry.stressSources?.trim();
  }
};
