import React, { useState, useEffect, useCallback } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, Box, Button, Select, MenuItem, FormControl, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import FlagIcon from '@mui/icons-material/Flag';

type Track = {
  id: number;
  name: string;
  length: number;
};

type LeaderboardEntry = {
  playerName: string;
  time: number;
};

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>('');
  const [raceStarted, setRaceStarted] = useState<boolean>(false);
  const [raceTime, setRaceTime] = useState<number>(0);
  const [raceInterval, setRaceInterval] = useState<NodeJS.Timeout | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      const fetchedTracks = await backend.getTracks();
      setTracks(fetchedTracks);
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const fetchedLeaderboard = await backend.getLeaderboard(BigInt(selectedTrack));
      setLeaderboard(fetchedLeaderboard);
    };
    fetchLeaderboard();
  }, [selectedTrack]);

  const handleTrackChange = (event: SelectChangeEvent<number>) => {
    setSelectedTrack(event.target.value as number);
  };

  const startRace = async () => {
    if (playerName) {
      await backend.startRace(BigInt(selectedTrack), playerName);
      setRaceStarted(true);
      setRaceTime(0);
      const interval = setInterval(() => {
        setRaceTime((prevTime) => prevTime + 0.1);
      }, 100);
      setRaceInterval(interval);
    } else {
      alert('Please enter your name before starting the race!');
    }
  };

  const endRace = useCallback(async () => {
    if (raceInterval) {
      clearInterval(raceInterval);
    }
    setRaceStarted(false);
    await backend.endRace(BigInt(0), raceTime); // Assuming raceId is not used in the backend
    const updatedLeaderboard = await backend.getLeaderboard(BigInt(selectedTrack));
    setLeaderboard(updatedLeaderboard);
  }, [raceInterval, raceTime, selectedTrack]);

  useEffect(() => {
    if (raceStarted && raceTime >= tracks[selectedTrack].length / 100) {
      endRace();
    }
  }, [raceStarted, raceTime, selectedTrack, tracks, endRace]);

  return (
    <Container maxWidth="md">
      <Typography variant="h2" component="h1" gutterBottom>
        IC Racing Game
      </Typography>
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="track-select-label">Select Track</InputLabel>
          <Select
            labelId="track-select-label"
            value={selectedTrack}
            label="Select Track"
            onChange={handleTrackChange}
          >
            {tracks.map((track) => (
              <MenuItem key={track.id} value={track.id}>
                {track.name} ({track.length}m)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel htmlFor="player-name">Your Name</InputLabel>
          <input
            id="player-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ padding: '10px', fontSize: '16px' }}
          />
        </FormControl>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FlagIcon />}
          onClick={raceStarted ? endRace : startRace}
          disabled={!playerName}
        >
          {raceStarted ? 'End Race' : 'Start Race'}
        </Button>
      </Box>
      {raceStarted && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">
            Time: {raceTime.toFixed(1)}s
          </Typography>
          <Typography variant="h6">
            Distance: {Math.min(raceTime * 100, tracks[selectedTrack].length).toFixed(0)}m / {tracks[selectedTrack].length}m
          </Typography>
        </Box>
      )}
      <Typography variant="h4" gutterBottom>
        Leaderboard
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{entry.playerName}</TableCell>
                <TableCell>{entry.time.toFixed(1)}s</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default App;
