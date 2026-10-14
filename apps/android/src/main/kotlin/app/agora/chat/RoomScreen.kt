package app.agora.chat

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.text.InlineTextContent
import androidx.compose.foundation.text.appendInlineContent
import androidx.compose.ui.text.Placeholder
import androidx.compose.ui.text.PlaceholderVerticalAlign
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.unit.em
import androidx.compose.foundation.clickable
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.agora.R
import app.agora.philosophers.PhilosopherRegistry
import app.agora.ui.theme.Agora
import app.agora.ui.theme.AgoraType
import app.agora.ui.theme.hexColor

/** 시안 STR의 {n} 자리표시 채우기 — 시안 fill()과 같은 규칙 */
fun fill(s: String, vararg pairs: Pair<String, String>): String =
    Regex("\\{(\\w+)\\}").replace(s) { m -> pairs.firstOrNull { it.first == m.groupValues[1] }?.second ?: "" }

/**
 * Sprint 0 시제품 화면: 시안 Plaza 보드의 대화방 문법(ag-top, ag-notice, ag-row/ag-bub, ag-typing, ag-comp)만 이식.
 * 수치는 agora.css 원본값. 차이는 docs/sprint0 비교표에 기록한다.
 */
@Composable
fun RoomScreen(vm: RoomViewModel, locale: String) {
    val c = Agora.colors
    val st by vm.state.collectAsStateWithLifecycle()
    val list = rememberLazyListState()
    // 마지막 항목(쓰는 중 점 / 써지는 말풍선 포함)을 따라간다. 0번은 안내문.
    val lastIndex = st.messages.size + (if (st.streaming != null) 1 else 0) + (if (st.typing != null) 1 else 0)
    LaunchedEffect(lastIndex, st.streaming?.text?.length) { if (lastIndex > 0) list.animateScrollToItem(lastIndex) }

    Column(Modifier.fillMaxSize().background(c.bg).safeDrawingPadding().imePadding()) {
        // ag-top: 64dp, 제목 20/28/800
        Row(Modifier.fillMaxWidth().height(64.dp).padding(horizontal = 18.dp), verticalAlignment = Alignment.CenterVertically) {
            BasicText(stringResource(R.string.app_sprint0_room), style = AgoraType.topTitle.copy(color = c.ink), modifier = Modifier.weight(1f))
            Row { st.members.forEachIndexed { i, id -> Avatar(vm.registry, id, locale, 24, Modifier.offset(x = (-8 * i).dp)) } }
        }
        if (vm.devBridge) {
            // 개발 모드 표시 — 기기 안 AI로 오인하지 않게 (지시서 9.3)
            BasicText(stringResource(R.string.app_dev_bridge), style = AgoraType.sysline.copy(color = c.lampInk),
                modifier = Modifier.fillMaxWidth().background(c.lampSoft).padding(horizontal = 16.dp, vertical = 6.dp))
        }
        LazyColumn(Modifier.weight(1f).fillMaxWidth(), state = list, contentPadding = androidx.compose.foundation.layout.PaddingValues(8.dp, 8.dp, 12.dp, 12.dp)) {
            item {
                // ag-notice: 방패 안내, sunken, r16, 12.5/18
                BasicText(stringResource(R.string.d_noticeG), style = AgoraType.notice.copy(color = c.ink2),
                    modifier = Modifier.fillMaxWidth().padding(8.dp).clip(RoundedCornerShape(16.dp)).background(c.sunken).padding(12.dp))
            }
            itemsIndexed(st.messages, key = { _, m -> m.id }) { i, m ->
                val prevAuthor = st.messages.getOrNull(i - 1)?.let(::authorKey)
                val first = prevAuthor != authorKey(m)
                Box(Modifier.padding(top = if (first) 12.dp else 2.dp)) {
                    when (m) {
                        is UiMessage.User -> MeRow(m.text, first)
                        is UiMessage.Philosopher -> PhilosopherRow(vm.registry, m, locale, first)
                        is UiMessage.System -> SysLine(m, vm.registry, locale)
                    }
                }
            }
            st.streaming?.let { sm ->
                val prev = st.messages.lastOrNull()?.let(::authorKey)
                item(key = "streaming") {
                    Box(Modifier.padding(top = if (prev != sm.speakerId) 12.dp else 2.dp)) {
                        PhilosopherRow(vm.registry, UiMessage.Philosopher("streaming", sm.speakerId, sm.text, null), locale, first = prev != sm.speakerId, streaming = true)
                    }
                }
            }
            st.typing?.let { id -> item { Typing(vm.registry, id, locale) } }
        }
        Composer(onSend = { vm.send(it, locale) })
    }
}

