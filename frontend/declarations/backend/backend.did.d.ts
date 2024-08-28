import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface LeaderboardEntry { 'time' : number, 'playerName' : string }
export interface Track { 'id' : bigint, 'name' : string, 'length' : number }
export interface _SERVICE {
  'endRace' : ActorMethod<[bigint, number], undefined>,
  'getLeaderboard' : ActorMethod<[bigint], Array<LeaderboardEntry>>,
  'getTracks' : ActorMethod<[], Array<Track>>,
  'startRace' : ActorMethod<[bigint, string], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
