plugins {
    alias(libs.plugins.kotlin.jvm)
}

kotlin { jvmToolchain(17) }

dependencies {
    api(project(":core:inference-api"))
    api(project(":core:philosophers"))
    testImplementation(project(":adapters:demo-inference"))
    testImplementation(libs.kotlin.test)
    testImplementation(libs.kotlinx.coroutines.test)
}

tasks.test {
    systemProperty("agora.packsDir", rootProject.file("resources/philosophers").absolutePath)
}
