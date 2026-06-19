package com.mahoney.ironlog.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val IronLogColorScheme = darkColorScheme(
    primary          = IronLogYellow,
    onPrimary        = Color(0xFF1C1900),
    secondary        = IronLogCyan,
    onSecondary      = Color(0xFF00332A),
    background       = AppBackground,
    onBackground     = TextPrimary,
    surface          = CardSurface,
    onSurface        = TextPrimary,
    surfaceVariant   = ButtonActive,
    onSurfaceVariant = TextSecondary,
    outline          = Divider
)

@Composable
fun IronLogTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = IronLogColorScheme,
        typography  = Typography,
        content     = content
    )
}
