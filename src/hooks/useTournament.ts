import { useState, useCallback, useMemo } from 'react';
import { TournamentState, Fixture, TeamStats, TournamentPhase } from '../types';
import { TEAMS } from '../data';

const INITIAL_TEAMS = TEAMS.slice(0, 6);
const QUALIFIER_TEAMS = TEAMS.slice(6);

export const useTournament = () => {
  const [tournament, setTournament] = useState<TournamentState>(() => {
    // Generate Qualifier Fixtures: 10 teams, each plays 4 matches
    const qualifierFixtures: Fixture[] = [];
    QUALIFIER_TEAMS.forEach((team, i) => {
      // Find 4 opponents
      for (let j = 1; j <= 4; j++) {
        const opponentIdx = (i + j) % QUALIFIER_TEAMS.length;
        // Avoid duplicate fixtures in reverse
        const existing = qualifierFixtures.find(f => 
          (f.teamAId === team.id && f.teamBId === QUALIFIER_TEAMS[opponentIdx].id) ||
          (f.teamAId === QUALIFIER_TEAMS[opponentIdx].id && f.teamBId === team.id)
        );
        if (!existing) {
          qualifierFixtures.push({
            id: `qf-${qualifierFixtures.length}`,
            teamAId: team.id,
            teamBId: QUALIFIER_TEAMS[opponentIdx].id,
            phase: 'qualifiers',
            status: 'pending'
          });
        }
      }
    });

    const initialStandings: Record<string, TeamStats> = {};
    TEAMS.forEach(t => {
      initialStandings[t.id] = { played: 0, won: 0, lost: 0, pts: 0, nrr: 0 };
    });

    return {
      version: 'v.0.0.1.1 Early Access',
      phase: 'qualifiers',
      standings: initialStandings,
      fixtures: qualifierFixtures,
      qualifiedTeams: INITIAL_TEAMS.map(t => t.id),
      semifinalists: []
    };
  });

  const currentPhaseFixtures = useMemo(() => 
    tournament.fixtures.filter(f => f.phase === tournament.phase),
  [tournament.fixtures, tournament.phase]);

  const standingsList = useMemo(() => {
    const relevantTeams = tournament.phase === 'qualifiers' ? QUALIFIER_TEAMS : TEAMS.filter(t => tournament.qualifiedTeams.includes(t.id));
    return relevantTeams
      .map(t => ({ team: t, stats: tournament.standings[t.id] }))
      .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.nrr - a.stats.nrr);
  }, [tournament.standings, tournament.phase, tournament.qualifiedTeams]);

  const startMatch = useCallback((fixtureId: string) => {
    setTournament(prev => ({ ...prev, currentMatchId: fixtureId }));
  }, []);

  const completeMatch = useCallback((fixtureId: string, result: { winnerId: string, scoreA: number, scoreB: number, wicketsA: number, wicketsB: number }) => {
    setTournament(prev => {
      const fixture = prev.fixtures.find(f => f.id === fixtureId)!;
      const isTeamAWinner = result.winnerId === fixture.teamAId;
      
      const newStandings = { ...prev.standings };
      
      // Update Team A
      newStandings[fixture.teamAId] = {
        ...newStandings[fixture.teamAId],
        played: newStandings[fixture.teamAId].played + 1,
        won: newStandings[fixture.teamAId].won + (isTeamAWinner ? 1 : 0),
        lost: newStandings[fixture.teamAId].lost + (isTeamAWinner ? 0 : 1),
        pts: newStandings[fixture.teamAId].pts + (isTeamAWinner ? 2 : 0),
        nrr: newStandings[fixture.teamAId].nrr + (result.scoreA - result.scoreB) / 20
      };

      // Update Team B
      newStandings[fixture.teamBId] = {
        ...newStandings[fixture.teamBId],
        played: newStandings[fixture.teamBId].played + 1,
        won: newStandings[fixture.teamBId].won + (isTeamAWinner ? 0 : 1),
        lost: newStandings[fixture.teamBId].lost + (isTeamAWinner ? 1 : 0),
        pts: newStandings[fixture.teamBId].pts + (isTeamAWinner ? 0 : 2),
        nrr: newStandings[fixture.teamBId].nrr + (result.scoreB - result.scoreA) / 20
      };

      const newFixtures = prev.fixtures.map(f => f.id === fixtureId ? {
        ...f,
        status: 'completed' as const,
        winnerId: result.winnerId,
        scoreA: result.scoreA,
        scoreB: result.scoreB,
        wicketsA: result.wicketsA,
        wicketsB: result.wicketsB
      } : f);

      // Check for phase completion
      const pendingInPhase = newFixtures.filter(f => f.phase === prev.phase && f.status === 'pending');
      
      let nextPhase = prev.phase;
      let extraFixtures: Fixture[] = [];
      let finalQualified = [...prev.qualifiedTeams];

      if (pendingInPhase.length === 0) {
        if (prev.phase === 'qualifiers') {
          // Top 2 move to league
          const qualifiers = QUALIFIER_TEAMS
            .map(t => ({ id: t.id, stats: newStandings[t.id] }))
            .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.nrr - a.stats.nrr)
            .slice(0, 2);
          
          finalQualified = [...prev.qualifiedTeams, ...qualifiers.map(q => q.id)];
          nextPhase = 'league';
          
          // Generate League Fixtures (8 teams total now)
          const leagueTeams = TEAMS.filter(t => finalQualified.includes(t.id));
          leagueTeams.forEach((t1, i) => {
            leagueTeams.slice(i + 1).forEach(t2 => {
              extraFixtures.push({
                id: `lf-${extraFixtures.length}`,
                teamAId: t1.id,
                teamBId: t2.id,
                phase: 'league',
                status: 'pending'
              });
            });
          });
        } else if (prev.phase === 'league') {
          // Top 4 move to semis
          const semis = TEAMS
            .filter(t => finalQualified.includes(t.id))
            .map(t => ({ id: t.id, stats: newStandings[t.id] }))
            .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.nrr - a.stats.nrr)
            .slice(0, 4);
          
          nextPhase = 'semis';
          extraFixtures = [
            { id: 'semi-1', teamAId: semis[0].id, teamBId: semis[3].id, phase: 'semis', status: 'pending' },
            { id: 'semi-2', teamAId: semis[1].id, teamBId: semis[2].id, phase: 'semis', status: 'pending' }
          ];
        } else if (prev.phase === 'semis') {
          const finalists = newFixtures.filter(f => f.phase === 'semis').map(f => f.winnerId!);
          nextPhase = 'final';
          extraFixtures = [
            { id: 'final', teamAId: finalists[0], teamBId: finalists[1], phase: 'final', status: 'pending' }
          ];
        } else if (prev.phase === 'final') {
          // Tournament complete!
        }
      }

      return {
        ...prev,
        fixtures: [...newFixtures, ...extraFixtures],
        standings: newStandings,
        phase: nextPhase,
        qualifiedTeams: finalQualified,
        currentMatchId: undefined
      };
    });
  }, []);

  return {
    tournament,
    currentPhaseFixtures,
    standingsList,
    startMatch,
    completeMatch
  };
};
