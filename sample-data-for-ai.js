// Sample Data Generator for AI Testing
// This creates realistic entries that will trigger different AI patterns

import StorageService from './src/services/storage.js';

const sampleEntries = [
  {
    date: '2025-01-10',
    energySources: 'Amazing workout this morning, perfect sleep last night, feeling fantastic and energized',
    stressSources: 'Tight deadline pressure at work, boss demanding immediate results, feeling overwhelmed',
    energyLevels: { morning: 9, afternoon: 7, evening: 6 },
    stressLevels: { morning: 2, afternoon: 8, evening: 5 }
  },
  {
    date: '2025-01-11', 
    energySources: 'Good coffee and productive team meeting, collaboration was inspiring',
    stressSources: 'Computer crashed suddenly, lost work, technical problems all day',
    energyLevels: { morning: 8, afternoon: 6, evening: 7 },
    stressLevels: { morning: 3, afternoon: 7, evening: 4 }
  },
  {
    date: '2025-01-12',
    energySources: 'Morning walk in nature, fresh air and sunshine, completed important project successfully',
    stressSources: 'Constant interruptions from emails and phone calls, no time to focus',
    energyLevels: { morning: 8, afternoon: 9, evening: 8 },
    stressLevels: { morning: 2, afternoon: 6, evening: 3 }
  },
  {
    date: '2025-01-13',
    energySources: 'Great night sleep, healthy breakfast, yoga session was refreshing',
    stressSources: 'Last minute meeting changes, rushing to appointment, running very late',
    energyLevels: { morning: 9, afternoon: 7, evening: 7 },
    stressLevels: { morning: 1, afternoon: 7, evening: 4 }
  },
  {
    date: '2025-01-14',
    energySources: 'Meaningful conversation with family, learning something new, feeling creative and focused',
    stressSources: 'Financial worries about bills, personal relationship stress, health concerns',
    energyLevels: { morning: 7, afternoon: 8, evening: 6 },
    stressLevels: { morning: 5, afternoon: 6, evening: 7 }
  }
];

// Instructions for testing
console.log('🧪 AI Testing Instructions:');
console.log('1. These sample entries are designed to trigger different AI patterns');
console.log('2. Energy sources include: physical, work, social, mental categories');
console.log('3. Stress sources include: work_pressure, technical, interruptions, time, personal');
console.log('4. The AI should detect patterns like:');
console.log('   - Physical activities boost energy');
console.log('   - Work pressure causes most stress');
console.log('   - Technical issues create frustration');
console.log('5. Go to Analytics → AI Analytics to see the results!');

export default sampleEntries;
