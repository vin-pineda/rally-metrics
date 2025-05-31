// src/main/java/com/rm/rally_metrics/player/PlayerCsvService.java
package com.rm.rally_metrics.player;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

@Service
public class PlayerCsvService {

    @Autowired
    private PlayerRepository playerRepository;

    public void importCsv(InputStream input) throws IOException, CsvException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input))) {
            CSVReader csvReader = new CSVReader(reader);
            List<String[]> records = csvReader.readAll();

            for (int i = 1; i < records.size(); i++) {
                String[] line = records.get(i);

                Player player = new Player(
                        line[0], // name
                        Integer.parseInt(line[1]), // rank
                        line[2], // team
                        Integer.parseInt(line[3]), // games_won
                        Integer.parseInt(line[4]), // games_lost
                        Double.parseDouble(line[5]), // games_won_percent
                        Integer.parseInt(line[6]), // pts_won
                        Integer.parseInt(line[7]), // pts_lost
                        Double.parseDouble(line[8]) // pts_won_percent
                );

                playerRepository.save(player);
            }
        }
    }
}
