package com.mahoney.ironlog.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mahoney.ironlog.data.Equipment
import com.mahoney.ironlog.ui.theme.*

@Composable
fun IronLogApp() {
    var selectedTab by remember { mutableStateOf(0) }
    var selectedEquipment by remember { mutableStateOf(Equipment.DUMBBELL) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground)
            .systemBarsPadding()
    ) {
        TopBar(selectedTab = selectedTab, onTabSelected = { selectedTab = it })

        when (selectedTab) {
            0 -> ProgramScreen(
                selectedEquipment = selectedEquipment,
                onEquipmentChange = { selectedEquipment = it }
            )
            1 -> HistoryScreen()
        }
    }
}

@Composable
private fun TopBar(selectedTab: Int, onTabSelected: (Int) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "IRON LOG",
            color = IronLogYellow,
            fontSize = 19.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = 2.sp
        )

        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("Program", "History").forEachIndexed { index, label ->
                val active = selectedTab == index
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (active) IronLogYellow else Color.Transparent)
                        .clickable { onTabSelected(index) }
                        .padding(horizontal = 14.dp, vertical = 7.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        color = if (active) Color(0xFF1A1600) else TextSecondary,
                        fontSize = 14.sp,
                        fontWeight = if (active) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }
    }
}
