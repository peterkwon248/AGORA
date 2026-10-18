// 평가 문장(설계서 22.3)과 실행·기록 형식 — PC 시험 도구와 디버그 앱이 같이 쓴다. 릴리스 앱에 넣지 않는다.
plugins {
    alias(libs.plugins.kotlin.jvm)
}

kotlin { jvmToolchain(17) }

dependencies {
    api(project(":core:orchestration"))
    implementation(libs.kotlinx.coroutines.core)
}
