package com.rm.rally_metrics.player;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping(path = "api/v1/player")
public class PlayerController {
    private final PlayerService playerService;
    private final PlayerCsvService playerCsvService;

    @Autowired
    public PlayerController(PlayerService playerService, PlayerCsvService playerCsvService) {
        this.playerService = playerService;
        this.playerCsvService = playerCsvService;
    }
    @PostMapping("/upload")
    public ResponseEntity<String> uploadCsv() {
        try (InputStream input = getClass().getResourceAsStream("/mlp_stats.csv")) {
            if (input == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("CSV file not found in resources.");
            }

            playerCsvService.importCsv(input);
            return ResponseEntity.ok("CSV import successful.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to import CSV: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Player> getPlayers(
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String searchText) {

        if(team != null && name != null) {
            return playerService.getPlayersByNameOrTeam(searchText);
        }
        else if(team != null) {
            return playerService.getPlayersFromTeam(team);
        }
        else if(name != null) {
            return playerService.getPlayersByName(name);
        }
        else {
            return playerService.getPlayers();
        }
    }

    @GetMapping("/search")
    public List<Player> getPlayersByNameOrTeam(@RequestParam("name") String name) {
        System.out.println("Searching with name: " + name); // 🔍 Debug log
        return playerService.getPlayersByNameOrTeam(name);
    }


    @GetMapping("/{playerName:.+}/summary")
    public ResponseEntity<String> getPlayerSummary(@PathVariable("playerName") String playerName)
    {
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
        if(resultPlayer != null) {
            return new ResponseEntity<>(resultPlayer, HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{playerName}")
    public ResponseEntity<String> deletePlayer(@PathVariable String playerName) {
        playerService.deletePlayer(playerName);
        return new ResponseEntity<>("Player deleted successfully", HttpStatus.OK);
    }
}
