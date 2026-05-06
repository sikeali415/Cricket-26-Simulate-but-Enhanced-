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
  // League Pre-qualified (6 teams)
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
  },
  {
    id: 'titans',
    name: 'Titans',
    logo: 'T',
    primaryColor: '#3b82f6',
    secondaryColor: '#bfdbfe',
    players: [
      createPlayer('t1', 'David Warner', 'Batsman', 88, 10),
      createPlayer('t2', 'Quinton de Kock', 'Wicket-Keeper', 86, 5),
      createPlayer('t3', 'Hardik Pandya', 'All-Rounder', 82, 80),
      createPlayer('t4', 'Glenn Maxwell', 'All-Rounder', 84, 75),
      createPlayer('t5', 'Rashid Khan', 'Bowler', 30, 94),
      createPlayer('t6', 'Mohammed Shami', 'Bowler', 20, 88),
      createPlayer('t7', 'Noor Ahmad', 'Bowler', 15, 85),
      createPlayer('t8', 'Sai Sudharsan', 'Batsman', 78, 10),
      createPlayer('t9', 'Rahul Tewatia', 'All-Rounder', 72, 70),
      createPlayer('t10', 'Mohit Sharma', 'Bowler', 25, 82),
      createPlayer('t11', 'Josh Little', 'Bowler', 20, 80),
    ]
  },
  {
    id: 'royals',
    name: 'Royals',
    logo: 'R',
    primaryColor: '#d946ef',
    secondaryColor: '#f5d0fe',
    players: [
      createPlayer('r1', 'Sanju Samson', 'Wicket-Keeper', 87, 5),
      createPlayer('r2', 'Jos Buttler', 'Batsman', 92, 5),
      createPlayer('r3', 'Yashasvi Jaiswal', 'Batsman', 85, 10),
      createPlayer('r4', 'Shimron Hetmyer', 'Batsman', 82, 5),
      createPlayer('r5', 'Ravichandran Ashwin', 'All-Rounder', 60, 88),
      createPlayer('r6', 'Yuzvendra Chahal', 'Bowler', 10, 92),
      createPlayer('r7', 'Trent Boult', 'Bowler', 20, 90),
      createPlayer('r8', 'Sandeep Sharma', 'Bowler', 15, 84),
      createPlayer('r9', 'Avesh Khan', 'Bowler', 15, 82),
      createPlayer('r10', 'Dhruv Jurel', 'Batsman', 75, 5),
      createPlayer('r11', 'Nandre Burger', 'Bowler', 20, 85),
    ]
  },
  {
    id: 'warriors',
    name: 'Warriors',
    logo: 'W',
    primaryColor: '#f59e0b',
    secondaryColor: '#fef3c7',
    players: [
      createPlayer('w1', 'Virat Kohli', 'Batsman', 96, 20),
      createPlayer('w2', 'Faf du Plessis', 'Batsman', 88, 10),
      createPlayer('w3', 'Glenn Maxwell', 'All-Rounder', 84, 75),
      createPlayer('w4', 'Rajath Patidar', 'Batsman', 80, 5),
      createPlayer('w5', 'Cameron Green', 'All-Rounder', 82, 80),
      createPlayer('w6', 'Dinesh Karthik', 'Wicket-Keeper', 78, 5),
      createPlayer('w7', 'Mohammed Siraj', 'Bowler', 20, 88),
      createPlayer('w8', 'Reece Topley', 'Bowler', 15, 84),
      createPlayer('w9', 'Lockie Ferguson', 'Bowler', 15, 86),
      createPlayer('w10', 'Karn Sharma', 'Bowler', 10, 78),
      createPlayer('w11', 'Mahipal Lomror', 'Batsman', 72, 30),
    ]
  },
  {
    id: 'kings',
    name: 'Kings',
    logo: 'K',
    primaryColor: '#0ea5e9',
    secondaryColor: '#e0f2fe',
    players: [
      createPlayer('k1', 'MS Dhoni', 'Wicket-Keeper', 85, 5),
      createPlayer('k2', 'Ruturaj Gaikwad', 'Batsman', 88, 5),
      createPlayer('k3', 'Rachin Ravindra', 'All-Rounder', 82, 75),
      createPlayer('k4', 'Daryl Mitchell', 'Batsman', 84, 20),
      createPlayer('k5', 'Ravindra Jadeja', 'All-Rounder', 78, 88),
      createPlayer('k6', 'Shivam Dube', 'All-Rounder', 85, 40),
      createPlayer('k7', 'Matheesha Pathirana', 'Bowler', 10, 92),
      createPlayer('k8', 'Deepak Chahar', 'Bowler', 25, 85),
      createPlayer('k9', 'Maheesh Theekshana', 'Bowler', 10, 88),
      createPlayer('k10', 'Tushar Deshpande', 'Bowler', 15, 82),
      createPlayer('k11', 'Mustafizur Rahman', 'Bowler', 20, 86),
    ]
  },
  // Qualifier Contenders (10 teams)
  ...['Falcons', 'Hawks', 'Bulls', 'Dolphins', 'Sharks', 'Eagles', 'Lions', 'Tigers', 'Dragons', 'Storm'].map((name, i) => ({
    id: `q${i+1}`,
    name: name,
    logo: name[0],
    primaryColor: '#4b5563',
    secondaryColor: '#f3f4f6',
    players: [
      createPlayer(`qp${i}1`, `Player Alpha ${i}`, 'Batsman', 70 + Math.floor(Math.random()*15), 20),
      createPlayer(`qp${i}2`, `Player Beta ${i}`, 'Batsman', 70 + Math.floor(Math.random()*15), 20),
      createPlayer(`qp${i}3`, `Player Gamma ${i}`, 'Batsman', 70 + Math.floor(Math.random()*15), 20),
      createPlayer(`qp${i}4`, `Player Delta ${i}`, 'Wicket-Keeper', 70 + Math.floor(Math.random()*15), 5),
      createPlayer(`qp${i}5`, `Player Epsilon ${i}`, 'All-Rounder', 60 + Math.floor(Math.random()*15), 60 + Math.floor(Math.random()*15)),
      createPlayer(`qp${i}6`, `Player Zeta ${i}`, 'All-Rounder', 60 + Math.floor(Math.random()*15), 60 + Math.floor(Math.random()*15)),
      createPlayer(`qp${i}7`, `Player Eta ${i}`, 'Bowler', 20, 70 + Math.floor(Math.random()*15)),
      createPlayer(`qp${i}8`, `Player Theta ${i}`, 'Bowler', 20, 70 + Math.floor(Math.random()*15)),
      createPlayer(`qp${i}9`, `Player Iota ${i}`, 'Bowler', 20, 70 + Math.floor(Math.random()*15)),
      createPlayer(`qp${i}10`, `Player Kappa ${i}`, 'Bowler', 20, 70 + Math.floor(Math.random()*15)),
      createPlayer(`qp${i}11`, `Player Lambda ${i}`, 'Bowler', 20, 70 + Math.floor(Math.random()*15)),
    ]
  }))
];
