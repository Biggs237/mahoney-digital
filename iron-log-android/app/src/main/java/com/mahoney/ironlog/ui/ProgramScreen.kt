package com.mahoney.ironlog.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mahoney.ironlog.data.*
import com.mahoney.ironlog.ui.theme.*

@Composable
fun ProgramScreen(
    selectedEquipment: Equipment,
    onEquipmentChange: (Equipment) -> Unit
) {
    val program = if (selectedEquipment == Equipment.DUMBBELL) dumbbellProgram else barbellProgram

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item { EquipmentToggle(selected = selectedEquipment, onSelect = onEquipmentChange) }
        item { ProgramBanner(program = program) }
        items(program.workouts) { workout ->
            WorkoutCard(workout = workout)
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun EquipmentToggle(selected: Equipment, onSelect: (Equipment) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        listOf(Equipment.DUMBBELL to "←→  DB", Equipment.BARBELL to "←→  Barbell").forEach { (eq, label) ->
            val active = selected == eq
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (active) ButtonActive else Color.Transparent)
                    .border(
                        width = 1.dp,
                        color = if (active) Divider else Divider,
                        shape = RoundedCornerShape(8.dp)
                    )
                    .clickable { onSelect(eq) }
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = label,
                    color = if (active) TextPrimary else TextSecondary,
                    fontSize = 13.sp,
                    fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal
                )
            }
        }
    }
}

@Composable
private fun ProgramBanner(program: WorkoutProgram) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 16.dp)
    ) {
        Text(
            text = "${program.name}  ·  ${program.schedule}",
            color = TextSecondary,
            fontSize = 13.sp
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "Lift Day 💪",
            color = TextPrimary,
            fontSize = 32.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Workout C  ·  Full Body Power",
            color = IronLogYellow,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun WorkoutCard(workout: WorkoutDay) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(CardSurface)
            .padding(vertical = 16.dp)
    ) {
        // Card header
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            Text(
                text = workout.dayOfWeek,
                color = IronLogCyan,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Workout ${workout.letter} — ${workout.title}",
                color = TextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${workout.exercises.size} exercises",
                color = TextSecondary,
                fontSize = 13.sp
            )
        }

        Spacer(modifier = Modifier.height(14.dp))
        HorizontalDivider(color = Divider, thickness = 1.dp)
        Spacer(modifier = Modifier.height(4.dp))

        // Exercise rows
        workout.exercises.forEachIndexed { index, exercise ->
            ExerciseRow(number = index + 1, exercise = exercise)
            if (index < workout.exercises.lastIndex) {
                HorizontalDivider(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    color = Divider.copy(alpha = 0.5f),
                    thickness = 0.5.dp
                )
            }
        }
    }
}

@Composable
private fun ExerciseRow(number: Int, exercise: Exercise) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$number",
            color = IronLogYellow,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.width(22.dp),
            textAlign = TextAlign.Start
        )
        Text(
            text = exercise.name,
            color = TextPrimary,
            fontSize = 15.sp,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = "${exercise.sets}×${exercise.repRange}",
            color = TextSecondary,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )
    }
}
