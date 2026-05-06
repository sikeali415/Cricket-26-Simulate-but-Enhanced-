import { Team, Player, PlayerRole } from './types';

const createPlayer = (id: string, name: string, role: PlayerRole, batting: number, bowling: number): Player => ({
  id,
  name,
  role,
  battingSkill: batting,
  bowlingSkill: bowling,
  fitness: 90,
  confidence: 70,
  rating: Math.floor((batting + bowling) / 1.5),
  stats: {
    runs: 0,
    balls: 0,
    wickets: 0,
    overs: 0,
    runsConceded: 0
  }
});

export const TEAMS: Team[] = [
  {
    id: 'sixers',
    name: 'Sixers',
    logo: 'S',
    primaryColor: '#ef4444',
    secondaryColor: '#fecaca',
    players: [
      createPlayer('s1', 'Ali Raza', 'Batsman', 88, 20),
      createPlayer('s2', 'Shoaib Khan', 'Batsman', 85, 25),
      createPlayer('s3', 'Babar Azam', 'Batsman', 95, 10),
      createPlayer('s4', 'Rizwan Ahmed', 'Wicket-Keeper', 82, 5),
      createPlayer('s5', 'Shadab Malik', 'All-Rounder', 75, 80),
      createPlayer('s6', 'Shaheen Shah', 'Bowler', 30, 92),
      createPlayer('s7', 'Naseem Shah', 'Bowler', 25, 88),
      createPlayer('s8', 'Haris Rauf', 'Bowler', 20, 85),
      createPlayer('s9', 'Abrar Ahmed', 'Bowler', 15, 82),
      createPlayer('s10', 'Wasim Jr', 'Bowler', 35, 78),
      createPlayer('s11', 'Zaman Khan', 'Bowler', 10, 80),
    ]
  },
  {
    id: 'gladiators',
    name: 'Gladiators',
    logo: 'G',
    primaryColor: '#14b8a6',
    secondaryColor: '#ccfbf1',
    players: [
      createPlayer('g1', 'Sunil Narine', 'All-Rounder', 70, 90),
      createPlayer('g2', 'Andre Russell', 'All-Rounder', 85, 82),
      createPlayer('g3', 'Chris Gayle', 'Batsman', 92, 40),
      createPlayer('g4', 'Jos Buttler', 'Wicket-Keeper', 90, 5),
      createPlayer('g5', 'Ben Stokes', 'All-Rounder', 88, 85),
      createPlayer('g6', 'Rashid Khan', 'Bowler', 45, 95),
      createPlayer('g7', 'Trent Boult', 'Bowler', 20, 90),
      createPlayer('g8', 'Jasprit Bumrah', 'Bowler', 15, 96),
      createPlayer('g9', 'Mitchell Starc', 'Bowler', 25, 92),
      createPlayer('g10', 'Adam Zampa', 'Bowler', 10, 88),
      createPlayer('g11', 'Anrich Nortje', 'Bowler', 15, 86),
    ]
  }
];
