package app.agora

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import app.agora.chat.RoomScreen
import app.agora.chat.RoomViewModel
import app.agora.ui.theme.AgoraTheme

class MainActivity : ComponentActivity() {
    private val vm: RoomViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        // UI 언어 = 기기 언어(ko 외에는 en). 대화 언어 분리 설정은 Sprint 1.
        val locale = if (resources.configuration.locales[0].language == "ko") "ko" else "en"
        setContent {
            AgoraTheme { RoomScreen(vm, locale) }
        }
    }
}
