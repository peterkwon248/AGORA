// 개발 전용: PC Ollama 연결. 릴리스 앱에 넣지 않는다(debugImplementation만 허용).
plugins {
    alias(libs.plugins.kotlin.jvm)
}

kotlin { jvmToolchain(17) }

dependencies {
    api(project(":core:inference-api"))
    implementation(libs.kotlinx.serialization.json)
}
