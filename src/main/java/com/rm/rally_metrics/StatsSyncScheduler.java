package com.rm.rally_metrics;

import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

@Component
public class StatsSyncScheduler {

    private static final long SCRIPT_TIMEOUT_MINUTES = 10;

    @Scheduled(cron = "0 0 8 * * *", zone = "America/Los_Angeles")
    public void runPythonScript() {
        String timestamp = ZonedDateTime.now(ZoneId.of("America/Los_Angeles"))
                .format(DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss z"));
        System.out.println("===== Scheduled Python Script Triggered at: " + timestamp + " =====");

        try {
            String scriptPath = resolveScriptPath();
            ProcessBuilder pb = new ProcessBuilder("python3", scriptPath);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[Python Script] " + line);
                }
            }

            boolean finished = process.waitFor(SCRIPT_TIMEOUT_MINUTES, TimeUnit.MINUTES);
            if (!finished) {
                process.destroyForcibly();
                System.err.println("Python script timed out after " + SCRIPT_TIMEOUT_MINUTES + " minutes.");
            } else if (process.exitValue() != 0) {
                System.err.println("Python script exited with code " + process.exitValue());
            } else {
                System.out.println("Python script ran successfully.");
            }
        } catch (Exception e) {
            System.err.println("Error running Python script:");
            e.printStackTrace();
        }

        System.out.println("===== Python Script Execution Finished =====");
    }

    /**
     * Resolve the bundled python script to an absolute path. Prefer the classpath
     * resource (works when the resource is on disk during dev); fall back to the
     * project-relative source path.
     */
    private String resolveScriptPath() throws Exception {
        ClassPathResource resource = new ClassPathResource("scripts/main.py");
        if (resource.exists()) {
            try {
                return resource.getFile().getAbsolutePath();
            } catch (Exception ignored) {
                // Resource is inside a jar; fall through to the source path.
            }
        }
        return new File("src/main/resources/scripts/main.py").getAbsolutePath();
    }
}
