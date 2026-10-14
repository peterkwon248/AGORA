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
        devSend(intent, locale)
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        devSend(intent, if (resources.configuration.locales[0].language == "ko") "ko" else "en")
    }

    /** 디버그 전용: adb로 한글 메시지를 보내 화면을 시험한다(adb input은 한글을 못 친다). 릴리스에서는 무시. */
    private fun devSend(intent: android.content.Intent?, locale: String) {
        if (!app.agora.dev.DevProviders.IS_DEV_BRIDGE) return
        intent?.getStringExtra("dev_send")?.let { vm.send(it, locale) }
    }
}
