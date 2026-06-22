package com.rm.rally_metrics.ai.agents;

import com.rm.rally_metrics.prediction.PlayerStats;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MatchAnalysisOrchestratorTest {

    private ScoutAgent scout;
    private AnalystAgent analyst;
    private CriticAgent critic;
    private MatchAnalysisOrchestrator orchestrator;

    private static final ScoutReport REPORT_A = new ScoutReport("Aggressor", List.of("power"), List.of("nerves"), "draft");
    private static final ScoutReport REPORT_B = new ScoutReport("Grinder", List.of("consistency"), List.of("ceiling"), "flex");

    @BeforeEach
    void setUp() {
        scout = mock(ScoutAgent.class);
        analyst = mock(AnalystAgent.class);
        critic = mock(CriticAgent.class);
        orchestrator = new MatchAnalysisOrchestrator(scout, analyst, critic);

        when(scout.scout(eq("Alice"), anyString(), any())).thenReturn(REPORT_A);
        when(scout.scout(eq("Bob"), anyString(), any())).thenReturn(REPORT_B);
    }

    private MatchAnalysisInput input() {
        return new MatchAnalysisInput(
                "Alice", "Team A", new PlayerStats(40, 10, 800, 500),
                "Bob", "Team B", new PlayerStats(30, 20, 700, 600),
                "Alice", 0.62, -160, "HIGH", "- Game win %: A=80.0%, B=60.0% (edge: A)");
    }

    @Test
    void scoutsBothPlayers_synthesizes_andReturnsAnalystOutputWhenApproved() {
        when(analyst.analyze(any())).thenReturn("grounded reasoning");
        when(critic.critique(anyString(), anyString())).thenReturn(new Critique(true, List.of()));

        MatchAnalysis result = orchestrator.analyze(input());

        assertThat(result.reasoning()).isEqualTo("grounded reasoning");
        assertThat(result.scoutA()).isEqualTo(REPORT_A);
        assertThat(result.scoutB()).isEqualTo(REPORT_B);
        verify(scout).scout(eq("Alice"), anyString(), any());
        verify(scout).scout(eq("Bob"), anyString(), any());
        verify(analyst, times(1)).analyze(any());
        verify(critic, times(1)).critique(anyString(), anyString());
    }

    @Test
    void revisesOnce_whenCriticRejectsWithIssues() {
        when(analyst.analyze(any())).thenReturn("first draft", "revised draft");
        when(critic.critique(anyString(), anyString()))
                .thenReturn(new Critique(false, List.of("unsupported claim about scores")));

        MatchAnalysis result = orchestrator.analyze(input());

        assertThat(result.reasoning()).isEqualTo("revised draft");
        verify(analyst, times(2)).analyze(any()); // original + one revision
    }

    @Test
    void doesNotRevise_whenCriticRejectsButListsNoIssues() {
        when(analyst.analyze(any())).thenReturn("only draft");
        when(critic.critique(anyString(), anyString())).thenReturn(new Critique(false, List.of()));

        MatchAnalysis result = orchestrator.analyze(input());

        assertThat(result.reasoning()).isEqualTo("only draft");
        verify(analyst, times(1)).analyze(any());
    }

    @Test
    void stillProducesAnalysis_whenScoutingUnavailable() {
        when(scout.scout(anyString(), anyString(), any())).thenReturn(ScoutReport.unavailable());
        when(analyst.analyze(any())).thenReturn("reasoning without scouting");
        when(critic.critique(anyString(), anyString())).thenReturn(new Critique(true, List.of()));

        MatchAnalysis result = orchestrator.analyze(input());

        assertThat(result.reasoning()).isEqualTo("reasoning without scouting");
        verify(analyst, times(1)).analyze(any());
        verify(critic, never()).critique(eq(""), anyString());
    }
}
