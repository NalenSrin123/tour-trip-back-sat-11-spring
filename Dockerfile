FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn/ .mvn/
COPY src/ src/
RUN ./mvnw clean package -DskipTests -q && cp target/tour-trip-api-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70.0", "-jar", "app.jar"]
