package app.agora.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * 시안 '어스름' agora.css 토큰 1:1 (docs/sprint0/01_design_inventory.md 4.1).
 * Material3 기본 색으로 대체하지 않는다. 값을 바꾸려면 승인 필요.
 */
@Immutable
data class AgoraColors(
    val bg: Color, val surface: Color, val raised: Color, val sunken: Color, val sunken2: Color,
    val line: Color, val line2: Color,
    val ink: Color, val ink2: Color, val ink3: Color,
    val primary: Color, val onPrimary: Color, val primarySoft: Color, val primaryInk: Color,
    val me: Color, val onMe: Color,
    val lamp: Color, val onLamp: Color, val lampInk: Color, val lampSoft: Color,
    val danger: Color, val dangerSoft: Color, val ok: Color,
    val scrim: Color, val toastBg: Color,
    val isDark: Boolean,
)

val LightColors = AgoraColors(
    bg = Color(0xFFF5F4F9), surface = Color(0xFFFFFFFF), raised = Color(0xFFFFFFFF),
    sunken = Color(0xFFECEAF3), sunken2 = Color(0xFFE3E0EC),
    line = Color(0xFFE2DFEB), line2 = Color(0xFFCDC9DA),
    ink = Color(0xFF1C1930), ink2 = Color(0xFF474360), ink3 = Color(0xFF625E7A),
    primary = Color(0xFF4636CC), onPrimary = Color(0xFFFFFFFF), primarySoft = Color(0xFFE8E5FD), primaryInk = Color(0xFF3A2BB0),
    me = Color(0xFF4636CC), onMe = Color(0xFFFFFFFF),
    lamp = Color(0xFFF2B544), onLamp = Color(0xFF2B1D00), lampInk = Color(0xFF835300), lampSoft = Color(0xFFFCF0D6),
    danger = Color(0xFFB3261E), dangerSoft = Color(0xFFFBE9E7), ok = Color(0xFF2E7D4F),
    scrim = Color(0x70181430), // rgba(24,20,48,.44)
    toastBg = Color(0xFF1C1930), // = ink
    isDark = false,
)

val DarkColors = AgoraColors(
    bg = Color(0xFF131315), surface = Color(0xFF1C1C1F), raised = Color(0xFF222225),
    sunken = Color(0xFF27272B), sunken2 = Color(0xFF34343A),
    line = Color(0xFF2A2A2E), line2 = Color(0xFF3D3D44),
    ink = Color(0xFFECECEF), ink2 = Color(0xFFBDBDC4), ink3 = Color(0xFFA0A0A8),
    primary = Color(0xFFE2E2E6), onPrimary = Color(0xFF141416), primarySoft = Color(0xFF2F2F35), primaryInk = Color(0xFFF2F2F5),
    me = Color(0xFF3A3A40), onMe = Color(0xFFF2F2F5),
    lamp = Color(0xFFF5C25C), onLamp = Color(0xFF2B1D00), lampInk = Color(0xFFF5C25C), lampSoft = Color(0xFF3A2F17),
    danger = Color(0xFFFFB4AB), dangerSoft = Color(0xFF3D1F1C), ok = Color(0xFF8FD3A7),
    scrim = Color(0x99000000), // rgba(0,0,0,.6)
    toastBg = Color(0xFF2E2E34),
    isDark = true,
)

enum class ThemeMode { SYSTEM, LIGHT, DARK }

val LocalAgoraColors = staticCompositionLocalOf { LightColors }

@Composable
fun AgoraTheme(mode: ThemeMode = ThemeMode.SYSTEM, content: @Composable () -> Unit) {
    val dark = when (mode) {
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
    }
    CompositionLocalProvider(LocalAgoraColors provides if (dark) DarkColors else LightColors, content = content)
}

object Agora {
    val colors: AgoraColors @Composable get() = LocalAgoraColors.current
}

/** 팩의 '#RRGGBB'를 색으로. 형식은 Registry 로더가 이미 검증했다. */
fun hexColor(hex: String): Color = Color(0xFF000000 or hex.removePrefix("#").toLong(16))
