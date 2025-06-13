package com.rm.rally_metrics.player;

import com.rm.rally_metrics.gemini.GeminiService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final GeminiService geminiService;

    @Autowired
    public PlayerService(PlayerRepository playerRepository, GeminiService geminiService) {
        this.playerRepository = playerRepository;
        this.geminiService = geminiService;
    }

    public List<Player> getPlayers() {
        return playerRepository.findAll();
    }

    public List<Player> getPlayersFromTeam(String teamName) {
        return playerRepository.findAll().stream()
                .filter(player -> player.getTeam() != null && player.getTeam().equalsIgnoreCase(teamName))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByName(String searchText) {
        return playerRepository.findAll().stream()
                .filter(player -> player.getName().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByNameOrTeam(String searchText) {
        String normalizedSearch = searchText.toLowerCase().trim();
        return playerRepository.findAll().stream()
                .filter(player ->
                        player.getName().toLowerCase().contains(normalizedSearch) ||
                                player.getTeam().toLowerCase().contains(normalizedSearch))
                .collect(Collectors.toList());
    }

    public Player addPlayer(Player player) {
        playerRepository.save(player);
        return player;
    }

    public Player updatePlayer(Player updatedPlayer) {
        Optional<Player> existingPlayer = playerRepository.findByName(updatedPlayer.getName());
        if (existingPlayer.isPresent()) {
            Player playerToUpdate = existingPlayer.get();
            playerToUpdate.setName(updatedPlayer.getName());
            playerToUpdate.setTeam(updatedPlayer.getTeam());
            return playerRepository.save(playerToUpdate);
        }
        return null;
    }

    public String getPredictionBetweenPlayers(String playerA, String playerB) {
        Optional<Player> a = playerRepository.findByName(playerA);
        Optional<Player> b = playerRepository.findByName(playerB);

        if (a.isEmpty() || b.isEmpty()) {
            return "One or both players not found.";
        }

        Player p1 = a.get();
        Player p2 = b.get();

        double p1WinRate = p1.getGamesWonPercent();
        double p2WinRate = p2.getGamesWonPercent();

        int p1Odds = calculateMoneylineOdds(p1WinRate, p2WinRate);
        int p2Odds = calculateMoneylineOdds(p2WinRate, p1WinRate);

        String winner = p1WinRate >= p2WinRate ? p1.getName() : p2.getName();

        String prompt = String.format("""
        You are a fantasy sports analyst. Predict who would win in a Major League Pickleball match between:

        1. %s (Team: %s, Games Won: %d, Games Lost: %d, Points Won: %d, Points Lost: %d) — Odds: %s%d

        2. %s (Team: %s, Games Won: %d, Games Lost: %d, Points Won: %d, Points Lost: %d) — Odds: %s%d

        Write two short paragraphs comparing both players’ strengths and weaknesses. Then on a separate line, include:
        "🎯 Prediction: %s will likely win this match."

        Be bold and base your analysis on stats only.
        """,
                p1.getName(), p1.getTeam(), p1.getGamesWon(), p1.getGamesLost(), p1.getPtsWon(), p1.getPtsLost(),
                (p1Odds >= 0 ? "+" : ""), p1Odds,

                p2.getName(), p2.getTeam(), p2.getGamesWon(), p2.getGamesLost(), p2.getPtsWon(), p2.getPtsLost(),
                (p2Odds >= 0 ? "+" : ""), p2Odds,

                winner
        );

        return geminiService.generateCustomContent(prompt);
    }

    private int calculateMoneylineOdds(double winPct1, double winPct2) {
        double prob = winPct1 / (winPct1 + winPct2);
        if (prob >= 0.5) {
            return (int) Math.round(-100 * prob / (1 - prob));
        } else {
            return (int) Math.round(100 * (1 - prob) / prob);
        }
    }


    @Transactional
    public void deletePlayer(String playerName) {
        playerRepository.deleteByName(playerName);
    }
    public String getSummaryForPlayer(String playerName) {
        Optional<Player> optionalPlayer = playerRepository.findAll().stream()
                .filter(p -> p.getName().equalsIgnoreCase(playerName))
                .findFirst();

        if (optionalPlayer.isEmpty()) return "Player not found";

        Player player = optionalPlayer.get();

        int gamesWon = player.getGamesWon();
        int gamesLost = player.getGamesLost();
        int ptsWon = player.getPtsWon();
        int ptsLost = player.getPtsLost();

        String recentStats = String.format("Games won: %d, Games lost: %d, Points won: %d, Points lost: %d",
                gamesWon, gamesLost, ptsWon, ptsLost);

        String styleHint = "Based on win/loss ratio and points";

        int totalGames = gamesWon + gamesLost;

        String baseSummary = geminiService.generatePlayerSummary(
                player.getName(), player.getTeam(), recentStats, styleHint
        );

        return baseSummary;
    }
}
