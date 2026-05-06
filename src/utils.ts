import { Player, BallResult } from './types';

export const simulateBall = (
  striker: Player,
  bowler: Player,
  aggression: number // 1 (Defensive) to 5 (Ultra Aggressive)
): BallResult => {
  const random = Math.random();
  const battingSkill = striker.battingSkill;
  const bowlingSkill = bowler.bowlingSkill;
  
  // Base wicket probability
  let wicketProb = 0.03 + (bowlingSkill / 1000);
  // Increase wicket risk with aggression
  wicketProb *= (1 + (aggression - 3) * 0.25);
  
  if (random < wicketProb) {
    return { runs: 0, isWicket: true, isExtra: false, description: 'WICKET!', type: 'W' };
  }

  // Base run probabilities
  const powerFactor = (battingSkill / 100) * (aggression / 3);
  const boundaryProb = 0.1 * powerFactor;
  const singleProb = 0.4;
  
  const runRandom = Math.random();
  
  if (runRandom < boundaryProb) {
    const isSix = Math.random() < (aggression / 6);
    return isSix 
      ? { runs: 6, isWicket: false, isExtra: false, description: 'SIX!', type: '6' }
      : { runs: 4, isWicket: false, isExtra: false, description: 'FOUR!', type: '4' };
  } else if (runRandom < boundaryProb + singleProb) {
    const runs = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
    return { runs, isWicket: false, isExtra: false, description: `${runs} Ru${runs > 1 ? 'ns' : 'n'}`, type: runs.toString() };
  } else {
    return { runs: 0, isWicket: false, isExtra: false, description: 'Dot Ball', type: '•' };
  }
};

export const updateOvers = (overs: string): string => {
  const parts = overs.split('.');
  let over = parseInt(parts[0]);
  let ball = parseInt(parts[1] || '0');
  
  ball++;
  if (ball === 6) {
    over++;
    ball = 0;
  }
  
  return `${over}.${ball}`;
};

export const formatOver = (overs: string): string => {
  return overs.includes('.') ? overs : `${overs}.0`;
};
