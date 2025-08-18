# syntax=docker/dockerfile:1

FROM maven:3.9.7-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Respect small container memory; Render provides PORT.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
CMD ["sh","-c","java -Dserver.port=${PORT} -jar app.jar"]
