import React, { useState } from 'react';
import { LiveMatchScreen } from './components/LiveMatchScreen';
import { TournamentScreen } from './components/TournamentScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { useTournament } from './hooks/useTournament';
import { TEAMS } from './data';

function App() {
  const [loading, setLoading] = useState(true);
  const { tournament, currentPhaseFixtures, standingsList, startMatch, completeMatch } = useTournament();

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  const currentFixture = tournament.fixtures.find(f => f.id === tournament.currentMatchId);
  
  if (currentFixture) {
    const teamA = TEAMS.find(t => t.id === currentFixture.teamAId)!;
    const teamB = TEAMS.find(t => t.id === currentFixture.teamBId)!;

    return (
      <LiveMatchScreen 
        teamA={teamA} 
        teamB={teamB} 
        onExit={(result) => completeMatch(currentFixture.id, result)} 
      />
    );
  }

  return (
    <div className="App">
      <TournamentScreen 
        phase={tournament.phase}
        standaloneStandings={standingsList}
        fixtures={currentPhaseFixtures}
        onStartMatch={startMatch}
        version={tournament.version}
      />
    </div>
  );
}

export default App;
