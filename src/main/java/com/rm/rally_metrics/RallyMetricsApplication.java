package com.rm.rally_metrics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RallyMetricsApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(RallyMetricsApplication.class, args);
		StatsSyncScheduler scheduler = context.getBean(StatsSyncScheduler.class);
	}

}
