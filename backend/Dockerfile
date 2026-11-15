FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r apar \
    && useradd -r -g apar apar
COPY --from=build /app/target/apar-simple-1.0.0.jar /app/app.jar
COPY db/init/01_schema.sql /app/db/init/01_schema.sql
COPY db/init/02_reference_data.sql /app/db/init/02_reference_data.sql
COPY db/init/02_seed.sql /app/db/init/02_seed.sql
COPY backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod 0755 /app/docker-entrypoint.sh \
    && chown -R apar:apar /app
USER apar
EXPOSE 8080
ENTRYPOINT ["/app/docker-entrypoint.sh"]
