package com.rm.rally_metrics.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, String> {

    Optional<Player> findByName(String name);

    List<Player> findByTeamIgnoreCase(String team);

    /** Case-insensitive "contains" search over name OR team. */
    @Query("SELECT p FROM Player p WHERE "
            + "LOWER(p.name) LIKE LOWER(CONCAT('%', :text, '%')) OR "
            + "LOWER(p.team) LIKE LOWER(CONCAT('%', :text, '%'))")
    List<Player> searchByNameOrTeam(@Param("text") String text);
}
