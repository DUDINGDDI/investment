# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
모든 언어는 한국어를 사용해야해

## Build & Development Commands

This is a Gradle 9.3.0 project using the Gradle Wrapper (`./gradlew`).

- **Build:** `./gradlew build`
- **Run:** `./gradlew bootRun`
- **Test (all):** `./gradlew test`
- **Test (single class):** `./gradlew test --tests "com.pm.investment.SomeTest"`
- **Test (single method):** `./gradlew test --tests "com.pm.investment.SomeTest.methodName"`
- **Clean:** `./gradlew clean`

## Architecture

Spring Boot 4.0.3 web application (Java 21) for investment management.

- **Base package:** `com.pm.investment`
- **Entry point:** `InvestmentApplication.java`
- **Persistence:** Spring Data JPA
- **Web layer:** Spring WebMVC with RestClient for outbound HTTP calls
- **Boilerplate reduction:** Lombok (use `@Getter`, `@Setter`, `@AllArgsConstructor`, etc. instead of manual implementations)
- **Testing:** JUnit 5 via `spring-boot-starter-*-test` modules for JPA, RestClient, and WebMVC

## Key Configuration

- `src/main/resources/application.yaml` — Spring application config
- `build.gradle` — dependencies and build settings
- Java toolchain targets JDK 21; compiler uses `-parameters` flag for runtime parameter name retention
