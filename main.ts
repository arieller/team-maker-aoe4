import { cloneDeep, sortBy, values, reduce } from "lodash";

/**
Player = digit (1, ..., 8)
Team = Tuple (digit, digit)
Match = (Team, Team)

We need 14 matches, with the following rules:
1. Each match, has a unique set of players 
2. Each unique team, will appear exactly one time across all match ups.
3. Each player must play against another player, exactly twice.

[1,2] = [2,1]

*/
type Team = [number, number];
type Matchup = [Team, Team];

const getKey = (team: Team): number => Number(sortBy(team).join(""));

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const isValid = (matchup: Matchup): boolean => {
  if (
    matchup[0][0] !== matchup[1][0] &&
    matchup[0][0] !== matchup[1][1] &&
    matchup[0][1] !== matchup[1][0] &&
    matchup[0][1] !== matchup[1][1]
  ) {
    return true;
  }
  return false;
};

const getMatchups = () => {
  const teams: Team[] = [];

  for (let i = 1; i <= 8; i++) {
    for (let j = i + 1; j <= 8; j++) {
      const team: Team = [i, j];

      teams.push(team);
    }
  }

  const matchups: Matchup[] = [];

  for (let i = 0; i < teams.length; i += 2) {
    matchups.push([teams[i], teams[i + 1]]);
  }

  // Randomize teams
  for (let i = 0; i < matchups.length; i++) {
    let count = 0;

    while (!isValid(matchups[i])) {
      if (count >= 100) {
        return { isCalculationValid: false };
      }

      const matchupIndex = getRandomInt(i + 1, matchups.length - 1);
      const teamIndex = getRandomInt(0, 1);

      try {
        const randomTeam = cloneDeep(matchups[matchupIndex][teamIndex]);

        const prevTeam: Team = cloneDeep(matchups[i][1]);
        matchups[i][1] = cloneDeep(randomTeam);
        matchups[matchupIndex][teamIndex] = cloneDeep(prevTeam);

        count++;
      } catch (error) {
        count++;
      }
    }
  }

  const tracker = reduce<Team, Record<number, number>>(
    teams,
    (acc, team) => {
      acc[getKey(team)] = 0;
      return acc;
    },
    {}
  );

  // Keys - tracker
  for (let i = 0; i < matchups.length; i++) {
    const [team1, team2] = matchups[i];
    const [team1player1, team1player2] = team1;
    const [team2player1, team2player2] = team2;

    const keys = [
      getKey([team1player1, team2player1]),
      getKey([team1player1, team2player2]),
      getKey([team1player2, team2player1]),
      getKey([team1player2, team2player2]),
    ];

    for (let j = 0; j < keys.length; j++) {
      tracker[keys[j]]++;

      if (tracker[keys[j]] >= 3) {
        return { isCalculationValid: false, matchups, tracker };
      }
    }
  }

  return { isCalculationValid: true, matchups, tracker };
};

let stop = false;
let count = 0;

do {
  const { isCalculationValid, matchups, tracker } = getMatchups();

  if (isCalculationValid) {
    console.log("matchups", matchups, matchups?.length);
    console.log("tracker", tracker, values(tracker).length);
    stop = true;
  } else {
    count++;

    if (count % 10000 === 0) {
      console.log("matchups", matchups, matchups?.length);
      console.log("tracker", tracker, values(tracker).length);
    }
  }
} while (!stop);
