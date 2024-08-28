import Hash "mo:base/Hash";
import Nat "mo:base/Nat";

import Int "mo:base/Int";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";

actor {
  type Track = {
    id: Nat;
    name: Text;
    length: Float;
  };

  type Race = {
    id: Nat;
    trackId: Nat;
    playerName: Text;
    startTime: Time.Time;
    endTime: ?Time.Time;
    time: ?Float;
  };

  type LeaderboardEntry = {
    playerName: Text;
    time: Float;
  };

  stable var nextRaceId: Nat = 0;
  stable var races: [(Nat, Race)] = [];
  stable var leaderboards: [(Nat, [LeaderboardEntry])] = [];
  stable var tracks: [Track] = [
    { id = 0; name = "Beginner's Loop"; length = 1000.0 },
    { id = 1; name = "Speed Circuit"; length = 2000.0 },
    { id = 2; name = "Endurance Challenge"; length = 3000.0 }
  ];

  let racesMap = HashMap.fromIter<Nat, Race>(races.vals(), 0, Int.equal, Int.hash);
  let leaderboardsMap = HashMap.fromIter<Nat, [LeaderboardEntry]>(leaderboards.vals(), 0, Int.equal, Int.hash);

  public func startRace(trackId: Nat, playerName: Text) : async Nat {
    let raceId = nextRaceId;
    nextRaceId += 1;

    let newRace: Race = {
      id = raceId;
      trackId = trackId;
      playerName = playerName;
      startTime = Time.now();
      endTime = null;
      time = null;
    };

    racesMap.put(raceId, newRace);
    raceId
  };

  public func endRace(raceId: Nat, time: Float) : async () {
    switch (racesMap.get(raceId)) {
      case (null) {
        // Race not found, do nothing
      };
      case (?race) {
        let updatedRace: Race = {
          id = race.id;
          trackId = race.trackId;
          playerName = race.playerName;
          startTime = race.startTime;
          endTime = ?Time.now();
          time = ?time;
        };
        racesMap.put(raceId, updatedRace);

        // Update leaderboard
        let trackLeaderboard = switch (leaderboardsMap.get(race.trackId)) {
          case (null) { [] };
          case (?entries) { entries };
        };
        let newEntry: LeaderboardEntry = { playerName = race.playerName; time = time };
        let updatedLeaderboard = insertSorted(List.fromArray(trackLeaderboard), newEntry);
        leaderboardsMap.put(race.trackId, List.toArray(List.take(updatedLeaderboard, 10)));
      };
    };
  };

  func insertSorted(list: List.List<LeaderboardEntry>, entry: LeaderboardEntry): List.List<LeaderboardEntry> {
    switch (list) {
      case (null) { ?(entry, null) };
      case (?(head, tail)) {
        if (entry.time <= head.time) {
          ?(entry, ?(head, tail))
        } else {
          ?(head, insertSorted(tail, entry))
        };
      };
    }
  };

  public query func getLeaderboard(trackId: Nat) : async [LeaderboardEntry] {
    switch (leaderboardsMap.get(trackId)) {
      case (null) { [] };
      case (?entries) { entries };
    }
  };

  public query func getTracks() : async [Track] {
    tracks
  };

  system func preupgrade() {
    races := Iter.toArray(racesMap.entries());
    leaderboards := Iter.toArray(leaderboardsMap.entries());
  };

  system func postupgrade() {
    races := [];
    leaderboards := [];
  };
}