private fun authorKey(m: UiMessage): String = when (m) {
    is UiMessage.User -> "me"
    is UiMessage.Philosopher -> m.speakerId
    is UiMessage.System -> "sys"
}

@Composable
private fun Avatar(registry: PhilosopherRegistry, id: String, locale: String, sizeDp: Int, modifier: Modifier = Modifier) {
    val c = Agora.colors
    val p = registry.get(id)
    val hue = p?.let { hexColor(if (c.isDark) it.display.colors.dark.hue else it.display.colors.light.hue) } ?: c.ink3
    // ag-ring: 2px 배경 간격 + 2px 철학자색. 초상 사용권 확인 전이라 이니셜 원으로 대체(승인 대기)
    Box(
        modifier.size(sizeDp.dp).border(2.dp, hue, CircleShape).padding(2.dp).clip(CircleShape).background(c.sunken2)
            .semantics { contentDescription = p?.display?.name?.get(locale) ?: id },
        contentAlignment = Alignment.Center,
    ) {
        BasicText(p?.display?.name?.get(locale)?.take(1) ?: "?", style = AgoraType.who.copy(color = c.ink2, fontSize = (sizeDp * 0.42).sp))
    }
}

@Composable
private fun PhilosopherRow(registry: PhilosopherRegistry, m: UiMessage.Philosopher, locale: String, first: Boolean, streaming: Boolean = false) {
    val c = Agora.colors
    val p = registry.get(m.speakerId)
    val hue = p?.let { hexColor(if (c.isDark) it.display.colors.dark.hue else it.display.colors.light.hue) } ?: c.ink
    Row(Modifier.fillMaxWidth()) {
        // ag-avcol 36dp
        Box(Modifier.width(36.dp)) { if (first) Avatar(registry, m.speakerId, locale, 32) }
        Spacer(Modifier.width(8.dp))
        Column(Modifier.widthIn(max = 300.dp)) {
            if (first) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    BasicText(p?.display?.name?.get(locale) ?: m.speakerId, style = AgoraType.who.copy(color = hue))
                    Tag("AI")
                    m.respondTo?.let { to ->
                        BasicText("→ " + (registry.get(to)?.display?.name?.get(locale) ?: to), style = AgoraType.meta.copy(color = c.ink3, fontWeight = FontWeight.SemiBold, fontSize = 12.sp))
                    }
                }
                Spacer(Modifier.height(4.dp))
            }
            // ag-bub: raised, 1px line(다크는 테두리 없음), r20, 첫 말풍선 왼쪽 위 6
            // ag-bub.streaming: 테두리 대신 등불색 1.5px(낮·밤 모두) + 끝에 깜빡이는 커서(ag-caret)
            val shape = RoundedCornerShape(topStart = if (first) 6.dp else 20.dp, topEnd = 20.dp, bottomEnd = 20.dp, bottomStart = 20.dp)
            val outline = when {
                streaming -> Modifier.border(1.5.dp, c.lamp, shape)
                c.isDark -> Modifier
                else -> Modifier.border(1.dp, c.line, shape)
            }
            val bubble = Modifier.clip(shape).background(c.raised).then(outline).padding(horizontal = 14.dp, vertical = 10.dp)
            if (streaming) StreamingText(m.text, bubble) else BasicText(m.text, style = AgoraType.bubble.copy(color = c.ink), modifier = bubble)
        }
    }
}

/**
 * 써지는 중인 말 + 끝의 커서. 시안 ag-caret: 너비 2px·높이 1.05em·등불색, 왼쪽 여백 2px,
 * `agBlink 1s steps(2)` — 0.5초마다 불투명도 1 ↔ 0.5.
 */
@Composable
private fun StreamingText(text: String, modifier: Modifier) {
    val c = Agora.colors
    val t = rememberInfiniteTransition(label = "caret")
    val phase by t.animateFloat(0f, 1f, infiniteRepeatable(tween(1000, easing = LinearEasing), RepeatMode.Restart), label = "caretPhase")
    val caret = mapOf(
        "caret" to InlineTextContent(Placeholder(width = 4.sp, height = 1.05.em, placeholderVerticalAlign = PlaceholderVerticalAlign.TextCenter)) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.CenterEnd) {
                Box(Modifier.width(2.dp).fillMaxHeight().alpha(if (phase < 0.5f) 1f else 0.5f).background(c.lamp))
            }
        },
    )
    BasicText(
        buildAnnotatedString { append(text); appendInlineContent("caret", "▍") },
        style = AgoraType.bubble.copy(color = c.ink),
        inlineContent = caret,
        modifier = modifier,
    )
}

