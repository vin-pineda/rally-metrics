package com.rm.rally_metrics;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;

@Component
public class StatsSyncScheduler {

    @Scheduled(cron = "0 0 8 * * *", zone = "America/Los_Angeles")
    public void runPythonScript() {
        String timestamp = ZonedDateTime.now(ZoneId.of("America/Los_Angeles"))
                .format(DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss z"));
        System.out.println("===== Scheduled Python Script Triggered at: " + timestamp + " =====");

        try {
            ProcessBuilder pb = new ProcessBuilder("python3", "src/main/resources/scripts/main.py");
            pb.redirectErrorStream(true);
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[Python Script] " + line);
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                System.err.println("Python script exited with code " + exitCode);
            } else {
                System.out.println("Python script ran successfully.");
            }
        } catch (Exception e) {
            System.err.println("Error running Python script:");
            e.printStackTrace();
        }

        System.out.println("===== Python Script Execution Finished =====");
    }
}
