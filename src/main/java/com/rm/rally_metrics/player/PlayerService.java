package com.rm.rally_metrics.player;

import com.rm.rally_metrics.ai.MatchPrediction;
import com.rm.rally_metrics.ai.agents.MatchAnalysis;
import com.rm.rally_metrics.ai.agents.MatchAnalysisInput;
import com.rm.rally_metrics.ai.agents.MatchAnalysisOrchestrator;
import com.rm.rally_metrics.ai.agents.ScoutAgent;
import com.rm.rally_metrics.ai.agents.ScoutReport;
import com.rm.rally_metrics.error.NotFoundException;
import com.rm.rally_metrics.prediction.DraftTier;
import com.rm.rally_metrics.prediction.KeyFactor;
import com.rm.rally_metrics.prediction.MatchEstimate;
import com.rm.rally_metrics.prediction.MatchProbabilityModel;
import com.rm.rally_metrics.prediction.PlayerStats;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final MatchProbabilityModel probabilityModel;
    private final MatchAnalysisOrchestrator analysisOrchestrator;
    private final ScoutAgent scoutAgent;

    @Autowired
    public PlayerService(PlayerRepository playerRepository,
                         MatchProbabilityModel probabilityModel,
                         MatchAnalysisOrchestrator analysisOrchestrator,
                         ScoutAgent scoutAgent) {
        this.playerRepository = playerRepository;
        this.probabilityModel = probabilityModel;
        this.analysisOrchestrator = analysisOrchestrator;
        this.scoutAgent = scoutAgent;
    }

    public List<Player> getPlayers() {
        return playerRepository.findAll();
    }

    public List<Player> getPlayersFromTeam(String teamName) {
        return playerRepository.findByTeamIgnoreCase(teamName);
    }

    public List<Player> getPlayersByNameOrTeam(String searchText) {
        return playerRepository.searchByNameOrTeam(searchText.trim());
    }

    public MatchPrediction getPredictionBetweenPlayers(String playerA, String playerB) {
        Player p1 = playerRepository.findByName(playerA)
                .orElseThrow(() -> new NotFoundException("Player not found: " + playerA));
        Player p2 = playerRepository.findByName(playerB)
                .orElseThrow(() -> new NotFoundException("Player not found: " + playerB));

        PlayerStats statsA = toStats(p1);
        PlayerStats statsB = toStats(p2);

        // All numbers are computed deterministically by the model; the agents only narrate them.
        MatchEstimate estimate = probabilityModel.estimate(statsA, statsB);
        List<KeyFactor> keyFactors = probabilityModel.keyFactors(statsA, statsB);
        Player winner = estimate.winnerIsA() ? p1 : p2;
        String confidence = estimate.confidence().name();

        MatchAnalysis analysis = analysisOrchestrator.analyze(new MatchAnalysisInput(
                p1.getName(), p1.getTeam(), statsA,
                p2.getName(), p2.getTeam(), statsB,
                winner.getName(), estimate.winProbability(), estimate.moneylineOdds(),
                confidence, keyFactorsText(keyFactors)));

        return new MatchPrediction(
                winner.getName(), estimate.winProbability(), estimate.moneylineOdds(),
                confidence, MatchProbabilityModel.MODEL_VERSION, keyFactors,
                analysis.scoutA(), analysis.scoutB(), analysis.reasoning());
    }

    /**
     * Structured player snapshot for the expandable row: a deterministic draft-tier verdict plus
     * the player's scouting report (reused from the same cached/warmed scout the predictor uses,
     * so there is no extra LLM call per view and the two surfaces stay consistent).
     */
    public PlayerSnapshot getSummaryForPlayer(String playerName) {
        Player player = playerRepository.findByName(playerName)
                .orElseThrow(() -> new NotFoundException("Player not found: " + playerName));

        PlayerStats stats = toStats(player);
        DraftTier tier = probabilityModel.draftTier(stats);
        int skillRating = probabilityModel.skillRating(stats);

        // League benchmarks — computed once from the full field so they're identical on every page.
        List<Player> league = playerRepository.findAll();
        int leagueSize = league.size();
        int avgSkillRating = (int) Math.round(league.stream()
                .mapToInt(p -> probabilityModel.skillRating(toStats(p))).average().orElse(skillRating));
        double leagueAvgWinPct = round1(league.stream()
                .mapToDouble(p -> nzd(p.getGamesWonPercent())).average().orElse(0.0));
        double leagueAvgPtWinPct = round1(league.stream()
                .mapToDouble(p -> nzd(p.getPtsWonPercent())).average().orElse(0.0));

        ScoutReport scouting = scoutAgent.scout(player.getName(), player.getTeam(), stats);
        return new PlayerSnapshot(tier, skillRating, leagueSize,
                avgSkillRating, leagueAvgWinPct, leagueAvgPtWinPct, scouting);
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static double nzd(Double value) {
        return value == null ? 0.0 : value;
    }

    private static String keyFactorsText(List<KeyFactor> factors) {
        return factors.stream()
                .map(f -> String.format("- %s: A=%s, B=%s (edge: %s)",
                        f.label(), f.displayA(), f.displayB(), f.advantage()))
                .collect(Collectors.joining("\n"));
    }

    private static PlayerStats toStats(Player p) {
        return new PlayerStats(nz(p.getGamesWon()), nz(p.getGamesLost()),
                nz(p.getPtsWon()), nz(p.getPtsLost()));
    }

    private static int nz(Integer value) {
        return value == null ? 0 : value;
    }
}
