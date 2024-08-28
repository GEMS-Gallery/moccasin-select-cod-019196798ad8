export const idlFactory = ({ IDL }) => {
  const LeaderboardEntry = IDL.Record({
    'time' : IDL.Float64,
    'playerName' : IDL.Text,
  });
  const Track = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'length' : IDL.Float64,
  });
  return IDL.Service({
    'endRace' : IDL.Func([IDL.Nat, IDL.Float64], [], []),
    'getLeaderboard' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(LeaderboardEntry)],
        ['query'],
      ),
    'getTracks' : IDL.Func([], [IDL.Vec(Track)], ['query']),
    'startRace' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Nat], []),
  });
};
export const init = ({ IDL }) => { return []; };
