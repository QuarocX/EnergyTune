// Test the AI data requirements functionality
// Run: node test-data-requirements.js

console.log('🧪 Testing AI Data Requirements System\n');

// Simulate the analyzeDataRequirements function
function analyzeDataRequirements(entries) {
  const requirements = {
    minTotalEntries: 5,           
    minEnergySourceEntries: 3,    
    minStressSourceEntries: 3,    
    minCorrelationEntries: 7,     
  };

  if (!entries || entries.length === 0) {
    return {
      hasEnoughData: false,
      message: 'No data yet - start by adding your first energy and stress entry!',
      progress: {
        current: 0,
        needed: requirements.minTotalEntries,
        percentage: 0
      },
      nextSteps: ['Go to Entry screen and log your energy and stress levels', 'Add descriptions about what gave you energy or stress']
    };
  }

  const totalEntries = entries.length;
  const entriesWithEnergySource = entries.filter(e => e.energySources && e.energySources.trim()).length;
  const entriesWithStressSource = entries.filter(e => e.stressSources && e.stressSources.trim()).length;
  const entriesWithBoth = entries.filter(e => 
    e.energySources && e.energySources.trim() && 
    e.stressSources && e.stressSources.trim() &&
    e.energyLevels && e.stressLevels
  ).length;

  // Check minimum total entries
  if (totalEntries < requirements.minTotalEntries) {
    return {
      hasEnoughData: false,
      message: `Need ${requirements.minTotalEntries - totalEntries} more entries for AI analysis`,
      progress: {
        current: totalEntries,
        needed: requirements.minTotalEntries,
        percentage: Math.round((totalEntries / requirements.minTotalEntries) * 100)
      },
      nextSteps: [
        'Keep logging daily entries with energy and stress levels',
        'Add detailed descriptions about what affects your energy and stress'
      ]
    };
  }

  // Check energy source descriptions
  if (entriesWithEnergySource < requirements.minEnergySourceEntries) {
    return {
      hasEnoughData: false,
      message: `Need ${requirements.minEnergySourceEntries - entriesWithEnergySource} more entries with energy descriptions`,
      progress: {
        current: entriesWithEnergySource,
        needed: requirements.minEnergySourceEntries,
        percentage: Math.round((entriesWithEnergySource / requirements.minEnergySourceEntries) * 100)
      },
      nextSteps: [
        'Add descriptions about what gives you energy (e.g., "good sleep", "workout", "coffee")',
        'Be specific about activities, foods, or situations that boost your energy'
      ]
    };
  }

  // Check stress source descriptions
  if (entriesWithStressSource < requirements.minStressSourceEntries) {
    return {
      hasEnoughData: false,
      message: `Need ${requirements.minStressSourceEntries - entriesWithStressSource} more entries with stress descriptions`,
      progress: {
        current: entriesWithStressSource,
        needed: requirements.minStressSourceEntries,
        percentage: Math.round((entriesWithStressSource / requirements.minStressSourceEntries) * 100)
      },
      nextSteps: [
        'Add descriptions about what causes you stress (e.g., "tight deadlines", "traffic", "conflicts")',
        'Be specific about situations, people, or events that increase your stress'
      ]
    };
  }

  // All basic requirements met
  const canDoCorrelation = entriesWithBoth >= requirements.minCorrelationEntries;
  
  return {
    hasEnoughData: true,
    message: 'Great! You have enough data for AI pattern analysis',
    progress: {
      current: totalEntries,
      needed: requirements.minTotalEntries,
      percentage: 100
    },
    canDoAdvancedAnalysis: canDoCorrelation,
    advancedProgress: canDoCorrelation ? 100 : Math.round((entriesWithBoth / requirements.minCorrelationEntries) * 100),
    stats: {
      totalEntries,
      entriesWithEnergySource,
      entriesWithStressSource,
      entriesWithBoth
    }
  };
}

