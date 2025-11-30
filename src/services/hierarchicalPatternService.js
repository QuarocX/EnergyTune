/**
 * Hierarchical Pattern Service for EnergyTune
 * 
 * Pattern analysis using phrase extraction and similarity grouping
 */

class HierarchicalPatternService {
  constructor() {
    // Stop words to filter out
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each',
      'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
    ]);

    // Pattern filtering thresholds (Percentage Threshold + Minimum Frequency)
    this.patternLimits = {
      minPercentage: 5,      // Must be at least 5% of total mentions
      minFrequency: 3,        // Must appear at least 3 times
      maxPatterns: 10         // Safety cap: max 10 patterns
    };
  }

  /**
   * Yield control to event loop - allows abort checks and UI updates
   * Uses setTimeout(0) for React Native compatibility
   */
  async yieldToEventLoop() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Check if analysis should be aborted
   */
  checkAbort(shouldAbort) {
    if (shouldAbort && shouldAbort()) {
      throw new Error('Analysis aborted by user');
    }
  }

  /**
   * Main analysis with chunked processing
   * @param {Array} entries - Entry data to analyze
   * @param {String} type - 'stress' or 'energy'
   * @param {Function} shouldAbort - Function that returns true if analysis should be aborted
   * @param {Function} onProgress - Optional callback for progress updates
   */
  async analyzeHierarchicalPatterns(entries, type = 'stress', shouldAbort = null, onProgress = null) {
    try {
      console.log(`[PatternService] Starting analysis - type: ${type}, entries:`, entries?.length || 0);
      
      this.checkAbort(shouldAbort);
      
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        console.log('[PatternService] No entries provided, returning empty result');
        return { 
          type, 
          totalMentions: 0, 
          mainPatterns: [],
          discoveryMethod: 'phrase_grouping'
        };
      }

      const sourceKey = type === 'stress' ? 'stressSources' : 'energySources';
      const levelKey = type === 'stress' ? 'stressLevels' : 'energyLevels';

      // Chunk 1: Extract sources (chunked by entries)
      if (onProgress) onProgress({ stage: 'extracting', progress: 0.1 });
      console.log(`[PatternService] Extracting sources with key: ${sourceKey}`);
      
      const allSources = await this.extractSourcesChunked(entries, sourceKey, levelKey, shouldAbort, onProgress);
      console.log(`[PatternService] Extracted ${allSources?.length || 0} sources`);
      
      this.checkAbort(shouldAbort);
      
      if (!allSources || !Array.isArray(allSources) || allSources.length === 0) {
        console.log('[PatternService] No sources extracted, returning empty result');
        return { 
          type, 
          totalMentions: 0, 
          mainPatterns: [],
          discoveryMethod: 'phrase_grouping'
        };
      }

      // Run phrase-based analysis
      console.log('[PatternService] Running pattern analysis');
      if (onProgress) onProgress({ stage: 'analyzing', progress: 0.3 });
      const mainPatterns = await this.fastAnalysisChunked(allSources, shouldAbort, onProgress);
      console.log(`[PatternService] Analysis returned ${mainPatterns?.length || 0} patterns`);

      this.checkAbort(shouldAbort);

      // Chunk 3: Sort and filter patterns
      if (onProgress) onProgress({ stage: 'filtering', progress: 0.8 });
      const patternsArray = Array.isArray(mainPatterns) ? mainPatterns : [];
      console.log(`[PatternService] Final patterns array length: ${patternsArray.length}`);

      // Sort by percentage (descending)
      const sortedPatterns = patternsArray.sort((a, b) => {
        const aPct = a?.percentage || 0;
        const bPct = b?.percentage || 0;
        return bPct - aPct;
      });

      await this.yieldToEventLoop();
      this.checkAbort(shouldAbort);

      // Apply filtering: Percentage Threshold + Minimum Frequency
      const filteredPatterns = this.filterPatternsByThreshold(
        sortedPatterns, 
        allSources.length
      );

      if (onProgress) onProgress({ stage: 'complete', progress: 1.0 });

      const result = { 
        type, 
        totalMentions: allSources.length, 
        mainPatterns: filteredPatterns,
        discoveryMethod: 'phrase_grouping'
      };
      
      console.log(`[PatternService] Analysis complete - filtered from ${patternsArray.length} to ${filteredPatterns.length} patterns`);
      return result;
    } catch (error) {
      if (error.message === 'Analysis aborted by user') {
        console.log('[PatternService] Analysis aborted by user');
        throw error; // Re-throw abort errors
      }
      console.error('[PatternService] Error in analyzeHierarchicalPatterns:', error);
      console.error('[PatternService] Error stack:', error.stack);
      return { 
        type, 
        totalMentions: 0, 
        mainPatterns: [],
        discoveryMethod: 'error'
      };
    }
  }

  /**
   * Simple phrase frequency analysis
   */
  fastAnalysis(sources) {
    try {
      console.log('[PatternService] fastAnalysis called with', sources?.length || 0, 'sources');
      
      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        console.log('[PatternService] fastAnalysis: No sources, returning empty array');
        return [];
      }

      // Step 1: Extract all meaningful phrases
      const phraseCounts = {};
      const phraseSources = {};
      const phraseLevels = {};

      sources.forEach((source, idx) => {
        if (!source || !source.text) {
          console.warn(`[PatternService] fastAnalysis: Invalid source at index ${idx}:`, source);
          return;
        }
      // Extract 2-3 word phrases (most meaningful)
      const phrases = this.extractPhrases(source.text);
      
      phrases.forEach(phrase => {
        if (!phraseCounts[phrase]) {
          phraseCounts[phrase] = 0;
          phraseSources[phrase] = [];
          phraseLevels[phrase] = [];
        }
        phraseCounts[phrase]++;
        phraseSources[phrase].push(source);
        phraseLevels[phrase].push(source.level);
      });
    });

      // Step 2: Group similar phrases into categories
      const phraseData = Object.entries(phraseCounts)
        .filter(([_, count]) => count >= 1) // Include all, even single occurrences
        .map(([phrase, count]) => {
          const sourcesForPhrase = phraseSources[phrase] || [];
          const levelsForPhrase = phraseLevels[phrase] || [];
          const avgLevel = levelsForPhrase.length > 0
            ? levelsForPhrase.reduce((a, b) => a + b, 0) / levelsForPhrase.length
            : 5;
          
          return {
            phrase,
            count,
            sources: sourcesForPhrase,
            avgLevel
          };
        });
      
      console.log(`[PatternService] fastAnalysis: Grouping ${phraseData.length} phrases`);
      const categories = this.groupSimilarPhrases(phraseData);
      console.log(`[PatternService] fastAnalysis: Created ${categories?.length || 0} categories`);

      // Step 3: Build category structure
      const totalMentions = sources.length;
      const mainPatterns = [];

      if (!categories || !Array.isArray(categories)) {
        console.warn('[PatternService] fastAnalysis: categories is not an array:', categories);
        return [];
      }

      categories.forEach((category, idx) => {
        if (!category || !category.sources || !Array.isArray(category.sources)) {
          console.warn(`[PatternService] fastAnalysis: Invalid category at index ${idx}:`, category);
          return;
        }
        
        const frequency = category.sources.length;
        const percentage = Math.round((frequency / totalMentions) * 100);
        const avgImpact = category.sources.reduce((sum, s) => sum + (s?.level || 0), 0) / frequency;

      // Extract sub-patterns (top phrases within category)
      const subPatterns = category.phrases
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map(phraseData => {
          const dates = [...new Set(phraseData.sources.map(s => s.date))].sort().reverse();
          return {
            id: phraseData.phrase.replace(/\s+/g, '_'),
            label: this.formatLabel(phraseData.phrase),
            frequency: phraseData.count,
            avgImpact: Math.round(phraseData.avgLevel * 10) / 10,
            examples: [phraseData.phrase],
            dates: dates.slice(0, 5),
            recommendation: this.generateRecommendation(phraseData.phrase, phraseData.sources),
            sources: phraseData.sources
          };
        });

      const dates = [...new Set(category.sources.map(s => s.date))].sort().reverse();
      const examples = [...new Set(category.sources.map(s => s.text))].slice(0, 5);

        mainPatterns.push({
          id: `fast_${idx}`,
          label: category.label || 'Unknown',
          emoji: category.emoji || '📊',
          frequency,
          percentage,
          avgImpact: Math.round(avgImpact * 10) / 10,
          subPatterns: subPatterns || [],
          examples: examples || [],
          dates: dates.slice(0, 10),
          sources: category.sources
        });
      });

      console.log(`[PatternService] fastAnalysis: Returning ${mainPatterns.length} main patterns`);
      return mainPatterns;
    } catch (error) {
      console.error('[PatternService] Error in fastAnalysis:', error);
      console.error('[PatternService] Error stack:', error.stack);
      return [];
    }
  }

  /**
   * Chunked version of fastAnalysis - processes sources in batches with abort checks
   */
  async fastAnalysisChunked(sources, shouldAbort, onProgress) {
    try {
      console.log('[PatternService] fastAnalysisChunked called with', sources?.length || 0, 'sources');
      
      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        console.log('[PatternService] fastAnalysisChunked: No sources, returning empty array');
        return [];
      }

      this.checkAbort(shouldAbort);

      // Step 1: Extract all meaningful phrases (chunked)
      const phraseCounts = {};
      const phraseSources = {};
      const phraseLevels = {};
      const CHUNK_SIZE = 10; // Process 10 sources at a time

      for (let i = 0; i < sources.length; i += CHUNK_SIZE) {
        this.checkAbort(shouldAbort);
        
        const chunk = sources.slice(i, i + CHUNK_SIZE);
        chunk.forEach((source, idx) => {
          if (!source || !source.text) {
            console.warn(`[PatternService] fastAnalysisChunked: Invalid source at index ${i + idx}:`, source);
            return;
          }
          
          // Extract 2-3 word phrases (most meaningful)
          const phrases = this.extractPhrases(source.text);
          
          phrases.forEach(phrase => {
            if (!phraseCounts[phrase]) {
              phraseCounts[phrase] = 0;
              phraseSources[phrase] = [];
              phraseLevels[phrase] = [];
            }
            phraseCounts[phrase]++;
            phraseSources[phrase].push(source);
            phraseLevels[phrase].push(source.level);
          });
        });

        // Update progress
        if (onProgress) {
          const progress = 0.3 + (Math.min(i + CHUNK_SIZE, sources.length) / sources.length) * 0.3;
          onProgress({ stage: 'analyzing', progress });
        }

        // Yield to event loop
        await this.yieldToEventLoop();
      }

      this.checkAbort(shouldAbort);

      // Step 2: Group similar phrases into categories
      if (onProgress) onProgress({ stage: 'grouping', progress: 0.6 });
      const phraseData = Object.entries(phraseCounts)
        .filter(([_, count]) => count >= 1)
        .map(([phrase, count]) => {
          const sourcesForPhrase = phraseSources[phrase] || [];
          const levelsForPhrase = phraseLevels[phrase] || [];
          const avgLevel = levelsForPhrase.length > 0
            ? levelsForPhrase.reduce((a, b) => a + b, 0) / levelsForPhrase.length
            : 5;
          
          return {
            phrase,
            count,
            sources: sourcesForPhrase,
            avgLevel
          };
        });
      
      await this.yieldToEventLoop();
      this.checkAbort(shouldAbort);
      
      console.log(`[PatternService] fastAnalysisChunked: Grouping ${phraseData.length} phrases`);
      const categories = this.groupSimilarPhrases(phraseData);
      console.log(`[PatternService] fastAnalysisChunked: Created ${categories?.length || 0} categories`);

      this.checkAbort(shouldAbort);

      // Step 3: Build category structure (chunked)
      if (onProgress) onProgress({ stage: 'building', progress: 0.7 });
      const totalMentions = sources.length;
      const mainPatterns = [];

      if (!categories || !Array.isArray(categories)) {
        console.warn('[PatternService] fastAnalysisChunked: categories is not an array:', categories);
        return [];
      }

      const CATEGORY_CHUNK_SIZE = 3; // Process 3 categories at a time
      for (let i = 0; i < categories.length; i += CATEGORY_CHUNK_SIZE) {
        this.checkAbort(shouldAbort);
        
        const categoryChunk = categories.slice(i, i + CATEGORY_CHUNK_SIZE);
        categoryChunk.forEach((category, idx) => {
          if (!category || !category.sources || !Array.isArray(category.sources)) {
            console.warn(`[PatternService] fastAnalysisChunked: Invalid category at index ${i + idx}:`, category);
            return;
          }
          
          const frequency = category.sources.length;
          const percentage = Math.round((frequency / totalMentions) * 100);
          const avgImpact = category.sources.reduce((sum, s) => sum + (s?.level || 0), 0) / frequency;

          // Extract sub-patterns (top phrases within category)
          const subPatterns = category.phrases
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
            .map(phraseData => {
              const dates = [...new Set(phraseData.sources.map(s => s.date))].sort().reverse();
              return {
                id: phraseData.phrase.replace(/\s+/g, '_'),
                label: this.formatLabel(phraseData.phrase),
                frequency: phraseData.count,
                avgImpact: Math.round(phraseData.avgLevel * 10) / 10,
                examples: [phraseData.phrase],
                dates: dates.slice(0, 5),
                recommendation: this.generateRecommendation(phraseData.phrase, phraseData.sources),
                sources: phraseData.sources
              };
            });

          const dates = [...new Set(category.sources.map(s => s.date))].sort().reverse();
          const examples = [...new Set(category.sources.map(s => s.text))].slice(0, 5);

          mainPatterns.push({
            id: `fast_${i + idx}`,
            label: category.label || 'Unknown',
            emoji: category.emoji || '📊',
            frequency,
            percentage,
            avgImpact: Math.round(avgImpact * 10) / 10,
            subPatterns: subPatterns || [],
            examples: examples || [],
            dates: dates.slice(0, 10),
            sources: category.sources
          });
        });

        // Yield after each category chunk
        await this.yieldToEventLoop();
      }

      console.log(`[PatternService] fastAnalysisChunked: Returning ${mainPatterns.length} main patterns`);
      return mainPatterns;
    } catch (error) {
      if (error.message === 'Analysis aborted by user') {
        throw error; // Re-throw abort errors
      }
      console.error('[PatternService] Error in fastAnalysisChunked:', error);
      console.error('[PatternService] Error stack:', error.stack);
      return [];
    }
  }

  /**
   * Extract meaningful phrases from text (2-3 words)
   */
  extractPhrases(text) {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.has(w));

    const phrases = new Set();

    // Add 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (bigram.length > 4) {
        phrases.add(bigram);
      }
    }

    // Add 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (trigram.length > 6) {
        phrases.add(trigram);
      }
    }

    // Also add full text if it's a meaningful phrase
    if (text.length > 4 && text.length < 50) {
      phrases.add(text.toLowerCase());
    }

    return Array.from(phrases);
  }

  /**
   * Group similar phrases into categories using word overlap
   */
  groupSimilarPhrases(phraseData) {
    try {
      console.log('[PatternService] groupSimilarPhrases called with', phraseData?.length || 0, 'items');
      
      if (!phraseData || !Array.isArray(phraseData) || phraseData.length === 0) {
        console.log('[PatternService] groupSimilarPhrases: No phrase data, returning empty array');
        return [];
      }

      const categories = [];
      const processed = new Set();

      phraseData.forEach((item, idx) => {
        if (!item || typeof item !== 'object') {
          console.warn(`[PatternService] groupSimilarPhrases: Invalid item at index ${idx}:`, item);
          return;
        }
        
        const { phrase, count, sources, avgLevel } = item;
        
        if (!phrase || typeof phrase !== 'string') {
          console.warn(`[PatternService] groupSimilarPhrases: Invalid phrase at index ${idx}:`, phrase);
          return;
        }
        
        if (!sources || !Array.isArray(sources)) {
          console.warn(`[PatternService] groupSimilarPhrases: Invalid sources for phrase "${phrase}"`);
          return;
        }
      if (processed.has(phrase)) return;

      // Find similar phrases (share common words)
      const category = {
        label: this.generateLabelFromPhrase(phrase),
        emoji: this.selectEmojiForPhrase(phrase),
        phrases: [{ phrase, count, sources, avgLevel }],
        sources: [...sources]
      };

      // Find similar phrases
      phraseData.forEach(({ phrase: otherPhrase, count: otherCount, sources: otherSources, avgLevel: otherLevel }) => {
        if (processed.has(otherPhrase) || phrase === otherPhrase) return;

        const similarity = this.phraseSimilarity(phrase, otherPhrase);
        if (similarity > 0.3) { // 30% word overlap
          category.phrases.push({ phrase: otherPhrase, count: otherCount, sources: otherSources, avgLevel: otherLevel });
          category.sources.push(...otherSources);
          processed.add(otherPhrase);
        }
      });

        processed.add(phrase);
        categories.push(category);
      });

      console.log(`[PatternService] groupSimilarPhrases: Returning ${categories.length} categories`);
      return categories;
    } catch (error) {
      console.error('[PatternService] Error in groupSimilarPhrases:', error);
      console.error('[PatternService] Error stack:', error.stack);
      return [];
    }
  }

  /**
   * Calculate similarity between two phrases (Jaccard similarity)
   */
  phraseSimilarity(phrase1, phrase2) {
    const words1 = new Set(phrase1.split(/\s+/));
    const words2 = new Set(phrase2.split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Generate label from phrase
   */
  generateLabelFromPhrase(phrase) {
    // Use the phrase itself, capitalized
    return phrase.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  /**
   * Select emoji based on phrase content
   */
  selectEmojiForPhrase(phrase) {
    const lower = phrase.toLowerCase();
    
    if (lower.match(/\b(work|project|deadline|meeting|client|task|job)\b/)) return '💼';
    if (lower.match(/\b(sleep|rest|tired|exhausted|bed|night)\b/)) return '😴';
    if (lower.match(/\b(bike|cycling|ride|exercise|workout|gym|run|walk)\b/)) return '🏃';
    if (lower.match(/\b(sick|ill|pain|headache|doctor|health)\b/)) return '🏥';
    if (lower.match(/\b(friend|family|social|people|conversation|party)\b/)) return '👥';
    if (lower.match(/\b(series|documentary|movie|watching|tv|show)\b/)) return '🎬';
    if (lower.match(/\b(cook|meal|food|eating|dining)\b/)) return '🍳';
    if (lower.match(/\b(music|song|playlist|listening)\b/)) return '🎵';
    if (lower.match(/\b(computer|laptop|software|technical|bug|error)\b/)) return '💻';
    if (lower.match(/\b(money|financial|budget|bill|cost|expense)\b/)) return '💰';
    if (lower.match(/\b(traffic|commute|drive|travel)\b/)) return '🚗';
    if (lower.match(/\b(bureaucracy|government|paperwork|administration)\b/)) return '📋';
    if (lower.match(/\b(alone|solitude|quiet|peace|privacy)\b/)) return '🧘';
    
    return '📊';
  }

  /**
   * Extract sources with full context
   */
  extractSources(entries, sourceKey, levelKey) {
    if (!entries || !Array.isArray(entries)) {
      return [];
    }

    const sources = [];

    entries.forEach(entry => {
      if (!entry || typeof entry !== 'object') return;
      
      const sourceText = entry[sourceKey];
      if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) return;

      const levels = entry[levelKey] || {};
      const levelValues = Object.values(levels).filter(v => v !== null && v !== undefined);
      const avgLevel = levelValues.length > 0
        ? levelValues.reduce((sum, val) => sum + val, 0) / levelValues.length
        : 5;

      const individualSources = sourceText
        .split(/[,;]/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 2);

      individualSources.forEach(source => {
        sources.push({ 
          text: source, 
          originalText: source,
          fullEntry: sourceText,
          level: avgLevel, 
          date: entry.date,
          entryId: entry.date
        });
      });
    });

    return sources;
  }

  /**
   * Chunked version of extractSources - processes entries in batches with abort checks
   */
  async extractSourcesChunked(entries, sourceKey, levelKey, shouldAbort, onProgress) {
    if (!entries || !Array.isArray(entries)) {
      return [];
    }

    const sources = [];
    const CHUNK_SIZE = 5; // Process 5 entries at a time
    const totalEntries = entries.length;

    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      // Check abort before each chunk
      this.checkAbort(shouldAbort);
      
      // Process chunk
      const chunk = entries.slice(i, i + CHUNK_SIZE);
      chunk.forEach(entry => {
        if (!entry || typeof entry !== 'object') return;
        
        const sourceText = entry[sourceKey];
        if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) return;

        const levels = entry[levelKey] || {};
        const levelValues = Object.values(levels).filter(v => v !== null && v !== undefined);
        const avgLevel = levelValues.length > 0
          ? levelValues.reduce((sum, val) => sum + val, 0) / levelValues.length
          : 5;

        const individualSources = sourceText
          .split(/[,;]/)
          .map(s => s.trim().toLowerCase())
          .filter(s => s.length > 2);

        individualSources.forEach(source => {
          sources.push({ 
            text: source, 
            originalText: source,
            fullEntry: sourceText,
            level: avgLevel, 
            date: entry.date,
            entryId: entry.date
          });
        });
      });

      // Update progress
      if (onProgress) {
        const progress = 0.1 + (Math.min(i + CHUNK_SIZE, totalEntries) / totalEntries) * 0.1;
        onProgress({ stage: 'extracting', progress });
      }

      // Yield to event loop (allows abort checks and UI updates)
      await this.yieldToEventLoop();
    }

    return sources;
  }

  /**
   * DEEP MODE: Discover categories using TF-IDF + Hierarchical Clustering
   */
  discoverCategoriesWithClustering(sources) {
    // Limit to 50 sources for performance
    const sampledSources = sources.length > 50 
      ? this.sampleSources(sources, 50)
      : sources;

    const documents = sampledSources.map(s => this.tokenize(s.text));
    const tfidfMatrix = this.calculateTFIDF(documents);
    const similarityMatrix = this.buildSimilarityMatrix(tfidfMatrix);
    const clusters = this.hierarchicalClustering(sampledSources, similarityMatrix);
    const categories = this.extractCategoriesFromClusters(clusters, sampledSources.length);
    
    return categories;
  }

  /**
   * Chunked version of discoverCategoriesWithClustering
   */
  async discoverCategoriesWithClusteringChunked(sources, shouldAbort, onProgress) {
    this.checkAbort(shouldAbort);
    
    if (onProgress) onProgress({ stage: 'sampling', progress: 0.3 });
    
    // Limit to 50 sources for performance
    const sampledSources = sources.length > 50 
      ? this.sampleSources(sources, 50)
      : sources;

    await this.yieldToEventLoop();
    this.checkAbort(shouldAbort);

    if (onProgress) onProgress({ stage: 'tokenizing', progress: 0.4 });
    const documents = sampledSources.map(s => this.tokenize(s.text));
    
    await this.yieldToEventLoop();
    this.checkAbort(shouldAbort);

    if (onProgress) onProgress({ stage: 'calculating', progress: 0.5 });
    const tfidfMatrix = this.calculateTFIDF(documents);
    
    await this.yieldToEventLoop();
    this.checkAbort(shouldAbort);

    if (onProgress) onProgress({ stage: 'clustering', progress: 0.6 });
    const similarityMatrix = this.buildSimilarityMatrix(tfidfMatrix);
    
    await this.yieldToEventLoop();
    this.checkAbort(shouldAbort);

    if (onProgress) onProgress({ stage: 'extracting', progress: 0.7 });
    const clusters = this.hierarchicalClustering(sampledSources, similarityMatrix);
    
    await this.yieldToEventLoop();
    this.checkAbort(shouldAbort);

    if (onProgress) onProgress({ stage: 'finalizing', progress: 0.8 });
    const categories = this.extractCategoriesFromClusters(clusters, sampledSources.length);
    
    return categories;
  }

  /**
   * Sample sources for deep analysis (maintains diversity)
   */
  sampleSources(sources, maxCount) {
    if (sources.length <= maxCount) return sources;
    
    // Stratified sampling: take from different time periods
    const sorted = [...sources].sort((a, b) => new Date(a.date) - new Date(b.date));
    const step = Math.floor(sorted.length / maxCount);
    return sorted.filter((_, idx) => idx % step === 0).slice(0, maxCount);
  }

  /**
   * Tokenize text into meaningful terms
   */
  tokenize(text) {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.has(w));

    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (bigram.length > 4) {
        bigrams.push(bigram);
      }
    }

    const trigrams = [];
    for (let i = 0; i < words.length - 2; i++) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (trigram.length > 6) {
        trigrams.push(trigram);
      }
    }

    return [...words, ...bigrams, ...trigrams];
  }

  /**
   * Calculate TF-IDF matrix
   */
  calculateTFIDF(documents) {
    const numDocs = documents.length;
    const allTerms = new Set();
    
    documents.forEach(doc => {
      doc.forEach(term => allTerms.add(term));
    });

    const termList = Array.from(allTerms);
    const termIndex = {};
    termList.forEach((term, idx) => {
      termIndex[term] = idx;
    });

    const docFreq = new Array(termList.length).fill(0);
    documents.forEach(doc => {
      const uniqueTerms = new Set(doc);
      uniqueTerms.forEach(term => {
        if (termIndex[term] !== undefined) {
          docFreq[termIndex[term]]++;
        }
      });
    });

    const tfidfMatrix = documents.map(doc => {
      const vector = new Array(termList.length).fill(0);
      const termCounts = {};
      
      doc.forEach(term => {
        termCounts[term] = (termCounts[term] || 0) + 1;
      });

      Object.entries(termCounts).forEach(([term, count]) => {
        const idx = termIndex[term];
        if (idx !== undefined) {
          const tf = count / doc.length;
          const idf = Math.log(numDocs / (docFreq[idx] + 1));
          vector[idx] = tf * idf;
        }
      });

      return vector;
    });

    return { matrix: tfidfMatrix, termList, termIndex };
  }

  /**
   * Build cosine similarity matrix
   */
  buildSimilarityMatrix(tfidfData) {
    const { matrix } = tfidfData;
    const n = matrix.length;
    const similarity = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (i === j) {
          similarity[i][j] = 1.0;
        } else {
          similarity[i][j] = this.cosineSimilarity(matrix[i], matrix[j]);
          similarity[j][i] = similarity[i][j];
        }
      }
    }

    return similarity;
  }

  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Hierarchical Agglomerative Clustering
   */
  hierarchicalClustering(sources, similarityMatrix) {
    const n = sources.length;
    
    let clusters = sources.map((source, idx) => ({
      id: idx,
      items: [source],
      indices: [idx]
    }));

    const maxClusters = Math.min(8, Math.max(3, Math.floor(n / 2)));
    const minClusters = Math.min(3, Math.max(2, Math.floor(n / 3)));

    while (clusters.length > maxClusters) {
      let maxSim = -1;
      let mergeI = -1;
      let mergeJ = -1;

      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const sim = this.clusterSimilarity(clusters[i], clusters[j], similarityMatrix);
          if (sim > maxSim) {
            maxSim = sim;
            mergeI = i;
            mergeJ = j;
          }
        }
      }

      if (mergeI >= 0 && mergeJ >= 0 && maxSim > 0.15) {
        const merged = {
          id: clusters[mergeI].id,
          items: [...clusters[mergeI].items, ...clusters[mergeJ].items],
          indices: [...clusters[mergeI].indices, ...clusters[mergeJ].indices]
        };
        
        clusters = clusters.filter((_, idx) => idx !== mergeI && idx !== mergeJ);
        clusters.push(merged);
      } else {
        break;
      }
    }

    while (clusters.length < minClusters && clusters.length < n) {
      const largest = clusters.reduce((max, c) => c.items.length > max.items.length ? c : max, clusters[0]);
      if (largest.items.length > 1) {
        const mid = Math.floor(largest.items.length / 2);
        clusters = clusters.filter(c => c.id !== largest.id);
        clusters.push(
          { id: largest.id, items: largest.items.slice(0, mid), indices: largest.indices.slice(0, mid) },
          { id: largest.id + 1000, items: largest.items.slice(mid), indices: largest.indices.slice(mid) }
        );
      } else {
        break;
      }
    }

    return clusters;
  }

  /**
   * Calculate similarity between clusters
   */
  clusterSimilarity(clusterA, clusterB, similarityMatrix) {
    let maxSim = -1;
    
    clusterA.indices.forEach(idxA => {
      clusterB.indices.forEach(idxB => {
        const sim = similarityMatrix[idxA][idxB];
        if (sim > maxSim) {
          maxSim = sim;
        }
      });
    });

    return maxSim;
  }

  /**
   * Extract category labels from clusters
   */
  extractCategoriesFromClusters(clusters, totalMentions) {
    const categories = [];

    clusters.forEach((cluster, clusterIdx) => {
      if (cluster.items.length === 0) return;

      const frequency = cluster.items.length;
      const percentage = Math.round((frequency / totalMentions) * 100);
      const avgImpact = cluster.items.reduce((sum, item) => sum + item.level, 0) / frequency;

      const clusterDocs = cluster.items.map(item => this.tokenize(item.text));
      const allClusterTerms = new Set();
      clusterDocs.forEach(doc => doc.forEach(term => allClusterTerms.add(term)));

      const termScores = {};
      allClusterTerms.forEach(term => {
        let inClusterCount = 0;
        let totalOccurrences = 0;
        
        clusterDocs.forEach(doc => {
          if (doc.includes(term)) {
            inClusterCount++;
            totalOccurrences += doc.filter(t => t === term).length;
          }
        });

        const tf = totalOccurrences / clusterDocs.reduce((sum, d) => sum + d.length, 0);
        const idf = Math.log(clusters.length / (inClusterCount + 1));
        termScores[term] = tf * idf * inClusterCount;
      });

      const topTerms = Object.entries(termScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([term]) => term);

      const label = this.generateLabelFromTerms(topTerms, cluster.items);
      const emoji = this.selectEmojiForCategory(topTerms, cluster.items);
      const subPatterns = this.extractSubPatternsFromCluster(cluster.items);
      const dates = [...new Set(cluster.items.map(item => item.date))].sort().reverse();

      categories.push({
        id: `cluster_${clusterIdx}`,
        label,
        emoji,
        frequency,
        percentage,
        avgImpact: Math.round(avgImpact * 10) / 10,
        subPatterns: subPatterns.slice(0, 6),
        examples: [...new Set(cluster.items.map(item => item.text))].slice(0, 5),
        dates: dates.slice(0, 10),
        sources: cluster.items,
        distinctiveTerms: topTerms.slice(0, 3)
      });
    });

    return categories;
  }

  /**
   * Generate label from terms
   */
  generateLabelFromTerms(terms, items) {
    const phrases = terms.filter(t => t.includes(' '));
    const words = terms.filter(t => !t.includes(' '));

    if (phrases.length > 0) {
      const phrase = phrases[0];
      return phrase.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else if (words.length > 0) {
      const topWords = words.slice(0, 2);
      return topWords
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' & ');
    } else {
      return this.formatLabel(items[0]?.text || 'Pattern');
    }
  }

  /**
   * Select emoji for category
   */
  selectEmojiForCategory(terms, items) {
    const termStr = terms.join(' ').toLowerCase();
    const itemStr = items.map(i => i.text).join(' ').toLowerCase();
    const combined = termStr + ' ' + itemStr;

    if (combined.match(/\b(work|project|deadline|meeting|client|task|job)\b/)) return '💼';
    if (combined.match(/\b(sleep|rest|tired|exhausted|bed|night)\b/)) return '😴';
    if (combined.match(/\b(bike|cycling|ride|exercise|workout|gym|run|walk)\b/)) return '🏃';
    if (combined.match(/\b(sick|ill|pain|headache|doctor|health)\b/)) return '🏥';
    if (combined.match(/\b(friend|family|social|people|conversation|party)\b/)) return '👥';
    if (combined.match(/\b(series|documentary|movie|watching|tv|show)\b/)) return '🎬';
    if (combined.match(/\b(cook|meal|food|eating|dining)\b/)) return '🍳';
    if (combined.match(/\b(music|song|playlist|listening)\b/)) return '🎵';
    if (combined.match(/\b(computer|laptop|software|technical|bug|error)\b/)) return '💻';
    if (combined.match(/\b(money|financial|budget|bill|cost|expense)\b/)) return '💰';
    if (combined.match(/\b(traffic|commute|drive|travel)\b/)) return '🚗';
    if (combined.match(/\b(bureaucracy|government|paperwork|administration)\b/)) return '📋';
    if (combined.match(/\b(alone|solitude|quiet|peace|privacy)\b/)) return '🧘';
    
    return '📊';
  }

  /**
   * Extract sub-patterns from cluster
   */
  extractSubPatternsFromCluster(clusterItems) {
    const phraseGroups = {};
    
    clusterItems.forEach(item => {
      const tokens = this.tokenize(item.text);
      const phrases = tokens.filter(t => t.includes(' '));
      const key = phrases.length > 0 ? phrases[0] : tokens[0] || item.text;
      
      if (!phraseGroups[key]) {
        phraseGroups[key] = [];
      }
      phraseGroups[key].push(item);
    });

    return Object.entries(phraseGroups)
      .filter(([_, items]) => items.length >= 1)
      .map(([phrase, items]) => {
        const frequency = items.length;
        const avgImpact = items.reduce((sum, item) => sum + item.level, 0) / frequency;
        const dates = [...new Set(items.map(i => i.date))].sort().reverse();

        return {
          id: phrase.replace(/\s+/g, '_'),
          label: this.formatLabel(phrase),
          frequency,
          avgImpact: Math.round(avgImpact * 10) / 10,
          examples: [...new Set(items.map(i => i.text))].slice(0, 3),
          dates: dates.slice(0, 5),
          recommendation: this.generateRecommendation(phrase, items),
          sources: items
        };
      })
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Fallback: Use seed categories for very early data
   */
  async discoverCategoriesWithSeedsChunked(sources, shouldAbort, onProgress) {
    this.checkAbort(shouldAbort);
    
    // Use the same logic as discoverCategoriesWithSeeds but with yield points
    if (onProgress) onProgress({ stage: 'seeding', progress: 0.3 });
    
    // Implementation would go here - for now, call the original method with yields
    await this.yieldToEventLoop();
    this.checkAbort(shouldAbort);
    
    const result = this.discoverCategoriesWithSeeds(sources);
    
    await this.yieldToEventLoop();
    this.checkAbort(shouldAbort);
    
    return result;
  }

  discoverCategoriesWithSeeds(sources) {
    const seedCategories = {
      work: ['work', 'project', 'deadline', 'meeting', 'task'],
      health: ['sick', 'tired', 'pain', 'health', 'doctor'],
      personal: ['sleep', 'rest', 'relax', 'exercise', 'hobby']
    };

    const categorized = {};

    Object.keys(seedCategories).forEach(catId => {
      categorized[catId] = {
        id: catId,
        label: this.formatLabel(catId),
        emoji: catId === 'work' ? '💼' : catId === 'health' ? '🏥' : '🧘',
        sources: []
      };
    });

    categorized.other = { id: 'other', label: 'Other', emoji: '📋', sources: [] };

    sources.forEach(source => {
      const text = source.text.toLowerCase();
      let matched = false;

      for (const [catId, keywords] of Object.entries(seedCategories)) {
        if (keywords.some(kw => text.includes(kw))) {
          categorized[catId].sources.push(source);
          matched = true;
          break;
        }
      }

      if (!matched) {
        categorized.other.sources.push(source);
      }
    });

    const categories = [];
    const totalMentions = sources.length;

    Object.entries(categorized).forEach(([catId, category]) => {
      if (category.sources.length === 0) return;

      const frequency = category.sources.length;
      const percentage = Math.round((frequency / totalMentions) * 100);
      const avgImpact = category.sources.reduce((sum, s) => sum + s.level, 0) / frequency;

      const subPatterns = this.extractSubPatternsFromCluster(category.sources);
      const dates = [...new Set(category.sources.map(s => s.date))].sort().reverse();

      categories.push({
        id: catId,
        label: category.label,
        emoji: category.emoji,
        frequency,
        percentage,
        avgImpact: Math.round(avgImpact * 10) / 10,
        subPatterns: subPatterns.slice(0, 6),
        examples: [...new Set(category.sources.map(s => s.text))].slice(0, 5),
        dates: dates.slice(0, 10),
        sources: category.sources
      });
    });

    return categories;
  }

  /**
   * Generate recommendation
   */
  generateRecommendation(phrase, items) {
    const phraseLower = phrase.toLowerCase();
    const avgLevel = items.reduce((sum, i) => sum + i.level, 0) / items.length;

    if (phraseLower.includes('deadline') || phraseLower.includes('pressure')) {
      return 'Schedule buffer time before deadlines';
    }
    if (phraseLower.includes('bike') || phraseLower.includes('cycling') || phraseLower.includes('ride')) {
      return 'Regular cycling boosts energy - maintain consistent schedule';
    }
    if (phraseLower.includes('series') || phraseLower.includes('watching')) {
      return 'Balance screen time with other activities';
    }
    if (phraseLower.includes('sleep') || phraseLower.includes('tired')) {
      return 'Prioritize consistent sleep schedule';
    }
    if (phraseLower.includes('bureaucracy') || phraseLower.includes('government')) {
      return 'Plan for delays with external processes';
    }
    if (phraseLower.includes('alone') || phraseLower.includes('solitude')) {
      return 'Schedule regular alone time to recharge';
    }
    if (avgLevel > 7) {
      return 'This consistently boosts your energy - do more of this';
    }
    if (avgLevel < 4) {
      return 'Consider strategies to reduce this stressor';
    }

    return null;
  }

  formatLabel(text) {
    return text.replace(/_/g, ' ').split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /**
   * Get algorithm explanation
   */
  getAlgorithmExplanation() {
    return {
      title: 'How Pattern Discovery Works',
      sections: [
        {
          heading: '🔍 Pattern Analysis',
          content: 'Analyzes your entries using phrase frequency and similarity grouping to discover meaningful patterns in your stress and energy sources.'
        },
        {
          heading: '🧠 Dynamic Category Discovery',
          content: 'Categories are discovered from your actual words - no predefined labels. Categories are named using your vocabulary, making them personal and relevant.'
        },
        {
          heading: '📊 Smart Filtering',
          content: 'Only shows patterns that are statistically meaningful - appearing in at least 5% of your entries and at least 3 times total.'
        },
        {
          heading: '🔒 Privacy',
          content: 'All analysis happens locally on your device. Your data never leaves your phone.'
        }
      ],
      note: 'The analysis automatically discovers patterns from your entries and presents the most meaningful insights.'
    };
  }

  /**
   * Filter patterns by percentage threshold and minimum frequency (Approach 2)
   * Only includes patterns that are statistically meaningful
   * 
   * @param {Array} patterns - Sorted patterns (by percentage, descending)
   * @param {Number} totalMentions - Total number of source mentions
   * @returns {Array} Filtered patterns
   */
  filterPatternsByThreshold(patterns, totalMentions) {
    try {
      if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
        console.log('[PatternService] No patterns to filter');
        return [];
      }

      if (totalMentions === 0) {
        console.log('[PatternService] No total mentions, returning empty patterns');
        return [];
      }

      const limits = this.patternLimits;
      let { minPercentage, minFrequency, maxPatterns } = limits;

      // Adaptive thresholds for small datasets
      // If we have very few mentions, relax the thresholds to ensure we show something
      if (totalMentions < 10) {
        minPercentage = Math.max(1, minPercentage - 2); // Lower percentage threshold
        minFrequency = Math.max(1, minFrequency - 1);   // Lower frequency threshold
        maxPatterns = Math.min(5, maxPatterns);        // Fewer patterns for small data
        console.log('[PatternService] Small dataset detected - using relaxed thresholds:', {
          originalMinPercentage: limits.minPercentage,
          adjustedMinPercentage: minPercentage,
          originalMinFrequency: limits.minFrequency,
          adjustedMinFrequency: minFrequency
        });
      }

      console.log(`[PatternService] Filtering patterns with thresholds:`, {
        minPercentage: `${minPercentage}%`,
        minFrequency,
        maxPatterns,
        totalMentions,
        inputPatterns: patterns.length
      });

      // Filter patterns that meet both criteria:
      // 1. Percentage >= minPercentage
      // 2. Frequency >= minFrequency
      const filtered = patterns.filter(pattern => {
        const percentage = pattern?.percentage || 0;
        const frequency = pattern?.frequency || 0;
        
        const meetsPercentage = percentage >= minPercentage;
        const meetsFrequency = frequency >= minFrequency;
        
        const passes = meetsPercentage && meetsFrequency;
        
        if (!passes) {
          console.log(`[PatternService] Pattern "${pattern?.label}" filtered out:`, {
            percentage: `${percentage.toFixed(1)}%`,
            frequency,
            meetsPercentage,
            meetsFrequency
          });
        }
        
        return passes;
      });

      // Fallback: If all patterns were filtered out, return top patterns anyway
      // This ensures users always see something, even if thresholds are too strict
      let finalPatterns = filtered;
      if (filtered.length === 0 && patterns.length > 0) {
        console.warn('[PatternService] All patterns filtered out - using top patterns as fallback');
        // Return top 3 patterns sorted by percentage as fallback
        finalPatterns = patterns
          .sort((a, b) => (b?.percentage || 0) - (a?.percentage || 0))
          .slice(0, 3);
      }

      // Apply safety cap (maxPatterns)
      const capped = finalPatterns.slice(0, maxPatterns);

      // Log filtering results
      const filteredOut = patterns.length - filtered.length;
      const cappedOut = filtered.length - capped.length;
      
      console.log(`[PatternService] Pattern filtering complete:`, {
        original: patterns.length,
        afterThreshold: filtered.length,
        afterCap: capped.length,
        filteredOut,
        cappedOut: cappedOut > 0 ? cappedOut : 0,
        usedFallback: filtered.length === 0 && patterns.length > 0
      });

      // Log the patterns that made it through
      if (capped.length > 0) {
        console.log(`[PatternService] Top patterns included:`, 
          capped.map(p => ({
            label: p.label,
            percentage: `${p.percentage.toFixed(1)}%`,
            frequency: p.frequency
          }))
        );
      } else {
        console.warn('[PatternService] No patterns passed filtering - this may indicate data quality issues');
      }

      return capped;
    } catch (error) {
      console.error('[PatternService] Error filtering patterns:', error);
      console.error('[PatternService] Error stack:', error.stack);
      // Return original patterns if filtering fails (fail-safe)
      const safeLimit = this.patternLimits[mode]?.maxPatterns || 10;
      return patterns.slice(0, safeLimit);
    }
  }
}

export default new HierarchicalPatternService();
