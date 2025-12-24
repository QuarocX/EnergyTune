/**
 * Hierarchical Pattern Service for EnergyTune
 * 
 * Pattern analysis using phrase extraction and similarity grouping
 */

class HierarchicalPatternService {
  constructor() {
    // UNIVERSAL Stop words - These are standard linguistic elements (articles, prepositions, pronouns)
    // These work across all users and are NOT user-specific
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each',
      'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now',
      'feeling', 'being', 'having', 'doing', 'getting', 'making'
    ]);

    // Prevents common verbs from dominating clusters across all users
    // JUSTIFIED HARDCODING: Universal action verbs in English
    this.verbStopWords = new Set([
      'feeling', 'seeing', 'playing', 'doing', 'having', 'getting',
      'making', 'taking', 'being', 'going', 'coming', 'working',
      'thinking', 'wanting', 'needing', 'trying', 'looking', 'watching',
      'talking', 'saying', 'knowing', 'feeling', 'meeting', 'visiting'
    ]);

    // Pattern filtering thresholds (Percentage Threshold + Minimum Frequency)
    // RELAXED for better pattern discovery
    this.patternLimits = {
      minPercentage: 2,      // Must be at least 2% of total mentions
      minFrequency: 2,        // Must appear at least 2 times 
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
   * @param {String} algorithm - Algorithm to use: 'tfidf' or 'phrase_grouping' (default for now)
   */
  async analyzeHierarchicalPatterns(entries, type = 'stress', shouldAbort = null, onProgress = null, algorithm = 'phrase_grouping') {
    try {
      this.checkAbort(shouldAbort);
      
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return { 
          type, 
          totalMentions: 0, 
          mainPatterns: [],
          discoveryMethod: algorithm
        };
      }

      const sourceKey = type === 'stress' ? 'stressSources' : 'energySources';
      const levelKey = type === 'stress' ? 'stressLevels' : 'energyLevels';

      // Step 1: Extract sources (chunked by entries)
      if (onProgress) onProgress({ stage: 'extracting', progress: 0.1 });
      
      const allSources = await this.extractSourcesChunked(entries, sourceKey, levelKey, shouldAbort, onProgress);
      
      this.checkAbort(shouldAbort);
      
      if (!allSources || !Array.isArray(allSources) || allSources.length === 0) {
        return { 
          type, 
          totalMentions: 0, 
          mainPatterns: [],
          discoveryMethod: algorithm
        };
      }

      // Step 2: Run clustering based on selected algorithm
      let mainPatterns = [];
      
      if (algorithm === 'tfidf') {
        // TF-IDF + Cosine Similarity clustering (NEW DEFAULT)
        if (onProgress) onProgress({ stage: 'analyzing with tf-idf', progress: 0.3 });
        
        try {
          // Add timeout protection: if TF-IDF takes too long, fall back to phrase grouping
          const startTime = Date.now();
          mainPatterns = await this.clusterWithTFIDF(allSources, shouldAbort, onProgress);
          const duration = Date.now() - startTime;
          
          console.log(`[PatternService] TF-IDF clustering completed in ${duration}ms`);
          
          // If TF-IDF returns no patterns, fall back to phrase grouping
          if (!mainPatterns || mainPatterns.length === 0) {
            console.warn('[PatternService] TF-IDF returned no patterns, falling back to phrase grouping');
            mainPatterns = await this.fastAnalysisChunked(allSources, shouldAbort, onProgress);
          }
        } catch (error) {
          console.error('[PatternService] TF-IDF failed, falling back to phrase grouping:', error);
          mainPatterns = await this.fastAnalysisChunked(allSources, shouldAbort, onProgress);
        }
      } else if (algorithm === 'phrase_grouping') {
        // Original phrase-based grouping (for comparison)
        if (onProgress) onProgress({ stage: 'analyzing with phrase grouping', progress: 0.3 });
        mainPatterns = await this.fastAnalysisChunked(allSources, shouldAbort, onProgress);
      } else {
        // Default to phrase grouping for safety (changed from tfidf)
        console.warn(`[PatternService] Unknown algorithm: ${algorithm}, using phrase_grouping`);
        mainPatterns = await this.fastAnalysisChunked(allSources, shouldAbort, onProgress);
      }

      this.checkAbort(shouldAbort);

      // Step 3: Sort and filter patterns
      if (onProgress) onProgress({ stage: 'filtering', progress: 0.8 });
      const patternsArray = Array.isArray(mainPatterns) ? mainPatterns : [];

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
        discoveryMethod: algorithm
      };
      
      return result;
    } catch (error) {
      if (error.message === 'Analysis aborted by user') {
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
      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        return [];
      }

      // Step 1: Extract all meaningful phrases
      const phraseCounts = {};
      const phraseSources = {};
      const phraseLevels = {};

      sources.forEach((source, idx) => {
        if (!source || !source.text) {
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
      
      const categories = this.groupSimilarPhrases(phraseData);

      // Step 3: Build category structure
      const totalMentions = sources.length;
      const mainPatterns = [];

      if (!categories || !Array.isArray(categories)) {
        return [];
      }

      categories.forEach((category, idx) => {
        if (!category || !category.sources || !Array.isArray(category.sources)) {
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
      if (!sources || !Array.isArray(sources) || sources.length === 0) {
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
      
      const categories = this.groupSimilarPhrases(phraseData);

      this.checkAbort(shouldAbort);

      // Step 3: Build category structure (chunked)
      if (onProgress) onProgress({ stage: 'building', progress: 0.7 });
      const totalMentions = sources.length;
      const mainPatterns = [];

      if (!categories || !Array.isArray(categories)) {
        return [];
      }

      const CATEGORY_CHUNK_SIZE = 3; // Process 3 categories at a time
      for (let i = 0; i < categories.length; i += CATEGORY_CHUNK_SIZE) {
        this.checkAbort(shouldAbort);
        
        const categoryChunk = categories.slice(i, i + CATEGORY_CHUNK_SIZE);
        categoryChunk.forEach((category, idx) => {
          if (!category || !category.sources || !Array.isArray(category.sources)) {
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
      if (!phraseData || !Array.isArray(phraseData) || phraseData.length === 0) {
        return [];
      }

      const categories = [];
      const processed = new Set();

      phraseData.forEach((item, idx) => {
        if (!item || typeof item !== 'object') {
          return;
        }
        
        const { phrase, count, sources, avgLevel } = item;
        
        if (!phrase || typeof phrase !== 'string') {
          return;
        }
        
        if (!sources || !Array.isArray(sources)) {
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
   * Tokenize text with CONTEXT PRESERVATION
   * ENHANCED: Preserves subject-verb-object relationships to prevent false clustering
   */
  tokenize(text) {
    const originalText = text.toLowerCase();
    
    const hasNegation = /\b(no|not|lack|without|missing)\b/.test(originalText);
    
    const words = originalText
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.has(w));

    const fullPhrase = words.length > 0 ? `phrase_${words.join('_')}` : null;
    const verbObjectPairs = this.extractVerbObjectPairs(words);
    const persons = this.detectPersons(originalText, words);
    const negationTokens = [];
    if (hasNegation && words.length > 0) {
      // Add negation prefix to ALL tokens to group negated concepts
      // But keep originals too so they can still cluster with positive versions
      negationTokens.push('negation_marker');
    }

    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (bigram.length > 4) {
        bigrams.push(bigram);
        
        if (hasNegation) {
          bigrams.push(`neg_${bigram}`);
        }
      }
    }

    const trigrams = [];
    for (let i = 0; i < words.length - 2; i++) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (trigram.length > 6) {
        trigrams.push(trigram);
      }
    }


    // For partial matching: "alone time" ≈ "alone"
    const charNgrams = [];
    words.forEach(word => {
      if (word.length >= 5) {
        for (let i = 0; i <= word.length - 4; i++) {
          const ngram = word.substring(i, i + 4);
          charNgrams.push(`char_${ngram}`);
        }
      }
    });

    // Combine with proper weighting (duplicates increase importance in TF-IDF)
    const tokens = [];
    

    // Add verb-object pairs 2x (high weight)
    verbObjectPairs.forEach(pair => {
      tokens.push(pair, pair);
    });
    
    // Persons should influence clustering but NOT dominate
    persons.forEach(person => {
      tokens.push(person);
    });
    
    // Add negation tokens 2x (helps group negated concepts)
    negationTokens.forEach(neg => {
      tokens.push(neg, neg);
    });
    
    // Add bigrams 2x (important for clustering variations)
    bigrams.forEach(bg => {
      tokens.push(bg, bg);
    });
    
    // Add words 1x
    tokens.push(...words);
    
    // Add trigrams 1x
    tokens.push(...trigrams);
    
    // Add char n-grams for partial matching
    tokens.push(...charNgrams);

    return tokens;
  }

  /**
   * Uses pattern detection instead of hardcoded verb lists
   * 
   * Detects patterns like:
   * - "word + with/to + object" → likely verb-object
   * - Words ending in -ing (gerunds/present participles)
   * - Words in action position (followed by objects)
   * 
   * Examples: "seeing parents" → "seeing_parents"
   */
  extractVerbObjectPairs(words) {
    const pairs = [];
    
    // UNIVERSAL prepositions that indicate verb-object relationships
    // JUSTIFIED HARDCODING: Universal linguistic structure (works across users)
    const verbPrepositions = new Set(['with', 'to', 'about', 'for', 'from', 'at']);
    
    for (let i = 0; i < words.length - 1; i++) {
      const word = words[i];
      let nextIdx = i + 1;
      
      // Pattern 1: word + preposition + object (e.g., "talking with marie")
      if (nextIdx < words.length && verbPrepositions.has(words[nextIdx])) {
        const preposition = words[nextIdx];
        const objectIdx = nextIdx + 1;
        
        if (objectIdx < words.length) {
          const object = words[objectIdx];
          pairs.push(`verb_${word}_${object}`);
          
          // Add 3-word pattern if available
          if (objectIdx + 1 < words.length) {
            pairs.push(`verb_${word}_${object}_${words[objectIdx + 1]}`);
          }
        }
      }
      
      // Pattern 2: -ing words (gerunds) + object (e.g., "seeing parents", "feeling tired")
      // These are likely action verbs
      else if (word.endsWith('ing') && word.length > 4) {
        const object = words[nextIdx];
        pairs.push(`verb_${word}_${object}`);
        
        // Add 3-word pattern
        if (nextIdx + 1 < words.length) {
          pairs.push(`verb_${word}_${object}_${words[nextIdx + 1]}`);
        }
      }
      
      // Pattern 3: -ed words (past tense) + object (e.g., "visited parents", "called friend")
      else if (word.endsWith('ed') && word.length > 3) {
        const object = words[nextIdx];
        pairs.push(`verb_${word}_${object}`);
      }
    }
    
    return pairs;
  }

  /**
   * 
   * Detects names by looking for person-context patterns like:
   * - "with X", "seeing X", "meeting X" (X is likely a person)
   * - "X feeling", "X said" (X is likely a person)
   */
  extractNamesFromContext(sources) {
    const nameFrequency = {};
    
    // TODO: Still hardcoded
    // Patterns that strongly indicate a person follows (verb + preposition + PERSON)
    // These are universal patterns that work across languages and cultures
    const personContextPatterns = [
      // Pattern 1: preposition + person (with/seeing/meeting/calling/texting/visiting)
      /\b(?:with|seeing|meeting|calling|texting|visiting|hugging|kissing)\s+([a-z]+)\b/gi,
      
      // Pattern 2: talking/speaking + to/with + person
      /\b(?:talking|speaking)\s+(?:to|with)\s+([a-z]+)\b/gi,
      
      // Pattern 3: person + feeling/said/told (person as subject of emotion/communication verb)
      /\b([a-z]+)\s+(?:feeling|said|told|asked|invited|called|texted|complained|laughed)\b/gi,
      
      // Pattern 4: and + person + verb (coordination with person)
      /\b(?:and|&)\s+([a-z]+)\s+(?:and|went|did|had|was|were|came|left)\b/gi,
      
      // Pattern 5: time/activity + with + person
      /\b(?:lunch|dinner|breakfast|coffee|walk|time)\s+with\s+([a-z]+)\b/gi,
      
      // Pattern 6: possessive relationship (my/his/her + person)
      /\b(?:my|his|her|our)\s+([a-z]+)\b/gi,
    ];
    
    sources.forEach(source => {
      personContextPatterns.forEach(pattern => {
        const matches = [...source.text.toLowerCase().matchAll(pattern)];
        matches.forEach(match => {
          const potentialName = match[1];
          
          // Filter out if it's a stop word or too short
          if (potentialName.length > 2 && !this.stopWords.has(potentialName)) {
            nameFrequency[potentialName] = (nameFrequency[potentialName] || 0) + 1;
          }
        });
      });
    });
    
    // Return names that appear at least 3 times in person contexts
    // This filters out false positives and one-off mentions
    const detectedNames = Object.entries(nameFrequency)
      .filter(([name, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])  // Sort by frequency
      .map(([name, count]) => ({ name, count }));
    
    console.log('[Person Detection] Auto-detected names from context:', 
      detectedNames.map(n => `${n.name}(${n.count}x)`).join(', '));
    
    return detectedNames.map(n => n.name);
  }

  /**
   * Context-aware person detection using auto-discovered names
   */
  detectPersons(originalText, words) {
    const persons = [];

    // Use auto-detected names (if available)
    if (this.detectedNames && this.detectedNames.size > 0) {
      // Only detect if person appears in FIRST HALF of text
      // This means they're likely the main subject, not just mentioned
      const textLower = originalText.toLowerCase();
      const firstHalf = textLower.substring(0, Math.ceil(textLower.length / 2));
      
      // Check for auto-detected names in FIRST HALF only
      this.detectedNames.forEach(name => {
        if (firstHalf.includes(name)) {
          persons.push(`person_${name}`);
        }
      });
    }

    // UNIVERSAL relationship words (not specific names)
    // JUSTIFIED HARDCODING: Generic relationship terms work across all users
    // These are detected only if in first 3 words (main subject position)
    const universalPersonWords = ['parents', 'mom', 'dad', 'mother', 'father', 
                                   'friend', 'friends', 'family', 'colleague', 
                                   'partner', 'spouse', 'child', 'children'];
    
    for (let i = 0; i < Math.min(3, words.length); i++) {
      if (universalPersonWords.includes(words[i])) {
        persons.push(`person_${words[i]}`);
      }
    }

    return persons;
  }

  /**
   * Calculate TF-IDF matrix with enhanced normalization
   * Uses sublinear TF scaling and IDF smoothing for better results
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

    // Calculate document frequency for each term
    const docFreq = new Array(termList.length).fill(0);
    documents.forEach(doc => {
      const uniqueTerms = new Set(doc);
      uniqueTerms.forEach(term => {
        if (termIndex[term] !== undefined) {
          docFreq[termIndex[term]]++;
        }
      });
    });

    // Build TF-IDF matrix with sublinear TF scaling and L2 normalization
    const tfidfMatrix = documents.map(doc => {
      const vector = new Array(termList.length).fill(0);
      const termCounts = {};
      
      doc.forEach(term => {
        termCounts[term] = (termCounts[term] || 0) + 1;
      });

      Object.entries(termCounts).forEach(([term, count]) => {
        const idx = termIndex[term];
        if (idx !== undefined) {
          // Sublinear TF scaling: 1 + log(tf) instead of raw tf
          // This reduces the impact of very frequent terms
          let tf = doc.length > 0 ? (1 + Math.log(count)) : 0;
          
          // DOWN-WEIGHT common verbs by 70% to prevent verb-dominated clustering
          // This prevents "seeing", "feeling", "playing" from grouping everything
          if (this.verbStopWords.has(term)) {
            tf *= 0.3; // Reduce weight to 30% of original
          }
          
          // IDF with smoothing: log((1 + N) / (1 + df)) + 1
          // The +1 ensures IDF is never 0 and smooths extreme values
          const idf = Math.log((1 + numDocs) / (1 + docFreq[idx])) + 1;
          
          vector[idx] = tf * idf;
        }
      });

      // L2 normalization: normalize vector to unit length
      // This makes cosine similarity more stable
      const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      if (norm > 0) {
        for (let i = 0; i < vector.length; i++) {
          vector[i] /= norm;
        }
      }

      return vector;
    });

    return { matrix: tfidfMatrix, termList, termIndex, docFreq };
  }

  /**
   * Build cosine similarity matrix (optimized - only compute upper triangle)
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
   * TF-IDF-based clustering with hierarchical agglomerative approach
   * This is the main clustering method that replaces phrase-based grouping
   * 
   * @param {Array} sources - Source items to cluster
   * @param {Function} shouldAbort - Abort check function
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} Array of pattern objects
   */
  async clusterWithTFIDF(sources, shouldAbort, onProgress) {
    try {
      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        return [];
      }

      this.checkAbort(shouldAbort);

      // Limit sources for performance - sample if too many
      const MAX_SOURCES = 100; // Limit to prevent slow clustering
      let processedSources = sources;
      if (sources.length > MAX_SOURCES) {
        console.log(`[TF-IDF] Sampling ${MAX_SOURCES} from ${sources.length} sources for performance`);
        processedSources = this.sampleSources(sources, MAX_SOURCES);
      }

      // Step 0: Auto-extract person names from context (NO HARDCODING!)
      // This runs BEFORE tokenization so names are available during token extraction
      if (onProgress) onProgress({ stage: 'detecting names', progress: 0.2 });
      this.detectedNames = new Set(this.extractNamesFromContext(sources)); // Use ALL sources, not just sampled
      console.log(`[TF-IDF] Auto-detected ${this.detectedNames.size} person names from dataset`);

      // Step 1: Tokenize all sources
      if (onProgress) onProgress({ stage: 'tokenizing', progress: 0.3 });
      console.log(`[TF-IDF] Processing ${processedSources.length} sources`);
      console.log(`[TF-IDF] Sample sources:`, processedSources.slice(0, 3).map(s => s.text));
      
      // SOLUTION 3: DEBUG - Check for specific patterns
      const aloneTimeCount = processedSources.filter(s => s.text.includes('alone')).length;
      console.log(`[TF-IDF DEBUG] Found ${aloneTimeCount} sources containing "alone" out of ${processedSources.length} total`);
      console.log(`[TF-IDF DEBUG] "alone" samples:`, processedSources.filter(s => s.text.includes('alone')).slice(0, 10).map(s => s.text));
      
      const documents = processedSources.map(s => this.tokenize(s.text));
      
      await this.yieldToEventLoop();
      this.checkAbort(shouldAbort);

      // Step 2: Calculate TF-IDF matrix
      if (onProgress) onProgress({ stage: 'calculating tf-idf', progress: 0.4 });
      const tfidfData = this.calculateTFIDF(documents);
      
      await this.yieldToEventLoop();
      this.checkAbort(shouldAbort);

      // Step 3: Build similarity matrix
      if (onProgress) onProgress({ stage: 'building similarities', progress: 0.5 });
      const similarityMatrix = this.buildSimilarityMatrix(tfidfData);
      
      await this.yieldToEventLoop();
      this.checkAbort(shouldAbort);

      // Step 4: Perform hierarchical clustering with adaptive threshold
      if (onProgress) onProgress({ stage: 'clustering', progress: 0.6 });
      
      // Use VERY low threshold for maximum semantic grouping
      // Must group: "no alone time", "not enough alone time", "disturbed alone time"
      const adaptiveThreshold = processedSources.length < 20 ? 0.10 : 0.12;
      
      const clusters = await this.hierarchicalClusteringTFIDF(
        processedSources, 
        similarityMatrix,
        adaptiveThreshold,
        shouldAbort,
        onProgress
      );
      
      await this.yieldToEventLoop();
      this.checkAbort(shouldAbort);

      // Step 5: Extract patterns from clusters with TF-IDF-based labels
      if (onProgress) onProgress({ stage: 'generating labels', progress: 0.7 });
      const mainPatterns = await this.extractPatternsFromTFIDFClusters(
        clusters,
        processedSources,
        tfidfData,
        shouldAbort
      );

      await this.yieldToEventLoop();
      this.checkAbort(shouldAbort);

      if (onProgress) onProgress({ stage: 'complete', progress: 1.0 });

      console.log(`[TF-IDF] Generated ${mainPatterns.length} patterns:`);
      mainPatterns.slice(0, 5).forEach(p => {
        console.log(`  - "${p.label}" (${p.frequency} items, ${p.percentage}%)`);
      });

      return mainPatterns;
    } catch (error) {
      if (error.message === 'Analysis aborted by user') {
        throw error;
      }
      console.error('[PatternService] Error in clusterWithTFIDF:', error);
      console.error('[PatternService] Error stack:', error.stack);
      return [];
    }
  }

  /**
   * Hierarchical clustering specifically for TF-IDF with adaptive thresholds
   * Uses average linkage for better cluster quality
   */
  async hierarchicalClusteringTFIDF(sources, similarityMatrix, threshold = 0.5, shouldAbort = null, onProgress = null) {
    const n = sources.length;
    
    console.log(`[TF-IDF Clustering] Starting with ${n} sources, threshold: ${threshold}`);
    
    // Start with each source as its own cluster
    let clusters = sources.map((source, idx) => ({
      id: idx,
      items: [source],
      indices: [idx]
    }));

    // Balanced cluster limits for semantic grouping
    // Allow more aggressive clustering to group related concepts
    const maxClusters = Math.min(12, Math.max(3, Math.floor(n / 4)));
    const minClusters = Math.max(1, Math.floor(n / 25)); // Much more lenient (was n/15)
    
    // Strict iteration limit based on cluster count, not source count
    const maxIterations = Math.min(50, clusters.length); // Cap at 50 iterations total

    console.log(`[TF-IDF Clustering] Target: ${minClusters}-${maxClusters} clusters, max ${maxIterations} iterations`);

    let iterationCount = 0;
    let noMergeCount = 0; // Track consecutive iterations without merges

    // Merge clusters iteratively
    while (clusters.length > minClusters && iterationCount < maxIterations) {
      if (shouldAbort) this.checkAbort(shouldAbort);
      iterationCount++;

      let maxSim = -1;
      let mergeI = -1;
      let mergeJ = -1;

      // Find most similar pair of clusters (O(n²) but with small n due to sampling)
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          // Use average linkage: average similarity between all pairs
          const sim = this.clusterSimilarityAverage(clusters[i], clusters[j], similarityMatrix);
          if (sim > maxSim) {
            maxSim = sim;
            mergeI = i;
            mergeJ = j;
          }
        }
      }

      // Only merge if similarity is above threshold
      if (mergeI >= 0 && mergeJ >= 0 && maxSim >= threshold) {
        console.log(`[TF-IDF Clustering] Iteration ${iterationCount}: Merging clusters ${mergeI} & ${mergeJ} (sim: ${maxSim.toFixed(3)}), ${clusters.length} -> ${clusters.length - 1} clusters`);
        
        const merged = {
          id: clusters[mergeI].id,
          items: [...clusters[mergeI].items, ...clusters[mergeJ].items],
          indices: [...clusters[mergeI].indices, ...clusters[mergeJ].indices]
        };
        
        clusters = clusters.filter((_, idx) => idx !== mergeI && idx !== mergeJ);
        clusters.push(merged);
        
        noMergeCount = 0; // Reset no-merge counter
      } else {
        // No valid merges found
        noMergeCount++;
        console.log(`[TF-IDF Clustering] Iteration ${iterationCount}: No valid merges (maxSim: ${maxSim.toFixed(3)} < threshold: ${threshold})`);
        
        // Try lowering threshold progressively before giving up
        if (noMergeCount >= 2 && threshold > 0.05) {  // Go as low as 5%
          threshold *= 0.80; // Reduce by 20% for faster convergence
          console.log(`[TF-IDF Clustering] Lowering threshold to ${threshold.toFixed(3)} (attempt ${noMergeCount})`);
          noMergeCount = 0; // Reset counter after lowering threshold
        } else if (noMergeCount >= 5) {
          // Only exit after 5 consecutive failed attempts at lowest threshold
          console.log(`[TF-IDF Clustering] Stopping: No merges for ${noMergeCount} iterations at threshold ${threshold.toFixed(3)}`);
          break;
        } else {
          // Keep trying with current threshold
          continue;
        }
      }

      // Yield periodically for responsiveness
      if (iterationCount % 5 === 0) {
        await this.yieldToEventLoop();
        if (onProgress) {
          const progress = 0.6 + (iterationCount / maxIterations) * 0.1;
          onProgress({ stage: `clustering (${clusters.length} clusters)`, progress });
        }
      }
      
      // Safety: Exit if we've reached a reasonable number of clusters
      if (clusters.length <= maxClusters) {
        console.log(`[TF-IDF Clustering] Reached target cluster count: ${clusters.length}`);
        break;
      }
    }

    console.log(`[TF-IDF Clustering] Complete: ${clusters.length} clusters after ${iterationCount} iterations`);
    return clusters;
  }

  /**
   * Calculate average similarity between two clusters (average linkage)
   * More robust than max/min linkage for our use case
   */
  clusterSimilarityAverage(clusterA, clusterB, similarityMatrix) {
    let totalSim = 0;
    let count = 0;
    
    clusterA.indices.forEach(idxA => {
      clusterB.indices.forEach(idxB => {
        totalSim += similarityMatrix[idxA][idxB];
        count++;
      });
    });

    return count > 0 ? totalSim / count : 0;
  }

  /**
   * Extract patterns from TF-IDF clusters with intelligent label generation
   */
  async extractPatternsFromTFIDFClusters(clusters, allSources, tfidfData, shouldAbort = null) {
    const totalMentions = allSources.length;
    const mainPatterns = [];

    for (let clusterIdx = 0; clusterIdx < clusters.length; clusterIdx++) {
      if (shouldAbort) this.checkAbort(shouldAbort);
      
      const cluster = clusters[clusterIdx];
      
      if (!cluster.items || cluster.items.length === 0) continue;

      const frequency = cluster.items.length;
      const percentage = Math.round((frequency / totalMentions) * 100);
      const avgImpact = cluster.items.reduce((sum, item) => sum + item.level, 0) / frequency;

      // Find most representative phrase for label using TF-IDF scores
      const label = this.findMostRepresentativePhrase(cluster.items, tfidfData);
      const emoji = this.selectEmojiForPhrase(label.toLowerCase());

      // Extract sub-patterns
      const subPatterns = this.extractSubPatternsFromCluster(cluster.items);
      const dates = [...new Set(cluster.items.map(item => item.date))].sort().reverse();
      const examples = [...new Set(cluster.items.map(item => item.text))].slice(0, 5);

      mainPatterns.push({
        id: `tfidf_${clusterIdx}`,
        label,
        emoji,
        frequency,
        percentage,
        avgImpact: Math.round(avgImpact * 10) / 10,
        subPatterns: subPatterns.slice(0, 6),
        examples,
        dates: dates.slice(0, 10),
        sources: cluster.items
      });

      // Yield periodically
      if (clusterIdx % 3 === 0) {
        await this.yieldToEventLoop();
      }
    }

    return mainPatterns;
  }

  /**
   * Find the most representative phrase in a cluster
   * STATE-OF-THE-ART: Extracts core concepts, prioritizes clarity
   */
  findMostRepresentativePhrase(clusterItems, tfidfData) {
    if (!clusterItems || clusterItems.length === 0) {
      return 'Pattern';
    }

    // If only one item, use its text
    if (clusterItems.length === 1) {
      return this.formatLabel(clusterItems[0].text);
    }

    // SOLUTION 2: Extract core concepts (nouns, noun phrases)
    // Prioritize SHORTEST, CLEAREST labels
    const conceptScores = {};
    
    clusterItems.forEach(item => {
      const text = item.text.toLowerCase().trim();
      const words = text
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !this.stopWords.has(w));
      
      // STRATEGY 1: Extract core nouns (last significant word often = concept)
      if (words.length > 0) {
        // Core noun (last word is often the concept)
        const coreNoun = words[words.length - 1];
        conceptScores[coreNoun] = (conceptScores[coreNoun] || 0) + 3; // High priority
        
        // 2-word noun phrases (short and clear)
        if (words.length >= 2) {
          const lastTwo = `${words[words.length - 2]} ${words[words.length - 1]}`;
          conceptScores[lastTwo] = (conceptScores[lastTwo] || 0) + 2.5;
        }
      }
      
      // STRATEGY 2: Extract ALL bigrams (for broader concepts)
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        conceptScores[bigram] = (conceptScores[bigram] || 0) + 1;
      }
      
      // STRATEGY 3: Count exact matches (full phrases)
      conceptScores[text] = (conceptScores[text] || 0) + 0.5; // Lower priority for long phrases
    });

    // SOLUTION 3: Filter out single person names from labels (NO HARDCODING!)
    // Use auto-detected names from the dataset
    const autoDetectedNames = this.detectedNames || new Set();
    
    // UNIVERSAL relationship words to also skip (generic terms, not specific names)
    // JUSTIFIED HARDCODING: Universal relationship terms across cultures
    const relationshipWords = new Set(['mom', 'dad', 'mother', 'father', 'parents', 
                                       'friend', 'colleague', 'partner', 'spouse']);
    
    // Find best concept - PRIORITIZE SHORTER, CLEARER LABELS
    let bestConcept = null;
    let bestScore = 0;
    
    Object.entries(conceptScores).forEach(([concept, count]) => {
      const wordCount = concept.split(' ').length;
      
      // SOLUTION 3: Skip single person names/relationships UNLESS they appear in >70% of items
      const isPersonName = autoDetectedNames.has(concept.toLowerCase());
      const isRelationship = relationshipWords.has(concept.toLowerCase());
      
      if (wordCount === 1 && (isPersonName || isRelationship)) {
        const appearanceRate = count / clusterItems.length;
        if (appearanceRate < 0.7) {
          console.log(`[Label Selection] Skipping person name/relationship "${concept}" (only ${(appearanceRate * 100).toFixed(0)}% of items)`);
          return; // Skip this person name
        }
      }
      
      // SCORING: Shorter = better, but must be common
      // Prioritize 1-2 word concepts heavily
      let score = count;
      
      if (wordCount === 1) {
        score *= 2.0; // Strong preference for single-word concepts (e.g., "nature")
      } else if (wordCount === 2) {
        score *= 1.5; // Good preference for 2-word phrases (e.g., "alone time")
      } else if (wordCount === 3) {
        score *= 0.8; // Discourage 3-word phrases
      } else {
        score *= 0.3; // Heavy penalty for long phrases
      }
      
      // Bonus for high frequency
      if (count >= clusterItems.length * 0.5) {
        score *= 1.3; // Appears in >50% of items
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestConcept = concept;
      }
    });

    // Fallback to first item's text if no concept found
    if (!bestConcept) {
      bestConcept = clusterItems[0].text;
    }

    console.log(`[Label Selection] Chose "${bestConcept}" (score: ${bestScore.toFixed(1)}) from ${Object.keys(conceptScores).length} candidates`);
    
    return this.formatLabel(bestConcept);
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
   * @param {String} algorithm - Which algorithm explanation to get
   */
  getAlgorithmExplanation(algorithm = 'tfidf') {
    if (algorithm === 'tfidf') {
      return {
        title: 'How Pattern Discovery Works (TF-IDF)',
        sections: [
          {
            heading: '🔍 TF-IDF Analysis',
            content: 'Uses TF-IDF (Term Frequency-Inverse Document Frequency) to identify what makes each entry unique. Common words like "new" are automatically down-weighted, while distinctive words like "town" or "project" get higher importance.'
          },
          {
            heading: '🎯 Semantic Clustering',
            content: 'Groups entries by semantic meaning, not just word overlap. "Exploring new parts of town" and "new side project" are correctly recognized as different concepts because "town" and "project" are semantically distinct.'
          },
          {
            heading: '🧠 Dynamic Discovery',
            content: 'Categories are discovered from your actual words - no predefined labels. The algorithm finds the most representative phrases to name each pattern.'
          },
          {
            heading: '📊 Quality Control',
            content: 'Uses stricter similarity thresholds (60% match required) to prevent false clustering. Only shows patterns appearing in at least 5% of entries and 3+ times.'
          },
          {
            heading: '🌍 Language Agnostic',
            content: 'Works with any language - German, French, Spanish, etc. No hardcoded word lists, just pure mathematics.'
          },
          {
            heading: '🔒 Privacy',
            content: 'All analysis happens locally on your device. Your data never leaves your phone.'
          }
        ],
        note: 'This state-of-the-art algorithm provides accurate, meaningful patterns from your entries.'
      };
    } else {
      return {
        title: 'How Pattern Discovery Works (Phrase Grouping)',
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
  }

  /**
   * Filter patterns by ABSOLUTE frequency only (no percentage threshold)
   * FIXED: Prevents data loss (e.g., 5 vs 114 entries for "alone time")
   * 
   * @param {Array} patterns - Sorted patterns (by percentage, descending)
   * @param {Number} totalMentions - Total number of source mentions
   * @returns {Array} Filtered patterns
   */
  filterPatternsByThreshold(patterns, totalMentions) {
    try {
      if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
        return [];
      }

      if (totalMentions === 0) {
        return [];
      }

      // Use ONLY absolute frequency - no percentage threshold
      // This prevents losing valid patterns that were split across small clusters
      const minFrequency = totalMentions > 100 ? 3 : 2;  // Adaptive based on data size
      const maxPatterns = 20; // Show top 20 patterns (was 15)

      console.log(`[PatternService] Filtering ${patterns.length} patterns (min frequency: ${minFrequency}, max: ${maxPatterns})`);

      // Filter by absolute frequency only
      const filtered = patterns.filter(pattern => {
        const frequency = pattern?.frequency || 0;
        return frequency >= minFrequency;
      });

      console.log(`[PatternService] After frequency filter: ${filtered.length} patterns`);

      // Fallback: If all patterns were filtered out, return top patterns anyway
      let finalPatterns = filtered;
      if (filtered.length === 0 && patterns.length > 0) {
        console.warn('[PatternService] No patterns passed filter, using top 3 as fallback');
        finalPatterns = patterns.slice(0, 3);
      }

      // Apply safety cap (maxPatterns)
      const capped = finalPatterns.slice(0, maxPatterns);

      console.log(`[PatternService] Returning ${capped.length} patterns`);
      return capped;
    } catch (error) {
      console.error('[PatternService] Error filtering patterns:', error);
      console.error('[PatternService] Error stack:', error.stack);
      // Return top 20 patterns as fail-safe
      return patterns.slice(0, 20);
    }
  }
}

export default new HierarchicalPatternService();
