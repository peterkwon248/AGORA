pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "agora"

// 순수 Kotlin 모듈 — Android 의존 없음 (ADR-001: 나중에 KMP로 옮길 수 있게)
include(":core:inference-api")
include(":core:philosophers")
include(":core:orchestration")

// 테스트·개발 전용 어댑터 — 릴리스 앱에 넣지 않는다 (AGENTS.md)
include(":adapters:demo-inference")
include(":adapters:ollama-dev")
include(":tools:pc-harness")

// Android 앱 — 시안 이식 화면 (ADR-001)
include(":apps:android")
