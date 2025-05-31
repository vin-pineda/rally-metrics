package com.rm.rally_metrics.player;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/player")
public class PlayerController {

    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public List<Player> getPlayers(
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String searchText) {

        if (team != null && name != null) {
            return playerService.getPlayersByNameOrTeam(searchText);
        } else if (team != null) {
            return playerService.getPlayersFromTeam(team);
        } else if (name != null) {
            return playerService.getPlayersByName(name);
        } else if (searchText != null) {
            return playerService.getPlayersByNameOrTeam(searchText);
        } else {
            return playerService.getPlayers();
        }
    }

    @GetMapping("/search")
    public List<Player> getPlayersByNameOrTeam(@RequestParam("name") String name) {
        System.out.println("Searching with name: " + name); // 🔍 Debug log
        return playerService.getPlayersByNameOrTeam(name);
    }

    @GetMapping("/{playerName:.+}/summary")
    public ResponseEntity<String> getPlayerSummary(@PathVariable("playerName") String playerName) {
        String summary = playerService.getSummaryForPlayer(playerName);
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<Player> addPlayer(@RequestBody Player player) {
        Player createdPlayer = playerService.addPlayer(player);
        return new ResponseEntity<>(createdPlayer, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<Player> updatePlayer(@RequestBody Player player) {
        Player resultPlayer = playerService.updatePlayer(player);
        if (resultPlayer != null) {
            return new ResponseEntity<>(resultPlayer, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{playerName}")
    public ResponseEntity<String> deletePlayer(@PathVariable String playerName) {
        playerService.deletePlayer(playerName);
        return new ResponseEntity<>("Player deleted successfully", HttpStatus.OK);
    }
}
