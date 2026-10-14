package app.agora.ui.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineBreak
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp

/**
 * 시안 크기표(01_design_inventory.md 4.2).
 * TODO(승인 대기): Gothic A1 / Gowun Batang 글꼴 파일 번들 — 지금은 기기 기본 글꼴(차이 있음).
 */
object AgoraFonts {
    val sans: FontFamily = FontFamily.Default
    val serif: FontFamily = FontFamily.Serif
}

// 한글 어절 단위 줄바꿈(word-break: keep-all) 대응
private val ko = TextStyle(fontFamily = AgoraFonts.sans, lineBreak = LineBreak.Paragraph)

object AgoraType {
    val topTitle = ko.copy(fontSize = 20.sp, lineHeight = 28.sp, fontWeight = FontWeight.ExtraBold)
    val bubble = ko.copy(fontSize = 15.sp, lineHeight = 23.sp)
    val who = ko.copy(fontSize = 13.sp, lineHeight = 18.sp, fontWeight = FontWeight.Bold)
    val tag = ko.copy(fontSize = 10.5.sp, lineHeight = 10.5.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.02.em)
    val meta = ko.copy(fontSize = 11.sp, lineHeight = 14.sp)
    val typing = ko.copy(fontSize = 13.sp, lineHeight = 18.sp, fontWeight = FontWeight.SemiBold)
    val sysline = ko.copy(fontSize = 12.sp, lineHeight = 17.sp, fontWeight = FontWeight.SemiBold)
    val notice = ko.copy(fontSize = 12.5.sp, lineHeight = 18.sp)
    val input = ko.copy(fontSize = 15.sp, lineHeight = 21.sp)
    val wordmark = ko.copy(fontSize = 21.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.22.em)
}