// Test scenarios
const testScenarios = [
  {
    name: 'No data',
    entries: []
  },
  {
    name: 'Only 2 entries',
    entries: [
      { date: '2025-01-14', energyLevels: { morning: 7 }, stressLevels: { morning: 3 } },
      { date: '2025-01-15', energyLevels: { morning: 6 }, stressLevels: { morning: 4 } }
    ]
  },
  {
    name: '5 entries but no descriptions',
    entries: [
      { date: '2025-01-11', energyLevels: { morning: 7 }, stressLevels: { morning: 3 } },
      { date: '2025-01-12', energyLevels: { morning: 6 }, stressLevels: { morning: 4 } },
      { date: '2025-01-13', energyLevels: { morning: 8 }, stressLevels: { morning: 2 } },
      { date: '2025-01-14', energyLevels: { morning: 5 }, stressLevels: { morning: 6 } },
      { date: '2025-01-15', energyLevels: { morning: 7 }, stressLevels: { morning: 3 } }
    ]
  },
  {
    name: '5 entries with only energy descriptions',
    entries: [
      { date: '2025-01-11', energySources: 'Good sleep', energyLevels: { morning: 7 }, stressLevels: { morning: 3 } },
      { date: '2025-01-12', energySources: 'Morning workout', energyLevels: { morning: 6 }, stressLevels: { morning: 4 } },
      { date: '2025-01-13', energySources: 'Great coffee', energyLevels: { morning: 8 }, stressLevels: { morning: 2 } },
      { date: '2025-01-14', energyLevels: { morning: 5 }, stressLevels: { morning: 6 } },
      { date: '2025-01-15', energyLevels: { morning: 7 }, stressLevels: { morning: 3 } }
    ]
  },
  {
    name: 'Perfect data - ready for AI',
    entries: [
      { date: '2025-01-11', energySources: 'Good sleep and workout', stressSources: 'Work deadline pressure', energyLevels: { morning: 7 }, stressLevels: { morning: 3 } },
      { date: '2025-01-12', energySources: 'Morning coffee', stressSources: 'Traffic jam', energyLevels: { morning: 6 }, stressLevels: { morning: 4 } },
      { date: '2025-01-13', energySources: 'Team meeting success', stressSources: 'Technical issues', energyLevels: { morning: 8 }, stressLevels: { morning: 2 } },
      { date: '2025-01-14', energySources: 'Nature walk', stressSources: 'Family conflict', energyLevels: { morning: 5 }, stressLevels: { morning: 6 } },
      { date: '2025-01-15', energySources: 'Productive work', stressSources: 'Time pressure', energyLevels: { morning: 7 }, stressLevels: { morning: 3 } }
    ]
  }
];

// Run tests
testScenarios.forEach((scenario, index) => {
  console.log(`📊 Test ${index + 1}: ${scenario.name}`);
  console.log(`Entries: ${scenario.entries.length}`);
  
  const result = analyzeDataRequirements(scenario.entries);
  
  console.log(`Status: ${result.hasEnoughData ? '✅ Ready' : '⏳ Needs more data'}`);
  console.log(`Message: ${result.message}`);
  
  if (result.progress) {
    console.log(`Progress: ${result.progress.current}/${result.progress.needed} (${result.progress.percentage}%)`);
  }
  
  if (result.nextSteps) {
    console.log('Next steps:');
    result.nextSteps.forEach(step => console.log(`  • ${step}`));
  }
  
  if (result.stats) {
    console.log('📈 Statistics:');
    console.log(`  Total entries: ${result.stats.totalEntries}`);
    console.log(`  With energy descriptions: ${result.stats.entriesWithEnergySource}`);
    console.log(`  With stress descriptions: ${result.stats.entriesWithStressSource}`);
    console.log(`  With both descriptions: ${result.stats.entriesWithBoth}`);
    console.log(`  Advanced analysis: ${result.canDoAdvancedAnalysis ? 'Available' : `${result.advancedProgress}% ready`}`);
  }
  
  console.log('');
});

console.log('🎯 Summary:');
console.log('• AI needs 5+ total entries for basic analysis');
console.log('• Requires 3+ entries with energy descriptions');  
console.log('• Requires 3+ entries with stress descriptions');
console.log('• Advanced correlation analysis needs 7+ complete entries');
console.log('• Users get clear progress indicators and next steps');
console.log('• Demo insights show what\'s possible while collecting data!');
