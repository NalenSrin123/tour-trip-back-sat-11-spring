FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn/ .mvn/
COPY src/ src/
RUN ./mvnw clean package -DskipTests -q && cp target/tour-trip-api-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
