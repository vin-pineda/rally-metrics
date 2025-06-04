FROM openjdk:17-slim

RUN apt-get update && \
    apt-get install -y python3 python3-pip curl unzip chromium chromium-driver

ENV DISPLAY=:99

WORKDIR /app

COPY . .

COPY requirements.txt .
RUN pip3 install -r requirements.txt

RUN chmod +x mvnw

RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/rally-metrics-0.0.1-SNAPSHOT.jar"]