@Composable
private fun MeRow(text: String, first: Boolean) {
    val c = Agora.colors
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
        val shape = RoundedCornerShape(topStart = 20.dp, topEnd = if (first) 6.dp else 20.dp, bottomEnd = 20.dp, bottomStart = 20.dp)
        BasicText(text, style = AgoraType.bubble.copy(color = c.onMe),
            modifier = Modifier.widthIn(max = 296.dp).clip(shape).background(c.me).padding(horizontal = 14.dp, vertical = 10.dp))
    }
}

@Composable
private fun Tag(text: String) {
    val c = Agora.colors
    // ag-tag: 18h, r6, 10.5/700
    Box(Modifier.height(18.dp).clip(RoundedCornerShape(6.dp)).background(c.sunken).padding(horizontal = 6.dp), contentAlignment = Alignment.Center) {
        BasicText(text, style = AgoraType.tag.copy(color = c.ink3))
    }
}

@Composable
private fun SysLine(m: UiMessage.System, registry: PhilosopherRegistry, locale: String) {
    val c = Agora.colors
    val name = m.speakerId?.let { registry.get(it)?.display?.name?.get(locale) } ?: ""
    val text = when (m.kind) {
        SystemKind.MODEL_MISSING -> stringResource(R.string.app_model_missing)
        SystemKind.GENERATION_FAILED -> fill(stringResource(R.string.app_generation_failed), "n" to name)
        SystemKind.INTERRUPTED -> stringResource(R.string.d_interrupted)
    }
    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
        BasicText(text, style = AgoraType.sysline.copy(color = c.ink3), modifier = Modifier.padding(vertical = 6.dp, horizontal = 24.dp))
    }
}

@Composable
private fun Typing(registry: PhilosopherRegistry, id: String, locale: String) {
    val c = Agora.colors
    val name = registry.get(id)?.display?.name?.get(locale) ?: id
    val t = rememberInfiniteTransition(label = "dots")
    Row(Modifier.padding(top = 12.dp, start = 44.dp).height(40.dp).clip(RoundedCornerShape(20.dp)).background(c.raised).padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
            // ag-dots: 6px 등불색 점, 1.2s, 0/.15/.3s 지연
            listOf(0, 150, 300).forEach { delay ->
                val a by t.animateFloat(0.45f, 1f, infiniteRepeatable(tween(600, delayMillis = delay), RepeatMode.Reverse), label = "dot$delay")
                Box(Modifier.size(6.dp).alpha(a).clip(CircleShape).background(c.lamp))
            }
        }
        BasicText(fill(stringResource(R.string.d_typing), "n" to name), style = AgoraType.typing.copy(color = c.ink2))
    }
}

@Composable
private fun Composer(onSend: (String) -> Unit) {
    val c = Agora.colors
    var draft by remember { mutableStateOf("") }
    val placeholder = stringResource(R.string.d_phGroup)
    val sendLabel = stringResource(R.string.d_send)
    Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        // ag-in: 48h pill, sunken
        Box(Modifier.weight(1f).height(48.dp).clip(RoundedCornerShape(999.dp)).background(c.sunken).padding(horizontal = 18.dp), contentAlignment = Alignment.CenterStart) {
            if (draft.isEmpty()) BasicText(placeholder, style = AgoraType.input.copy(color = c.ink3))
            BasicTextField(draft, { draft = it }, textStyle = AgoraType.input.copy(color = c.ink), cursorBrush = SolidColor(c.primary), singleLine = false, maxLines = 4)
        }
        Spacer(Modifier.width(8.dp))
        // ag-send: 48 원, primary / 비었으면 sunken-2
        val enabled = draft.isNotBlank()
        Box(Modifier.size(48.dp).clip(CircleShape).background(if (enabled) c.primary else c.sunken2)
            .clickable(enabled = enabled) { onSend(draft); draft = "" }
            .semantics { contentDescription = sendLabel },
            contentAlignment = Alignment.Center) {
            BasicText("↑", style = AgoraType.topTitle.copy(color = if (enabled) c.onPrimary else c.ink3))
        }
    }
}

@Suppress("unused") private val keepColor = Color.Unspecified
