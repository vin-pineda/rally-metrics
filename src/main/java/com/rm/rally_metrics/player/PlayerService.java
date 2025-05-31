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
        String recentStats = String.format("Games won: %d, Games lost: %d, Points won: %d, Points lost: %d",
                player.getGames_won(), player.getGames_lost(),
                player.getPts_won(), player.getPts_lost());

        String styleHint = "Based on win/loss ratio and points";

        return geminiService.generatePlayerSummary(
                player.getName(), player.getTeam(), recentStats, styleHint
        );
    }
}
