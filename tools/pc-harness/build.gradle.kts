// PC 개발 도구: 이 PC의 Ollama로 프롬프트·조율 규칙을 먼저 다듬는다.
// 결과는 '실기기 측정'이 아니다 (ADR-002 4장). 앱에 포함하지 않는다.
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    application
}

kotlin { jvmToolchain(17) }

dependencies {
    implementation(project(":core:orchestration"))
    implementation(project(":adapters:ollama-dev"))
    implementation(libs.kotlinx.serialization.json)
}

application {
    mainClass.set("app.agora.tools.PcHarnessKt")
}

tasks.named<JavaExec>("run") {
    workingDir = rootProject.projectDir
    systemProperty("file.encoding", "UTF-8")
    systemProperty("stdout.encoding", "UTF-8")
}
