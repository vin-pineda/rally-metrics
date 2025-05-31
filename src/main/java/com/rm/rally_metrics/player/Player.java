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
    private Integer gamesWon;

    @CsvBindByName(column = "Games Lost")
    @Column(name = "games_lost")
    private Integer gamesLost;

    @CsvBindByName(column = "Games Won Percent")
    @Column(name = "games_won_percent")
    private Double gamesWonPercent;

    @CsvBindByName(column = "Pts Won")
    @Column(name = "pts_won")
    private Integer ptsWon;

    @CsvBindByName(column = "Pts Lost")
    @Column(name = "pts_lost")
    private Integer ptsLost;

    @CsvBindByName(column = "Pts Won Percent")
    @Column(name = "pts_won_percent")
    private Double ptsWonPercent;

    public Player() {}

    public Player(String name, Integer rank, String team,
                  Integer gamesWon, Integer gamesLost, Double gamesWonPercent,
                  Integer ptsWon, Integer ptsLost, Double ptsWonPercent) {
        this.name = name;
        this.rank = rank;
        this.team = team;
        this.gamesWon = gamesWon;
        this.gamesLost = gamesLost;
        this.gamesWonPercent = gamesWonPercent;
        this.ptsWon = ptsWon;
        this.ptsLost = ptsLost;
        this.ptsWonPercent = ptsWonPercent;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public Integer getGamesWon() { return gamesWon; }
    public void setGamesWon(Integer gamesWon) { this.gamesWon = gamesWon; }

    public Integer getGamesLost() { return gamesLost; }
    public void setGamesLost(Integer gamesLost) { this.gamesLost = gamesLost; }

    public Double getGamesWonPercent() { return gamesWonPercent; }
    public void setGamesWonPercent(Double gamesWonPercent) { this.gamesWonPercent = gamesWonPercent; }

    public Integer getPtsWon() { return ptsWon; }
    public void setPtsWon(Integer ptsWon) { this.ptsWon = ptsWon; }

    public Integer getPtsLost() { return ptsLost; }
    public void setPtsLost(Integer ptsLost) { this.ptsLost = ptsLost; }

    public Double getPtsWonPercent() { return ptsWonPercent; }
    public void setPtsWonPercent(Double ptsWonPercent) { this.ptsWonPercent = ptsWonPercent; }
}
