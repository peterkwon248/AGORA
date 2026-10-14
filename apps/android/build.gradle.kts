plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "app.agora"
    compileSdk = 37

    defaultConfig {
        applicationId = "app.agora"
        // 임시값. 로컬 LLM 런타임 요구사항·기기 실측 후 ADR-001에서 확정한다.
        minSdk = 28
        targetSdk = 36
        versionCode = 1
        versionName = "0.0.1-sprint0"
    }

    buildFeatures { compose = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // 철학자 팩을 assets/philosophers/<id>/pack.yaml 로 묶는다 — 저장소의 원본 하나만 쓴다
    sourceSets["main"].assets.directories += rootProject.file("resources").path
}

dependencies {
    implementation(project(":core:orchestration"))
    // 주의: :adapters:demo-inference 는 여기에 넣지 않는다 (지시서 9.3)

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.foundation)
    implementation(libs.compose.material3)
    implementation(libs.compose.ui.tooling.preview)
    debugImplementation(libs.compose.ui.tooling)
}
