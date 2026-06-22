package com.rm.rally_metrics.player;

import com.rm.rally_metrics.ai.MatchPrediction;
import com.rm.rally_metrics.ai.agents.MatchAnalysis;
import com.rm.rally_metrics.ai.agents.MatchAnalysisInput;
import com.rm.rally_metrics.ai.agents.MatchAnalysisOrchestrator;
import com.rm.rally_metrics.ai.agents.ScoutAgent;
import com.rm.rally_metrics.ai.agents.ScoutReport;
import com.rm.rally_metrics.error.NotFoundException;
import com.rm.rally_metrics.prediction.DraftTier;
import com.rm.rally_metrics.prediction.MatchProbabilityModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Wiring-focused tests for {@link PlayerService}: repository, the multi-agent orchestrator, and the
 * scout agent are mocked; the probability model is real (its rigor is covered by
 * {@link com.rm.rally_metrics.prediction.MatchProbabilityModelTest}).
 */
class PlayerServiceTest {

    private PlayerRepository playerRepository;
    private MatchAnalysisOrchestrator orchestrator;
    private ScoutAgent scoutAgent;
    private PlayerService playerService;

    private static final ScoutReport SCOUT_A = new ScoutReport("Aggressor", List.of("power"), List.of("nerves"), "draft");
    private static final ScoutReport SCOUT_B = new ScoutReport("Grinder", List.of("consistency"), List.of("ceiling"), "flex");

    @BeforeEach
    void setUp() {
        playerRepository = mock(PlayerRepository.class);
        orchestrator = mock(MatchAnalysisOrchestrator.class);
        scoutAgent = mock(ScoutAgent.class);
        playerService = new PlayerService(playerRepository, new MatchProbabilityModel(), orchestrator, scoutAgent);
    }

    private Player player(String name, String team, int gw, int gl, double gwp, int pw, int pl, double pwp) {
        return new Player(name, 1, team, gw, gl, gwp, pw, pl, pwp);
    }

    @Test
    void prediction_combinesDeterministicModelWithMultiAgentNarrative() {
        Player ben = player("Ben Johns", "Dallas Flash", 42, 10, 0.808, 820, 540, 0.603);
        Player jw = player("JW Johnson", "Orlando Squeeze", 30, 22, 0.577, 700, 660, 0.515);
        when(playerRepository.findByName("Ben Johns")).thenReturn(Optional.of(ben));
        when(playerRepository.findByName("JW Johnson")).thenReturn(Optional.of(jw));
        when(orchestrator.analyze(any()))
                .thenReturn(new MatchAnalysis("multi-agent reasoning", SCOUT_A, SCOUT_B));

        MatchPrediction p = playerService.getPredictionBetweenPlayers("Ben Johns", "JW Johnson");

        assertThat(p.winnerName()).isEqualTo("Ben Johns");
        assertThat(p.winProbability()).isBetween(0.5, 1.0);
        assertThat(p.moneylineOdds()).isNegative();
        assertThat(p.confidence()).isEqualTo("HIGH");
        assertThat(p.modelVersion()).isEqualTo("rm-match-model-1.0.0");
        assertThat(p.keyFactors()).isNotEmpty();
        assertThat(p.reasoning()).isEqualTo("multi-agent reasoning");
        assertThat(p.scoutingA()).isEqualTo(SCOUT_A);
        assertThat(p.scoutingB()).isEqualTo(SCOUT_B);

        ArgumentCaptor<MatchAnalysisInput> captor = ArgumentCaptor.forClass(MatchAnalysisInput.class);
        verify(orchestrator).analyze(captor.capture());
        assertThat(captor.getValue().winnerName()).isEqualTo("Ben Johns");
        assertThat(captor.getValue().confidence()).isEqualTo("HIGH");
        assertThat(captor.getValue().keyFactorsText()).contains("Game win %");
    }

    @Test
    void prediction_throwsNotFoundWhenPlayerMissing() {
        when(playerRepository.findByName("Ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> playerService.getPredictionBetweenPlayers("Ghost", "Anyone"))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Ghost");
    }

    @Test
    void summary_returnsTierRatingLeagueBenchmarksAndCachedScoutingReport() {
        Player ben = player("Ben Johns", "Dallas Flash", 42, 10, 80.8, 820, 540, 60.3);
        Player mid = player("Mid Player", "NJ Fives", 26, 26, 50.0, 600, 600, 50.0);
        Player low = player("Low Player", "Chicago Slice", 14, 38, 26.9, 480, 720, 40.0);
        when(playerRepository.findByName("Ben Johns")).thenReturn(Optional.of(ben));
        when(playerRepository.findAll()).thenReturn(List.of(ben, mid, low));
        when(scoutAgent.scout(eq("Ben Johns"), anyString(), any())).thenReturn(SCOUT_A);

        PlayerSnapshot snapshot = playerService.getSummaryForPlayer("Ben Johns");

        // Tier/rating/league benchmarks are deterministic; scouting is the cached report.
        assertThat(snapshot.draftTier()).isEqualTo(DraftTier.STRONG_DRAFT);
        assertThat(snapshot.skillRating()).isBetween(50, 100); // elite
        assertThat(snapshot.leagueSize()).isEqualTo(3);
        assertThat(snapshot.avgSkillRating()).isBetween(0, 100);
        // Ben (80.8% win) sits above the league average win rate.
        assertThat(snapshot.leagueAvgWinPct()).isGreaterThan(0.0).isLessThan(ben.getGamesWonPercent());
        assertThat(snapshot.leagueAvgPtWinPct()).isGreaterThan(0.0);
        assertThat(snapshot.scouting()).isEqualTo(SCOUT_A);
        verify(scoutAgent).scout(eq("Ben Johns"), anyString(), any());
    }

    @Test
    void summary_throwsNotFoundWhenPlayerMissing() {
        when(playerRepository.findByName("Ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> playerService.getSummaryForPlayer("Ghost"))
                .isInstanceOf(NotFoundException.class);
    }
}
