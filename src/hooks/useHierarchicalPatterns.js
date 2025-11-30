import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import HierarchicalPatternService from '../services/hierarchicalPatternService';

/**
 * Custom hook for hierarchical pattern analysis
 * Supports both fast (default) and deep (on-demand) analysis modes
 */
export const useHierarchicalPatterns = (entries = []) => {
  const [loading, setLoading] = useState(false);
  const [deepAnalyzing, setDeepAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' or 'deep'
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false); // Track if analysis has been run
  const [analysisProgress, setAnalysisProgress] = useState({ 
    current: 0, 
    total: 0, 
    stage: '',
    percentage: 0,
    estimatedTimeRemaining: 0
  }); // Progress tracking
  
  // Track average calculation time for time estimation
  const [averageCalculationTime, setAverageCalculationTime] = useState(0);
  const calculationTimesRef = useRef([]);

  // Fast analysis results - only computed when manually triggered
  const [stressPatterns, setStressPatterns] = useState({ type: 'stress', totalMentions: 0, mainPatterns: [], mode: 'fast' });
  const [energyPatterns, setEnergyPatterns] = useState({ type: 'energy', totalMentions: 0, mainPatterns: [], mode: 'fast' });

  // Abort controller for cancellation
  const abortControllerRef = useRef(null);

  // Abort function to cancel running analysis
  const abortAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.aborted = true;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setLoading(false);
    setDeepAnalyzing(false);
    setAnalysisProgress({ current: 0, total: 0, stage: '', percentage: 0, estimatedTimeRemaining: 0 });
  }, []);

  const progressIntervalRef = useRef(null);

  // Run initial fast analysis on demand
  const runFastAnalysis = useCallback(async () => {
    if (loading || deepAnalyzing) return; // Prevent multiple simultaneous runs
    
    // Create new abort controller
    abortControllerRef.current = { aborted: false };
    setLoading(true);
    setError(null);
    
    // Clear patterns immediately when starting rerun (so UI shows loading instead of old patterns)
    setStressPatterns({ type: 'stress', totalMentions: 0, mainPatterns: [], mode: 'fast' });
    setEnergyPatterns({ type: 'energy', totalMentions: 0, mainPatterns: [], mode: 'fast' });

    try {
      // Ensure entries is safe
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        console.log('[useHierarchicalPatterns] No entries for fast analysis');
        setHasRunAnalysis(true);
        setLoading(false);
        return;
      }

      console.log('[useHierarchicalPatterns] Running fast analysis, entries:', entries.length);

      const startTime = Date.now();
      const totalEntries = entries.length;
      let progressInterval = null;
      
      // Calculate estimated time based on average
      const estimatedTotalTime = averageCalculationTime > 0 
        ? averageCalculationTime 
        : Math.max(800, totalEntries * 15); // Fallback: 15ms per entry, min 800ms
      
      // Stage-based progress model with optimistic continuous progress
      const stages = [
        { name: 'Preparing analysis...', weight: 0.05 },
        { name: 'Extracting sources...', weight: 0.15 },
        { name: 'Analyzing stress patterns...', weight: 0.35 },
        { name: 'Analyzing energy patterns...', weight: 0.35 },
        { name: 'Processing results...', weight: 0.10 }
      ];
      
      const progressState = { 
        currentStageIndex: 0, 
        stageProgress: 0,
        optimisticProgress: 0 // Always-increasing progress for smooth UX
      };
      
      // Calculate progress speed based on estimated time (ensures we reach ~90% by estimated time)
      const progressSpeed = 0.90 / (estimatedTotalTime / 50); // Reach 90% by estimated time
      
      // Guaranteed minimum: 1% per 500ms (0.5 seconds) = 0.01 per 500ms = 0.01 per 10 updates (50ms * 10)
      // So per 50ms update: 0.01 / 10 = 0.001 per update
      const guaranteedMinIncrement = 0.001; // 0.1% per 50ms = 1% per 500ms
      
      // Smooth continuous progress animation (optimistic - always moving forward)
      progressIntervalRef.current = setInterval(() => {
        // Check if aborted
        if (abortControllerRef.current?.aborted) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          return;
        }
        
        const elapsed = Date.now() - startTime;
        // Calculate estimated remaining time
        // If we're past estimated time, show a minimum estimate (don't show 0)
        let estimatedRemaining = 0;
        if (elapsed < estimatedTotalTime) {
          estimatedRemaining = Math.max(0, estimatedTotalTime - elapsed);
        } else {
          // Past estimated time - show a small buffer estimate (10-30 seconds)
          // This prevents confusing "0s remaining" when analysis is still running
          const bufferTime = Math.max(10, Math.min(30, (elapsed - estimatedTotalTime) / 1000));
          estimatedRemaining = bufferTime;
        }
        
        // Always increment optimistic progress for smooth UX (never gets stuck)
        // Guaranteed minimum: 1% per 500ms (0.1% per 50ms update)
        // Also use adaptive speed if it's faster
        const adaptiveIncrement = Math.max(progressSpeed, guaranteedMinIncrement);
        progressState.optimisticProgress += adaptiveIncrement;
        
        // Update stage progress smoothly (for stage display)
        if (progressState.currentStageIndex < stages.length - 1) {
          progressState.stageProgress += 0.025; // Increment stage progress
          progressState.stageProgress = Math.min(progressState.stageProgress, 1);
        }
        
        // Calculate actual progress based on stages (for reference)
        let cumulativeWeight = 0;
        for (let i = 0; i < progressState.currentStageIndex; i++) {
          cumulativeWeight += stages[i].weight;
        }
        const currentStageWeight = stages[progressState.currentStageIndex]?.weight || 0;
        const actualProgress = cumulativeWeight + currentStageWeight * Math.min(progressState.stageProgress, 1);
        
        // Use optimistic progress as primary (ensures smooth, continuous progress)
        // But don't let it get too far ahead of actual progress (max 15% ahead)
        // Cap at 95% until we're actually done
        const maxAhead = actualProgress + 0.15;
        const finalProgress = Math.min(
          Math.max(actualProgress, Math.min(progressState.optimisticProgress, maxAhead)),
          0.95
        );
        // Round to 1 decimal place for smoother display, then round to integer for percentage
        const percentage = Math.min(Math.round(finalProgress * 100), 95);
        
        setAnalysisProgress({
          current: Math.floor(totalEntries * finalProgress),
          total: totalEntries,
          stage: stages[progressState.currentStageIndex]?.name || 'Finalizing...',
          percentage,
          estimatedTimeRemaining: Math.round(estimatedRemaining / 1000) // in seconds
        });
      }, 50); // Update every 50ms for smooth animation

      // Stage 1: Initialization
      progressState.currentStageIndex = 0;
      progressState.stageProgress = 0;
      setAnalysisProgress({
        current: 0,
        total: totalEntries,
        stage: stages[0].name,
        percentage: 0,
        estimatedTimeRemaining: Math.round(estimatedTotalTime / 1000)
      });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Stage 2: Extract sources
      progressState.currentStageIndex = 1;
      progressState.stageProgress = 0;
      await new Promise(resolve => setTimeout(resolve, 150));

      // Stage 3: Analyze stress patterns
      progressState.currentStageIndex = 2;
      progressState.stageProgress = 0;
      const stressStartTime = Date.now();
      // Process stress patterns with chunked processing
      const stressResult = await (async () => {
        try {
          const shouldAbort = () => abortControllerRef.current?.aborted || false;
          const result = await HierarchicalPatternService.analyzeHierarchicalPatterns(
            entries, 
            'stress', 
            'fast',
            shouldAbort,
            (progress) => {
              // Update progress from service
              if (progress && progress.progress !== undefined) {
                const overallProgress = progress.progress * 0.5; // Stress is 50% of total
                setAnalysisProgress(prev => ({
                  ...prev,
                  stage: progress.stage || prev.stage,
                  percentage: Math.round(overallProgress * 100)
                }));
              }
            }
          );
          
          console.log('[useHierarchicalPatterns] Stress analysis result:', {
            totalMentions: result?.totalMentions,
            mainPatternsLength: result?.mainPatterns?.length,
            mode: result?.mode
          });
          
          // Ensure mainPatterns is always an array
          const safeResult = {
            type: result?.type || 'stress',
            totalMentions: result?.totalMentions || 0,
            mainPatterns: Array.isArray(result?.mainPatterns) ? result.mainPatterns : [],
            mode: result?.mode || 'fast',
            discoveryMethod: result?.discoveryMethod || 'none'
          };
          
          console.log('[useHierarchicalPatterns] Safe stress result:', safeResult.mainPatterns.length, 'patterns');
          return safeResult;
        } catch (err) {
          if (err.message === 'Analysis aborted by user') {
            throw err; // Re-throw abort errors
          }
          console.error('[useHierarchicalPatterns] Error in fast stress analysis:', err);
          console.error('[useHierarchicalPatterns] Error stack:', err.stack);
          return { type: 'stress', totalMentions: 0, mainPatterns: [], mode: 'fast' };
        }
      })();
      // Check if aborted
      if (abortControllerRef.current?.aborted) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        return;
      }

      const stressTime = Date.now() - stressStartTime;
      setStressPatterns(stressResult);

      // Stage 4: Analyze energy patterns
      progressState.currentStageIndex = 3;
      progressState.stageProgress = 0;
      const energyStartTime = Date.now();
      // Process energy patterns with chunked processing
      const energyResult = await (async () => {
        try {
          const shouldAbort = () => abortControllerRef.current?.aborted || false;
          const result = await HierarchicalPatternService.analyzeHierarchicalPatterns(
            entries, 
            'energy', 
            'fast',
            shouldAbort,
            (progress) => {
              // Update progress from service (energy is 50-100% of total)
              if (progress && progress.progress !== undefined) {
                const overallProgress = 0.5 + (progress.progress * 0.5); // Energy is second 50%
                setAnalysisProgress(prev => ({
                  ...prev,
                  stage: progress.stage || prev.stage,
                  percentage: Math.round(overallProgress * 100)
                }));
              }
            }
          );
          
          console.log('[useHierarchicalPatterns] Energy analysis result:', {
            totalMentions: result?.totalMentions,
            mainPatternsLength: result?.mainPatterns?.length,
            mode: result?.mode
          });
          
          // Ensure mainPatterns is always an array
          const safeResult = {
            type: result?.type || 'energy',
            totalMentions: result?.totalMentions || 0,
            mainPatterns: Array.isArray(result?.mainPatterns) ? result.mainPatterns : [],
            mode: result?.mode || 'fast',
            discoveryMethod: result?.discoveryMethod || 'none'
          };
          
          console.log('[useHierarchicalPatterns] Safe energy result:', safeResult.mainPatterns.length, 'patterns');
          return safeResult;
        } catch (err) {
          if (err.message === 'Analysis aborted by user') {
            throw err; // Re-throw abort errors
          }
          console.error('[useHierarchicalPatterns] Error in fast energy analysis:', err);
          console.error('[useHierarchicalPatterns] Error stack:', err.stack);
          return { type: 'energy', totalMentions: 0, mainPatterns: [], mode: 'fast' };
        }
      })();
      const energyTime = Date.now() - energyStartTime;
      setEnergyPatterns(energyResult);
      
      // Stage 5: Processing results
      progressState.currentStageIndex = 4;
      progressState.stageProgress = 0;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Calculate actual time and update average
      const totalTime = Date.now() - startTime;
      calculationTimesRef.current.push(totalTime);
      // Keep only last 5 calculations for average
      if (calculationTimesRef.current.length > 5) {
        calculationTimesRef.current.shift();
      }
      const newAverage = calculationTimesRef.current.reduce((a, b) => a + b, 0) / calculationTimesRef.current.length;
      setAverageCalculationTime(newAverage);
      
      // Check if aborted before finalizing
      if (abortControllerRef.current?.aborted) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        return;
      }

      // Clear progress interval and set to 100%
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setAnalysisProgress({
        current: totalEntries,
        total: totalEntries,
        stage: 'Complete!',
        percentage: 100,
        estimatedTimeRemaining: 0
      });
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Final abort check
      if (abortControllerRef.current?.aborted) {
        return;
      }
      
      setHasRunAnalysis(true);
      setAnalysisMode('fast');
      setAnalysisProgress({ current: 0, total: 0, stage: '', percentage: 0, estimatedTimeRemaining: 0 });
      
    } catch (err) {
      console.error('[useHierarchicalPatterns] Error running fast analysis:', err);
      setError(err.message);
      setAnalysisProgress({ current: 0, total: 0, stage: '', percentage: 0, estimatedTimeRemaining: 0 });
      // Clear interval if it exists
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } finally {
      // Only set loading to false if not aborted
      if (!abortControllerRef.current?.aborted) {
        setLoading(false);
      }
    }
  }, [entries, loading, deepAnalyzing]);

  // Deep analysis results (only computed when requested)
  const [deepStressPatterns, setDeepStressPatterns] = useState(null);
  const [deepEnergyPatterns, setDeepEnergyPatterns] = useState(null);

  // Run deep analysis on demand
  const runDeepAnalysis = useCallback(async () => {
    if (deepAnalyzing) return; // Prevent multiple simultaneous runs
    
    setDeepAnalyzing(true);
    setLoading(true);
    setError(null);

    try {
      // Ensure entries is safe
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        console.log('[useHierarchicalPatterns] No entries for deep analysis');
        setDeepStressPatterns({ type: 'stress', totalMentions: 0, mainPatterns: [], mode: 'deep' });
        setDeepEnergyPatterns({ type: 'energy', totalMentions: 0, mainPatterns: [], mode: 'deep' });
        setAnalysisMode('deep');
        return;
      }
      
      // Run in chunks to avoid blocking UI
      const chunkSize = 10;
      const totalEntries = entries.length;
      
      // Process stress patterns
      const stressResult = await new Promise((resolve) => {
        // Use setTimeout to yield to UI thread
        setTimeout(() => {
          try {
            const result = HierarchicalPatternService.analyzeHierarchicalPatterns(
              entries, 
              'stress', 
              'deep'
            );
            // Ensure mainPatterns is always an array
            resolve({
              ...result,
              mainPatterns: result.mainPatterns || []
            });
          } catch (err) {
            console.error('Error in deep stress analysis:', err);
            resolve({ type: 'stress', totalMentions: 0, mainPatterns: [], mode: 'deep' });
          }
        }, 50);
      });

      setDeepStressPatterns(stressResult);

      // Process energy patterns
      const energyResult = await new Promise((resolve) => {
        setTimeout(() => {
          try {
            const result = HierarchicalPatternService.analyzeHierarchicalPatterns(
              entries, 
              'energy', 
              'deep'
            );
            // Ensure mainPatterns is always an array
            resolve({
              ...result,
              mainPatterns: result.mainPatterns || []
            });
          } catch (err) {
            console.error('Error in deep energy analysis:', err);
            resolve({ type: 'energy', totalMentions: 0, mainPatterns: [], mode: 'deep' });
          }
        }, 50);
      });

      setDeepEnergyPatterns(energyResult);
      setAnalysisMode('deep');
      
    } catch (err) {
      console.error('Error running deep analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setDeepAnalyzing(false);
    }
  }, [entries, deepAnalyzing]);

  // Get current patterns based on mode
  const currentStressPatterns = analysisMode === 'deep' && deepStressPatterns 
    ? deepStressPatterns 
    : stressPatterns;
  
  const currentEnergyPatterns = analysisMode === 'deep' && deepEnergyPatterns 
    ? deepEnergyPatterns 
    : energyPatterns;

  // Debug logging
  console.log('[useHierarchicalPatterns] Current patterns:', {
    stressPatternsLength: currentStressPatterns?.mainPatterns?.length,
    energyPatternsLength: currentEnergyPatterns?.mainPatterns?.length,
    analysisMode
  });

  // Summary statistics
  const summary = useMemo(() => {
    try {
      console.log('[useHierarchicalPatterns] Computing summary:', {
        currentStressPatterns: currentStressPatterns ? 'exists' : 'null',
        currentEnergyPatterns: currentEnergyPatterns ? 'exists' : 'null',
        stressMainPatterns: currentStressPatterns?.mainPatterns ? 'exists' : 'null',
        energyMainPatterns: currentEnergyPatterns?.mainPatterns ? 'exists' : 'null'
      });

      // Defensive extraction with multiple fallbacks
      let stressPatternsArray = [];
      if (currentStressPatterns) {
        if (Array.isArray(currentStressPatterns.mainPatterns)) {
          stressPatternsArray = currentStressPatterns.mainPatterns;
        } else if (currentStressPatterns.mainPatterns === null || currentStressPatterns.mainPatterns === undefined) {
          stressPatternsArray = [];
        } else {
          console.warn('[useHierarchicalPatterns] stressPatterns.mainPatterns is not an array:', typeof currentStressPatterns.mainPatterns);
          stressPatternsArray = [];
        }
      }

      let energyPatternsArray = [];
      if (currentEnergyPatterns) {
        if (Array.isArray(currentEnergyPatterns.mainPatterns)) {
          energyPatternsArray = currentEnergyPatterns.mainPatterns;
        } else if (currentEnergyPatterns.mainPatterns === null || currentEnergyPatterns.mainPatterns === undefined) {
          energyPatternsArray = [];
        } else {
          console.warn('[useHierarchicalPatterns] energyPatterns.mainPatterns is not an array:', typeof currentEnergyPatterns.mainPatterns);
          energyPatternsArray = [];
        }
      }
      
      const totalStressPatterns = stressPatternsArray.length;
      const totalEnergyPatterns = energyPatternsArray.length;
      
      const topStressPattern = stressPatternsArray[0] || null;
      const topEnergyPattern = energyPatternsArray[0] || null;

      const summaryResult = {
        totalStressPatterns,
        totalEnergyPatterns,
        topStressPattern,
        topEnergyPattern,
        hasData: totalStressPatterns > 0 || totalEnergyPatterns > 0,
        mode: analysisMode,
        hasDeepResults: !!deepStressPatterns && !!deepEnergyPatterns
      };

      console.log('[useHierarchicalPatterns] Summary computed:', summaryResult);
      return summaryResult;
    } catch (error) {
      console.error('[useHierarchicalPatterns] Error computing summary:', error);
      console.error('[useHierarchicalPatterns] Error stack:', error.stack);
      return {
        totalStressPatterns: 0,
        totalEnergyPatterns: 0,
        topStressPattern: null,
        topEnergyPattern: null,
        hasData: false,
        mode: analysisMode,
        hasDeepResults: false
      };
    }
  }, [currentStressPatterns, currentEnergyPatterns, analysisMode, deepStressPatterns, deepEnergyPatterns]);

  // Switch back to fast mode
  const switchToFastMode = useCallback(() => {
    setAnalysisMode('fast');
    // Keep deep results cached in case user wants to switch back
  }, []);

  // Reset analysis when entries change significantly
  useEffect(() => {
    if (entries && Array.isArray(entries) && entries.length > 0) {
      // Reset all results if entries changed significantly
      setDeepStressPatterns(null);
      setDeepEnergyPatterns(null);
      setStressPatterns({ type: 'stress', totalMentions: 0, mainPatterns: [], mode: 'fast' });
      setEnergyPatterns({ type: 'energy', totalMentions: 0, mainPatterns: [], mode: 'fast' });
      setHasRunAnalysis(false);
      setAnalysisMode('fast');
    }
  }, [entries?.length]); // Only reset on entry count change, not content

  // Manual refresh function
  const refresh = useCallback(() => {
    // Fast analysis is already reactive via useMemo
    // This is mainly for UI feedback
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  }, []);

  return {
    stressPatterns: currentStressPatterns,
    energyPatterns: currentEnergyPatterns,
    summary,
    loading,
    deepAnalyzing,
    error,
    analysisMode,
    hasRunAnalysis,
    analysisProgress,
    averageCalculationTime,
    hasDeepResults: summary.hasDeepResults,
    runFastAnalysis,
    runDeepAnalysis,
    abortAnalysis,
    switchToFastMode,
    refresh
  };
};

export default useHierarchicalPatterns;
