package com.mahoney.ironlog.data

enum class Equipment { DUMBBELL, BARBELL }

data class Exercise(
    val name: String,
    val sets: Int,
    val repRange: String
)

data class WorkoutDay(
    val letter: String,
    val dayOfWeek: String,
    val title: String,
    val exercises: List<Exercise>
)

data class WorkoutProgram(
    val name: String,
    val schedule: String,
    val workouts: List<WorkoutDay>
)

data class WorkoutLogEntry(
    val date: String,
    val workoutLetter: String,
    val workoutTitle: String,
    val equipment: Equipment,
    val notes: String = ""
)

val dumbbellProgram = WorkoutProgram(
    name = "3-Day Full Body Hypertrophy",
    schedule = "Mon / Wed / Fri",
    workouts = listOf(
        WorkoutDay(
            letter = "A",
            dayOfWeek = "MONDAY",
            title = "Push + Hinge",
            exercises = listOf(
                Exercise("Dumbbell Romanian Deadlift", 4, "10–12"),
                Exercise("Incline Dumbbell Press", 4, "8–10"),
                Exercise("Dumbbell Sumo Squat", 3, "12–15"),
                Exercise("Dumbbell Lateral Raise", 4, "15–20"),
                Exercise("Incline Dumbbell Curl", 3, "10–12"),
                Exercise("Overhead Tricep Extension", 3, "12–15"),
                Exercise("Dumbbell Face Pull", 3, "15–20")
            )
        ),
        WorkoutDay(
            letter = "B",
            dayOfWeek = "WEDNESDAY",
            title = "Pull + Squat",
            exercises = listOf(
                Exercise("Goblet Squat", 4, "10–12"),
                Exercise("Dumbbell Bent Over Row", 4, "8–10"),
                Exercise("Bulgarian Split Squat", 3, "10–12"),
                Exercise("Dumbbell Hammer Curl", 3, "10–12"),
                Exercise("Dumbbell Reverse Fly", 3, "15–20"),
                Exercise("Dumbbell Shrug", 3, "15–20"),
                Exercise("Dumbbell Calf Raise", 4, "15–20")
            )
        ),
        WorkoutDay(
            letter = "C",
            dayOfWeek = "FRIDAY",
            title = "Full Body Power",
            exercises = listOf(
                Exercise("Dumbbell Deadlift", 4, "6–8"),
                Exercise("Dumbbell Floor Press", 4, "6–8"),
                Exercise("Dumbbell Goblet Squat", 4, "8–10"),
                Exercise("Dumbbell Bent Row", 4, "8–10"),
                Exercise("Dumbbell Shoulder Press", 3, "8–10"),
                Exercise("Dumbbell Lunge", 3, "10–12"),
                Exercise("Farmer's Carry", 3, "30 sec")
            )
        )
    )
)

val barbellProgram = WorkoutProgram(
    name = "3-Day Full Body Hypertrophy",
    schedule = "Mon / Wed / Fri",
    workouts = listOf(
        WorkoutDay(
            letter = "A",
            dayOfWeek = "MONDAY",
            title = "Push + Hinge",
            exercises = listOf(
                Exercise("Barbell Romanian Deadlift", 4, "10–12"),
                Exercise("Barbell Bench Press", 4, "8–10"),
                Exercise("Barbell Front Squat", 3, "12–15"),
                Exercise("Dumbbell Lateral Raise", 4, "15–20"),
                Exercise("Barbell Curl", 3, "10–12"),
                Exercise("Barbell Skull Crusher", 3, "12–15"),
                Exercise("Face Pull", 3, "15–20")
            )
        ),
        WorkoutDay(
            letter = "B",
            dayOfWeek = "WEDNESDAY",
            title = "Pull + Squat",
            exercises = listOf(
                Exercise("Barbell Back Squat", 4, "10–12"),
                Exercise("Barbell Bent Over Row", 4, "8–10"),
                Exercise("Romanian Deadlift", 3, "10–12"),
                Exercise("Barbell Curl", 3, "10–12"),
                Exercise("Dumbbell Reverse Fly", 3, "15–20"),
                Exercise("Barbell Shrug", 3, "15–20"),
                Exercise("Calf Raise", 4, "15–20")
            )
        ),
        WorkoutDay(
            letter = "C",
            dayOfWeek = "FRIDAY",
            title = "Full Body Power",
            exercises = listOf(
                Exercise("Barbell Deadlift", 4, "5–6"),
                Exercise("Barbell Bench Press", 4, "5–6"),
                Exercise("Barbell Back Squat", 4, "6–8"),
                Exercise("Barbell Row", 4, "6–8"),
                Exercise("Barbell Overhead Press", 3, "6–8"),
                Exercise("Barbell Lunge", 3, "8–10"),
                Exercise("Farmer's Carry", 3, "30 sec")
            )
        )
    )
)

val sampleHistory = listOf(
    WorkoutLogEntry("Jun 18", "A", "Push + Hinge", Equipment.DUMBBELL),
    WorkoutLogEntry("Jun 16", "C", "Full Body Power", Equipment.DUMBBELL),
    WorkoutLogEntry("Jun 13", "B", "Pull + Squat", Equipment.DUMBBELL),
    WorkoutLogEntry("Jun 11", "A", "Push + Hinge", Equipment.DUMBBELL),
    WorkoutLogEntry("Jun 9", "C", "Full Body Power", Equipment.BARBELL),
    WorkoutLogEntry("Jun 6", "B", "Pull + Squat", Equipment.BARBELL)
)
