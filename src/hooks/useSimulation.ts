import { useState, useCallback, useMemo } from 'react';
import { MatchState } from '../types';
import { TEAMS } from '../data';
import { simulateBall, updateOvers } from '../utils';

export const useSimulation = () => {
  const [state, setState] = useState<MatchState>({
    id: 'm1',
    battingTeam: TEAMS[0],
    bowlingTeam: TEAMS[1],
    score: 0,
    wickets: 0,
    overs: '0.0',
    ballsInOver: 0,
    innings: 1,
    status: 'prematch',
    recentBalls: [],
    commentary: ['The match is about to begin!'],
    strikerId: TEAMS[0].players[0].id,
    nonStrikerId: TEAMS[0].players[1].id,
    bowlerId: TEAMS[1].players[10].id, // Last player is primary bowler for demo
    aggression: 3,
    playerStats: {},
  });

  const getPlayerStats = (id: string) => state.playerStats[id] || { runs: 0, balls: 0, wickets: 0, runsConceded: 0, overs: 0 };

  const striker = useMemo(() => state.battingTeam.players.find(p => p.id === state.strikerId)!, [state.strikerId, state.battingTeam]);
  const nonStriker = useMemo(() => state.battingTeam.players.find(p => p.id === state.nonStrikerId)!, [state.nonStrikerId, state.battingTeam]);
  const bowler = useMemo(() => state.bowlingTeam.players.find(p => p.id === state.bowlerId)!, [state.bowlerId, state.bowlingTeam]);

  const playBall = useCallback(() => {
    if (state.status !== 'inprogress' && state.status !== 'prematch') return;
    
    if (state.status === 'prematch') {
      setState(s => ({ ...s, status: 'inprogress' }));
    }

    const result = simulateBall(striker, bowler, state.aggression);
    
    setState(s => {
      const isOverComplete = s.ballsInOver === 5;
      const newOvers = updateOvers(s.overs);
      const newRecentBalls = [result.type, ...s.recentBalls].slice(0, 12);
      const newCommentary = [`${newOvers}: ${result.description}`, ...s.commentary].slice(0, 50);
      
      let nextStrikerId = s.strikerId;
      let nextNonStrikerId = s.nonStrikerId;
      
      // Rotate strike on odd runs
      if (result.runs % 2 !== 0 && !result.isWicket) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
      }
      
      // Rotate strike after over
      if (isOverComplete) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
      }

      const newPlayerStats = { ...s.playerStats };
      
      // Update striker stats
      const strikerStats = newPlayerStats[s.strikerId] || { runs: 0, balls: 0, wickets: 0, runsConceded: 0, overs: 0 };
      newPlayerStats[s.strikerId] = {
        ...strikerStats,
        runs: strikerStats.runs + result.runs,
        balls: strikerStats.balls + 1,
      };

      // Update bowler stats
      const bowlerStats = newPlayerStats[s.bowlerId] || { runs: 0, balls: 0, wickets: 0, runsConceded: 0, overs: 0 };
      newPlayerStats[s.bowlerId] = {
        ...bowlerStats,
        runsConceded: bowlerStats.runsConceded + result.runs,
        wickets: bowlerStats.wickets + (result.isWicket ? 1 : 0),
        overs: isOverComplete ? Math.floor(bowlerStats.overs) + 1 : bowlerStats.overs + 0.1
      };

      let newWickets = s.wickets;
      if (result.isWicket) {
        newWickets++;
        // Find next player in lineup
        const currentCount = s.battingTeam.players.findIndex(p => p.id === s.strikerId);
        const nextPlayer = s.battingTeam.players.find((p, i) => i > currentCount && p.id !== s.nonStrikerId);
        if (nextPlayer) {
          nextStrikerId = nextPlayer.id;
        } else {
          // All out
          return { ...s, status: 'completed' as const, commentary: ['ALL OUT!', ...newCommentary] };
        }
      }

      return {
        ...s,
        score: s.score + result.runs,
        wickets: newWickets,
        overs: newOvers,
        ballsInOver: isOverComplete ? 0 : s.ballsInOver + 1,
        recentBalls: newRecentBalls,
        commentary: newCommentary,
        strikerId: nextStrikerId,
        nonStrikerId: nextNonStrikerId,
      };
    });
  }, [state, striker, bowler]);

  const setAggression = (val: number) => setState(s => ({ ...s, aggression: val }));

  return {
    state,
    striker,
    nonStriker,
    bowler,
    playBall,
    setAggression,
    getPlayerStats
  };
};
