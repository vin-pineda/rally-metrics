package com.rm.rally_metrics;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RallyMetricsApplicationTests {

	// All AI beans build their Anthropic client lazily and the scout warmup is skipped without
	// an API key, so the context loads against H2 with no network calls or mocks.
	@Test
	void contextLoads() {
	}

}
