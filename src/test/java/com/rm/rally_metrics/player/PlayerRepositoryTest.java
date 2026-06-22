package com.rm.rally_metrics.player;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PlayerRepositoryTest {

    @Autowired
    PlayerRepository repository;

    @BeforeEach
    void seed() {
        repository.deleteAll();
        repository.save(new Player("Ben Johns", 1, "Dallas Flash", 42, 10, 0.8, 820, 540, 0.6));
        repository.save(new Player("Jorja Johnson", 6, "Orlando Squeeze", 28, 24, 0.53, 690, 670, 0.5));
        repository.save(new Player("JW Johnson", 5, "Orlando Squeeze", 30, 22, 0.57, 700, 660, 0.51));
    }

    @Test
    void findByTeamIgnoreCase_isCaseInsensitive() {
        List<Player> result = repository.findByTeamIgnoreCase("orlando squeeze");
        assertThat(result).hasSize(2)
                .extracting(Player::getName)
                .containsExactlyInAnyOrder("Jorja Johnson", "JW Johnson");
    }

    @Test
    void searchByNameOrTeam_matchesNameSubstringCaseInsensitive() {
        List<Player> byName = repository.searchByNameOrTeam("johns");
        // matches "Ben Johns", "Jorja Johnson", "JW Johnson"
        assertThat(byName).extracting(Player::getName)
                .containsExactlyInAnyOrder("Ben Johns", "Jorja Johnson", "JW Johnson");
    }

    @Test
    void searchByNameOrTeam_matchesTeamSubstring() {
        List<Player> byTeam = repository.searchByNameOrTeam("dallas");
        assertThat(byTeam).extracting(Player::getName).containsExactly("Ben Johns");
    }
}
