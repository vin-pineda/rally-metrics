package com.rm.rally_metrics.player;

import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.InputStreamReader;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/v1/csv")
public class CsvImportController {

    @Autowired
    private PlayerRepository playerRepository;

    @PostMapping("/import")
    public String importCsv() {
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("mlp_stats.csv");
            if (inputStream == null) {
                return "CSV file not found in resources!";
            }

            InputStreamReader reader = new InputStreamReader(inputStream);

            List<Player> players = new CsvToBeanBuilder<Player>(reader)
                    .withType(Player.class)
                    .build()
                    .parse();

            playerRepository.saveAll(players);
            return "Import successful!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error importing CSV: " + e.getMessage();
        }
    }
}
