// 테스트·UI 회귀 전용. 릴리스 앱 모듈의 implementation 의존성으로 넣지 않는다 (지시서 9.3).
plugins {
    alias(libs.plugins.kotlin.jvm)
}

kotlin { jvmToolchain(17) }

dependencies {
    api(project(":core:inference-api"))
    testImplementation(libs.kotlin.test)
    testImplementation(libs.kotlinx.coroutines.test)
}
