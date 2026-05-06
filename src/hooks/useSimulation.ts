import { useState, useCallback, useMemo } from 'react';
import { MatchState, Team } from '../types';
import { TEAMS } from '../data';
import { simulateBall, updateOvers } from '../utils';

export const useSimulation = (teamA: Team, teamB: Team, onComplete?: (result: any) => void) => {
  const [state, setState] = useState<MatchState>({
    id: 'm1',
    battingTeam: teamA,
    bowlingTeam: teamB,
    score: 0,
    wickets: 0,
    overs: '0.0',
    ballsInOver: 0,
    innings: 1,
    status: 'prematch',
    recentBalls: [],
    commentary: ['The match is about to begin!'],
    strikerId: teamA.players[0].id,
    nonStrikerId: teamA.players[1].id,
    bowlerId: teamB.players[10].id,
    aggression: 3,
    playerStats: {},
  });

  const getPlayerStats = (id: string) => state.playerStats[id] || { runs: 0, balls: 0, wickets: 0, runsConceded: 0, overs: 0 };

  const striker = useMemo(() => state.battingTeam.players.find(p => p.id === state.strikerId)!, [state.strikerId, state.battingTeam]);
  const nonStriker = useMemo(() => state.battingTeam.players.find(p => p.id === state.nonStrikerId)!, [state.nonStrikerId, state.battingTeam]);
  const bowler = useMemo(() => state.bowlingTeam.players.find(p => p.id === state.bowlerId)!, [state.bowlerId, state.bowlingTeam]);

  const finishMatch = useCallback(() => {
    if (onComplete) {
       onComplete({
         winnerId: state.score > (state.target || 0) ? state.battingTeam.id : state.bowlingTeam.id,
         scoreA: state.innings === 1 ? state.score : state.target || 0,
         scoreB: state.innings === 2 ? state.score : state.target || 0,
         wicketsA: state.innings === 1 ? state.wickets : 0,
         wicketsB: state.innings === 2 ? state.wickets : 0,
       });
    }
  }, [onComplete, state]);

  const playBall = useCallback(() => {
    if (state.status !== 'inprogress' && state.status !== 'prematch') return;
    
    if (state.status === 'prematch') {
      setState(s => ({ ...s, status: 'inprogress' }));
    }

    const result = simulateBall(striker, bowler, state.aggression);
    
    setState(s => {
      // End match check for 2nd innings
      if (s.innings === 2 && s.target && s.score + result.runs > s.target) {
        return { ...s, status: 'completed', score: s.score + result.runs };
      }

      const isOverComplete = s.ballsInOver === 5;
      const newOvers = updateOvers(s.overs);
      const newRecentBalls = [result.type, ...s.recentBalls].slice(0, 12);
      const newCommentary = [`${newOvers}: ${result.description}`, ...s.commentary].slice(0, 50);
      
      let nextStrikerId = s.strikerId;
      let nextNonStrikerId = s.nonStrikerId;
      
      if (result.runs % 2 !== 0 && !result.isWicket) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
      }
      
      if (isOverComplete) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
      }

      const newPlayerStats = { ...s.playerStats };
      const strikerStats = newPlayerStats[s.strikerId] || { runs: 0, balls: 0, wickets: 0, runsConceded: 0, overs: 0 };
      newPlayerStats[s.strikerId] = { ...strikerStats, runs: strikerStats.runs + result.runs, balls: strikerStats.balls + 1 };

      const bowlerStats = newPlayerStats[s.bowlerId] || { runs: 0, balls: 0, wickets: 0, runsConceded: 0, overs: 0 };
      newPlayerStats[s.bowlerId] = { ...bowlerStats, runsConceded: bowlerStats.runsConceded + result.runs, wickets: bowlerStats.wickets + (result.isWicket ? 1 : 0), overs: isOverComplete ? Math.floor(bowlerStats.overs) + 1 : bowlerStats.overs + 0.1 };

      let newWickets = s.wickets;
      if (result.isWicket) {
        newWickets++;
        const currentCount = s.battingTeam.players.findIndex(p => p.id === s.strikerId);
        const nextPlayer = s.battingTeam.players.find((p, i) => i > currentCount && p.id !== s.nonStrikerId);
        if (nextPlayer) {
          nextStrikerId = nextPlayer.id;
        } else {
          // Innings break or match end
          if (s.innings === 1) {
            return {
              ...s,
              innings: 2,
              battingTeam: s.bowlingTeam,
              bowlingTeam: s.battingTeam,
              target: s.score + result.runs,
              score: 0,
              wickets: 0,
              overs: '0.0',
              ballsInOver: 0,
              strikerId: s.bowlingTeam.players[0].id,
              nonStrikerId: s.bowlingTeam.players[1].id,
              bowlerId: s.battingTeam.players[10].id,
              commentary: ['INNINGS BREAK! Target: ' + (s.score + result.runs + 1), ...newCommentary],
              playerStats: newPlayerStats
            };
          }
          return { ...s, status: 'completed' as const, commentary: ['ALL OUT!', ...newCommentary], playerStats: newPlayerStats };
        }
      }

      // Check max overs
      if (newOvers === '20.0') {
        if (s.innings === 1) {
          return {
            ...s,
            innings: 2,
            battingTeam: s.bowlingTeam,
            bowlingTeam: s.battingTeam,
            target: s.score,
            score: 0,
            wickets: 0,
            overs: '0.0',
            ballsInOver: 0,
            strikerId: s.bowlingTeam.players[0].id,
            nonStrikerId: s.bowlingTeam.players[1].id,
            bowlerId: s.battingTeam.players[10].id,
            commentary: ['INNINGS OVER! Target: ' + (s.score + 1), ...newCommentary],
            playerStats: newPlayerStats
          };
        }
        return { ...s, status: 'completed' as const, commentary: ['MATCH ENDED!', ...newCommentary], playerStats: newPlayerStats };
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
        playerStats: newPlayerStats
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
    getPlayerStats,
    finishMatch
  };
};
