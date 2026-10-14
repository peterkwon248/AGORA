plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
}

kotlin { jvmToolchain(17) }

dependencies {
    implementation(libs.kaml)
    testImplementation(libs.kotlin.test)
}

tasks.test {
    // 실제 팩(resources/philosophers)을 그대로 읽어 검증한다
    systemProperty("agora.packsDir", rootProject.file("resources/philosophers").absolutePath)
}
