package com.rm.rally_metrics.player;

import com.opencsv.bean.CsvBindByName;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "player_statistic")
public class Player {

    @Id
    @CsvBindByName(column = "Name")
    @Column(name = "name", unique = true)
    private String name;

    @CsvBindByName(column = "Rank")
    @Column(name = "rank")
    private Integer rank;

    @CsvBindByName(column = "Team")
    @Column(name = "team")
    private String team;

    @CsvBindByName(column = "Games Won")
    @Column(name = "games_won")
    private Integer games_won;

    @CsvBindByName(column = "Games Lost")
    @Column(name = "games_lost")
    private Integer games_lost;

    @CsvBindByName(column = "Games Won Percent")
    @Column(name = "games_won_percent")
    private Double games_won_percent;

    @CsvBindByName(column = "Pts Won")
    @Column(name = "pts_won")
    private Integer pts_won;

    @CsvBindByName(column = "Pts Lost")
    @Column(name = "pts_lost")
    private Integer pts_lost;

    @CsvBindByName(column = "Pts Won Percent")
    @Column(name = "pts_won_percent")
    private Double pts_won_percent;

    public Player() {}

    public Player(String name, Integer rank, String team,
                  Integer games_won, Integer games_lost, Double games_won_percent,
                  Integer pts_won, Integer pts_lost, Double pts_won_percent) {
        this.name = name;
        this.rank = rank;
        this.team = team;
        this.games_won = games_won;
        this.games_lost = games_lost;
        this.games_won_percent = games_won_percent;
        this.pts_won = pts_won;
        this.pts_lost = pts_lost;
        this.pts_won_percent = pts_won_percent;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public Integer getGames_won() { return games_won; }
    public void setGames_won(Integer games_won) { this.games_won = games_won; }

    public Integer getGames_lost() { return games_lost; }
    public void setGames_lost(Integer games_lost) { this.games_lost = games_lost; }

    public Double getGames_won_percent() { return games_won_percent; }
    public void setGames_won_percent(Double games_won_percent) { this.games_won_percent = games_won_percent; }

    public Integer getPts_won() { return pts_won; }
    public void setPts_won(Integer pts_won) { this.pts_won = pts_won; }

    public Integer getPts_lost() { return pts_lost; }
    public void setPts_lost(Integer pts_lost) { this.pts_lost = pts_lost; }

    public Double getPts_won_percent() { return pts_won_percent; }
    public void setPts_won_percent(Double pts_won_percent) { this.pts_won_percent = pts_won_percent; }
}
