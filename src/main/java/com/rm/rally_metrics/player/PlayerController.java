package com.rm.rally_metrics.player;

import com.rm.rally_metrics.ai.MatchPrediction;
import com.rm.rally_metrics.error.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

        if (searchText != null) {
            return playerService.getPlayersByNameOrTeam(searchText);
        } else if (team != null) {
            return playerService.getPlayersFromTeam(team);
        } else if (name != null) {
            return playerService.getPlayersByNameOrTeam(name);
        } else {
            return playerService.getPlayers();
        }
    }

    @GetMapping("/{playerName:.+}/summary")
    public ResponseEntity<PlayerSnapshot> getPlayerSummary(@PathVariable("playerName") String playerName) {
        return ResponseEntity.ok(playerService.getSummaryForPlayer(playerName));
    }

    @PostMapping("/predict")
    public ResponseEntity<MatchPrediction> getMatchPrediction(@RequestBody Map<String, String> request) {
        String playerA = request.get("playerA");
        String playerB = request.get("playerB");

        if (isBlank(playerA) || isBlank(playerB)) {
            throw new BadRequestException("Both 'playerA' and 'playerB' are required.");
        }

        MatchPrediction prediction = playerService.getPredictionBetweenPlayers(playerA, playerB);
        return ResponseEntity.ok(prediction);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
