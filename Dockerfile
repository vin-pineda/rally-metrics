# Debian bookworm base. The old `openjdk:17-slim` image was deprecated and its
# tags removed from Docker Hub, so we install the JDK from apt instead. bookworm
# still ships real `chromium`/`chromium-driver` packages (Selenium needs them).
FROM debian:bookworm-slim

# Install only what's required: the JDK (build + run the jar), Python for the
# scraper, Chromium for Selenium, and curl for the HEALTHCHECK. Clean apt caches
# to reduce image size.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jdk-headless \
        python3 \
        python3-pip \
        curl \
        chromium \
        chromium-driver && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV DISPLAY=:99

WORKDIR /app

# --- Dependency layers (cached unless these files change) ---
# Copy the Python requirements first so pip layer is cached.
COPY requirements.txt .
# bookworm marks the system Python as externally managed (PEP 668); all our deps
# are prebuilt wheels, so installing system-wide is safe with this flag.
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the Maven wrapper + pom before the source so the dependency download
# is its own cached layer and is not invalidated by source changes.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# --- Application source ---
COPY src src

# Build the jar (offline so it reuses the cached dependencies).
RUN ./mvnw -B clean package -DskipTests

# Run as a non-root user.
RUN groupadd --system app && \
    useradd --system --gid app --home-dir /app app && \
    chown -R app:app /app
USER app

EXPOSE 8080

# The Spring Boot app serves HTTP on 8080; hit the player endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fsS http://localhost:8080/api/v1/player || exit 1

CMD ["java", "-jar", "target/rally-metrics-0.0.1-SNAPSHOT.jar"]
