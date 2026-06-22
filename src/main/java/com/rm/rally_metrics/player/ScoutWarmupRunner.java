package com.rm.rally_metrics.player;

import com.rm.rally_metrics.ai.agents.ScoutAgent;
import com.rm.rally_metrics.prediction.PlayerStats;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Pre-computes each player's scouting report shortly after startup, in the background, so the
 * first match prediction never waits on (or fails) a live scout call. Scouting is stable for a
 * season, so this is computed once and reused (the {@link ScoutAgent} caches by player name); a
 * production deployment would re-run this after each daily stats scrape.
 *
 * <p>Skipped when no {@code ANTHROPIC_API_KEY} is configured (e.g. tests), so it never makes a
 * doomed network call at boot.
 */
@Component
public class ScoutWarmupRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ScoutWarmupRunner.class);

    private final PlayerRepository playerRepository;
    private final ScoutAgent scoutAgent;
    private final boolean enabled;

    public ScoutWarmupRunner(PlayerRepository playerRepository,
                             ScoutAgent scoutAgent,
                             @Value("${anthropic.api.key:}") String apiKey) {
        this.playerRepository = playerRepository;
        this.scoutAgent = scoutAgent;
        this.enabled = apiKey != null && !apiKey.isBlank();
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("Scout cache warmup skipped (no ANTHROPIC_API_KEY).");
            return;
        }
        Thread t = new Thread(this::warm, "scout-warmup");
        t.setDaemon(true);
        t.start();
    }

    private void warm() {
        try {
            List<Player> players = playerRepository.findAll();
            log.info("Warming scouting cache for {} players...", players.size());
            for (Player p : players) {
                try {
                    scoutAgent.scout(p.getName(), p.getTeam(), new PlayerStats(
                            nz(p.getGamesWon()), nz(p.getGamesLost()), nz(p.getPtsWon()), nz(p.getPtsLost())));
                } catch (RuntimeException e) {
                    log.warn("Warmup scout failed for '{}': {}", p.getName(), e.toString());
                }
            }
            log.info("Scout cache warmup complete.");
        } catch (RuntimeException e) {
            log.warn("Scout cache warmup aborted: {}", e.toString());
        }
    }

    private static int nz(Integer value) {
        return value == null ? 0 : value;
    }
}
