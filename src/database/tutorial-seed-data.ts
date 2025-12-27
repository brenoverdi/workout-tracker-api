// Comprehensive tutorial seed data
// This file contains all tutorial data to be seeded

import { TutorialType, TutorialDifficulty } from '../modules/tutorial/model';
import { MuscleGroup } from '../modules/exercise/model';

export interface TutorialSeedData {
  title: string;
  summary: string;
  content: string;
  type: TutorialType;
  difficulty: TutorialDifficulty;
  tags: string[];
  priority: number;
  exerciseNames: string[];
  muscleGroups: MuscleGroup[];
  media: Array<{
    provider: string;
    url: string;
    thumbnailUrl: string;
    duration: number;
    isPrimary: boolean;
    transcript?: string;
  }>;
}

// Helper function to generate video URL (placeholder - replace with real IDs)
const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const thumbnailUrl = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

const exerciseVideoMap: Record<string, string> = {
  'Dumbbell Pull-over': 'tpLnfSQJ0gg',
  'Pec Deck Machine': 'g3T7LsEeDWQ',
  'Chest Press Machine': 'n8TOta_pfr4',
  'Floor Press': '6G-fNatzuSk',
  'Decline Bench Press': '16yItsCGnsw',
  'Weighted Push-up': 'Vq1O0aDZODI',
  'Hammer Strength Press': 'ig0NyNlSce4',
  'T-Bar Row': 'KDEl3AmZbVE',
  'Single Arm Dumbbell Row': 'tLnlWj7LQ34',
  'Straight Arm Pulldown': 'wcVDItawocI',
  'Neutral Grip Pull-up': 'tSRo8ksP27I',
  'Chin-up': 'qAk3fN0OP2A',
  'Renegade Row': '_I98ircIcpE',
  'Good Mornings': 'vKPGe8zb2S4',
  'Hyper-extension': 'k6LyPhGRV-o',
  'Arnold Press': '6Z15_WdXmVw',
  'Front Raise': 'gzDawZwDC6Y',
  'Barbell Shrug': 'X26Ji1j9LWA',
  'Reverse Fly': 'G3DXKpk5AJA',
  'Upright Row': 'amCU-ziHITM',
  'Cable Lateral Raise': 'wGsKrK0bhps',
  'Push Press': 'ep30avTSMB0',
  'Leg Extension': 'tTbJBUKnWU8',
  'Leg Curl': 'SbSNUXPRkc8',
  'Walking Lunge': 'L8fvypPrzzs',
  'Calf Raise': 'zHhGnhOVjh8',
  'Goblet Squat': 'mF5tnEBrdkc',
  'Hack Squat': '-lAnEGH2blE',
  'Step-ups': 'l4AA5d5mInQ',
  'Glute Bridge': 'wPM8icPu6H8',
  'Sumo Deadlift': 'wQHSYDSgDn8',
  'Hammer Curl': '8XLxfXROrTo',
  'Preacher Curl': '1-xvtHS9PsU',
  'Concentration Curl': 'nMIGb5-ytRE',
  'Skullcrusher': '8t2a93BjDec',
  'Overhead Tricep Extension': 'b_r_LW4HEcM',
  'Zottman Curl': 'ZrpRBgswtHs',
  'Spider Curl': 'nvufDW-MSQk',
  'Diamond Push-up': 'J0DnG1_S92I',
  'Bench Dips': 'j_WpuVY3wbo',
  'Russian Twist': 'wkD8rjkodUI',
  'Ab Rollout': 'j6lR4u193gE',
  'Mountain Climbers': 'cnyTQDSE884',
  'Crunches': 'cQ5JKgEZCU4',
  'Side Plank': 'iNbH7_edNI8',
  'Bicycle Crunches': 'eqg47ZuGZXQ',
  'Burpee': 'Qdj4TraBDHA',
  'Box Jump': 'cLSB_Zn0awM',
  'Kettlebell Swing': '1cVT3ee9mgU',
  'Thrusters': 'z0PGxb8BSq8',
  'Sprint': '6m_fjNhRhkY',
  'Rowing Machine': 'ZN0J6qKCIrI',
  'Battle Ropes': 'pQb2xIGioyQ',
  'Farmers Walk': 'VBobkldqqvk',
  'Wall Balls': 'ryJoFCMNIr8',
  'Sled Push': 'QaTrePoCT4g',
  'Jump Rope': 'kDOGb9C5kp0',
  'Assault Bike': 'H7LglMSGCzo',
  'Clean and Press': 'a7FRXANpNEU',
  'Snatch': 'yHZ1eZ8fJjc',
};

export const generateTutorialsForExercises = (
  exerciseNames: string[],
): TutorialSeedData[] => {
  return exerciseNames.map((exerciseName) => {
    const exerciseNameLower = exerciseName.toLowerCase();
    
    // Look up video ID from map, or use a default if not found (fallback to Bench Press to ensure valid link)
    // The previous alphanumeric generation caused 404s
    const videoId = exerciseVideoMap[exerciseName] || 'SCVCLChPQFY';

    return {
      title: `${exerciseName} - Proper Form Guide`,
      summary: `Learn the correct form and technique for ${exerciseName} to maximize results and prevent injury.`,
      content: `Mastering ${exerciseName} requires attention to detail. Key points: 1) Proper setup and positioning, 2) Controlled movement throughout the range of motion, 3) Maintain proper breathing, 4) Focus on muscle-mind connection, 5) Progress gradually with proper form.`,
      type: TutorialType.FORM,
      difficulty: TutorialDifficulty.INTERMEDIATE,
      tags: [exerciseNameLower, 'form', 'technique', 'safety'],
      priority: 7,
      exerciseNames: [exerciseName],
      muscleGroups: [],
      media: [
        {
          provider: 'youtube',
          url: videoUrl(videoId),
          thumbnailUrl: thumbnailUrl(videoId),
          duration: 300 + Math.floor(Math.random() * 200),
          isPrimary: true,
        },
      ],
    };
  });
};

export const allTutorialsData: TutorialSeedData[] = [
  // ========== FORM TUTORIALS FOR ALL EXERCISES ==========
  // These will be generated programmatically, but here are key ones with detailed content

  // CHEST EXERCISES
  {
    title: 'Bench Press - Complete Form Guide',
    summary:
      'Master the bench press with proper form, breathing, and safety techniques.',
    content:
      'The bench press is one of the most effective upper body exercises. Key points: 1) Retract your shoulder blades, 2) Keep your feet flat on the floor, 3) Lower the bar with control to your chest, 4) Drive up explosively while maintaining tension, 5) Use a spotter for heavy weights.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['bench press', 'form', 'technique', 'chest', 'safety'],
    priority: 10,
    exerciseNames: ['Bench Press'],
    muscleGroups: [MuscleGroup.CHEST],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('SCVCLChPQFY'),
        thumbnailUrl: thumbnailUrl('SCVCLChPQFY'),
        duration: 420,
        isPrimary: true,
        transcript:
          "Welcome to the complete bench press form guide. Today we'll cover proper setup, execution, and common mistakes...",
      },
    ],
  },
  {
    title: 'Incline Dumbbell Press - Upper Chest Focus',
    summary:
      'Learn how to target your upper chest with proper incline dumbbell press form.',
    content:
      'Incline dumbbell press targets the upper chest: 1) Set bench to 30-45 degree angle, 2) Keep dumbbells at shoulder level, 3) Press up and slightly forward, 4) Control the negative, 5) Squeeze at the top.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['incline dumbbell press', 'chest', 'form', 'upper chest'],
    priority: 8,
    exerciseNames: ['Incline Dumbbell Press'],
    muscleGroups: [MuscleGroup.CHEST],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('8iPEnn-ltC8'),
        thumbnailUrl: thumbnailUrl('8iPEnn-ltC8'),
        duration: 350,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Push-up - Perfect Form',
    summary: 'Master the fundamental push-up with proper form and progression.',
    content:
      'Push-ups are a foundational exercise: 1) Hands slightly wider than shoulders, 2) Body in straight line, 3) Lower until chest nearly touches floor, 4) Push up explosively, 5) Keep core engaged throughout.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['push-up', 'bodyweight', 'chest', 'form'],
    priority: 9,
    exerciseNames: ['Push-up'],
    muscleGroups: [MuscleGroup.CHEST],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('IODxDxX7PC0'),
        thumbnailUrl: thumbnailUrl('IODxDxX7PC0'),
        duration: 280,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Cable Fly - Chest Isolation',
    summary: 'Learn proper cable fly form for maximum chest isolation.',
    content:
      'Cable flies isolate the chest: 1) Set cables at shoulder height, 2) Slight forward lean, 3) Bring handles together in wide arc, 4) Squeeze chest at peak contraction, 5) Control the stretch.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['cable fly', 'chest', 'isolation', 'form'],
    priority: 7,
    exerciseNames: ['Cable Fly'],
    muscleGroups: [MuscleGroup.CHEST],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('Iwe6UCKOz7Q'),
        thumbnailUrl: thumbnailUrl('Iwe6UCKOz7Q'),
        duration: 320,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Dips (Chest) - Lower Chest Focus',
    summary: 'Master chest dips to target your lower chest and triceps.',
    content:
      'Chest dips emphasize lower chest: 1) Lean forward slightly, 2) Lower until shoulders are below elbows, 3) Drive up through chest, 4) Keep elbows slightly flared, 5) Control the descent.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['dips', 'chest', 'bodyweight', 'form'],
    priority: 8,
    exerciseNames: ['Dips (Chest)'],
    muscleGroups: [MuscleGroup.CHEST],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('2z8ddPHSg8s'),
        thumbnailUrl: thumbnailUrl('2z8ddPHSg8s'),
        duration: 340,
        isPrimary: true,
      },
    ],
  },

  // BACK EXERCISES
  {
    title: 'Deadlift - Complete Setup and Execution',
    summary:
      'Master the deadlift from setup to lockout with proper hip hinge mechanics.',
    content:
      'The deadlift requires perfect form: 1) Bar over mid-foot, 2) Hinge at hips, not knees, 3) Keep bar close to body, 4) Drive hips forward to lockout, 5) Control the descent.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['deadlift', 'form', 'back', 'technique', 'hip hinge'],
    priority: 10,
    exerciseNames: ['Deadlift'],
    muscleGroups: [
      MuscleGroup.BACK,
      MuscleGroup.HAMSTRINGS,
      MuscleGroup.GLUTES,
    ],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('op9kVnSso6Q'),
        thumbnailUrl: thumbnailUrl('op9kVnSso6Q'),
        duration: 450,
        isPrimary: true,
        transcript:
          "The deadlift is a fundamental movement pattern. Today we'll cover the complete setup and execution...",
      },
    ],
  },
  {
    title: 'Pull-up - Form and Progression',
    summary:
      'Learn proper pull-up form, grip variations, and progression strategies for beginners.',
    content:
      'Pull-ups are essential for back development: 1) Hang with full arm extension, 2) Pull until chin clears bar, 3) Control the descent, 4) Avoid kipping or swinging, 5) Use assistance if needed.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['pull-up', 'form', 'back', 'bodyweight', 'progression'],
    priority: 9,
    exerciseNames: ['Pull-up'],
    muscleGroups: [MuscleGroup.BACK],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('eGo4IYlbE5g'),
        thumbnailUrl: thumbnailUrl('eGo4IYlbE5g'),
        duration: 320,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Lat Pulldown - Back Width Development',
    summary: 'Master the lat pulldown for building a wider back.',
    content:
      'Lat pulldowns build back width: 1) Wide grip on bar, 2) Lean back slightly, 3) Pull to upper chest, 4) Squeeze lats at bottom, 5) Control the negative.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['lat pulldown', 'back', 'lats', 'form'],
    priority: 8,
    exerciseNames: ['Lat Pulldown'],
    muscleGroups: [MuscleGroup.BACK],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('CAwf7n6Luuc'),
        thumbnailUrl: thumbnailUrl('CAwf7n6Luuc'),
        duration: 300,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Bent Over Row - Back Thickness',
    summary: 'Learn proper bent over row form for building a thicker back.',
    content:
      'Bent over rows build back thickness: 1) Hinge at hips, 2) Pull bar to lower chest/upper abs, 3) Keep back straight, 4) Squeeze lats and rhomboids, 5) Control the weight.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['bent over row', 'back', 'row', 'form'],
    priority: 9,
    exerciseNames: ['Bent Over Row'],
    muscleGroups: [MuscleGroup.BACK],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('vT2GjY_UeCs'),
        thumbnailUrl: thumbnailUrl('vT2GjY_UeCs'),
        duration: 380,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Seated Cable Row - Mid-Back Focus',
    summary: 'Master seated cable rows for mid-back development.',
    content:
      'Seated cable rows target mid-back: 1) Sit with legs slightly bent, 2) Pull handle to lower chest, 3) Squeeze shoulder blades together, 4) Control the stretch, 5) Keep torso upright.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['seated cable row', 'back', 'row', 'form'],
    priority: 7,
    exerciseNames: ['Seated Cable Row'],
    muscleGroups: [MuscleGroup.BACK],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('GZbfZ033f74'),
        thumbnailUrl: thumbnailUrl('GZbfZ033f74'),
        duration: 310,
        isPrimary: true,
      },
    ],
  },

  // SHOULDER EXERCISES
  {
    title: 'Overhead Press - Complete Technique',
    summary:
      'Master the standing overhead press with proper core stability and shoulder mechanics.',
    content:
      'The overhead press builds shoulder strength: 1) Bar at upper chest level, 2) Brace core and glutes, 3) Press bar overhead, 4) Keep bar path close to face, 5) Lock out overhead.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['overhead press', 'shoulders', 'form', 'technique'],
    priority: 9,
    exerciseNames: ['Overhead Press'],
    muscleGroups: [MuscleGroup.SHOULDERS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('2yjwXTZQDDI'),
        thumbnailUrl: thumbnailUrl('2yjwXTZQDDI'),
        duration: 360,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Lateral Raise - Side Delt Isolation',
    summary: 'Learn proper lateral raise form for building wider shoulders.',
    content:
      'Lateral raises target side delts: 1) Slight forward lean, 2) Raise arms to shoulder height, 3) Pinky slightly higher than thumb, 4) Control the negative, 5) Avoid swinging.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['lateral raise', 'shoulders', 'delts', 'form'],
    priority: 8,
    exerciseNames: ['Lateral Raise'],
    muscleGroups: [MuscleGroup.SHOULDERS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('kDqklk1pz8g'),
        thumbnailUrl: thumbnailUrl('kDqklk1pz8g'),
        duration: 280,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Face Pull - Rear Delt Health',
    summary:
      'Master face pulls for healthy shoulders and rear delt development.',
    content:
      'Face pulls improve shoulder health: 1) Set cable at face height, 2) Pull rope to face level, 3) External rotation at end, 4) Squeeze rear delts, 5) High reps for health.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['face pull', 'shoulders', 'rear delts', 'health'],
    priority: 9,
    exerciseNames: ['Face Pull'],
    muscleGroups: [MuscleGroup.SHOULDERS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('rep-wV1vtRg'),
        thumbnailUrl: thumbnailUrl('rep-wV1vtRg'),
        duration: 290,
        isPrimary: true,
      },
    ],
  },

  // LEG EXERCISES
  {
    title: 'Barbell Squat - Form Fundamentals',
    summary:
      'Learn proper squat depth, knee tracking, and core engagement for maximum safety and effectiveness.',
    content:
      'The squat is the king of leg exercises. Focus on: 1) Feet shoulder-width apart, 2) Descend until thighs are parallel or below, 3) Keep knees tracking over toes, 4) Maintain neutral spine, 5) Drive through heels to stand.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['squat', 'form', 'legs', 'technique', 'safety'],
    priority: 10,
    exerciseNames: ['Barbell Squat'],
    muscleGroups: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('YaXPRqUwItQ'),
        thumbnailUrl: thumbnailUrl('YaXPRqUwItQ'),
        duration: 380,
        isPrimary: true,
        transcript:
          "Proper squat form is essential for building leg strength safely. Let's break down each component...",
      },
    ],
  },
  {
    title: 'Romanian Deadlift - Hamstring Focus',
    summary: 'Master the RDL for hamstring and glute development.',
    content:
      'RDL targets hamstrings: 1) Start standing, 2) Hinge at hips, 3) Lower bar to mid-shin, 4) Feel stretch in hamstrings, 5) Drive hips forward to stand.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['romanian deadlift', 'hamstrings', 'rdl', 'form'],
    priority: 8,
    exerciseNames: ['Romanian Deadlift'],
    muscleGroups: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('JCXUYuzwNrM'),
        thumbnailUrl: thumbnailUrl('JCXUYuzwNrM'),
        duration: 350,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Hip Thrust - Glute Activation',
    summary: 'Learn proper hip thrust form for maximum glute activation.',
    content:
      'Hip thrusts maximize glutes: 1) Upper back on bench, 2) Drive hips up, 3) Squeeze glutes at top, 4) Lower with control, 5) Keep core engaged.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['hip thrust', 'glutes', 'form', 'activation'],
    priority: 8,
    exerciseNames: ['Hip Thrust'],
    muscleGroups: [MuscleGroup.GLUTES],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('SEDQNdijpkA'),
        thumbnailUrl: thumbnailUrl('SEDQNdijpkA'),
        duration: 330,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Bulgarian Split Squat - Single Leg Strength',
    summary: 'Master the Bulgarian split squat for unilateral leg development.',
    content:
      'Bulgarian split squats build single leg strength: 1) Rear foot elevated, 2) Front leg does the work, 3) Descend until front thigh is parallel, 4) Drive through front heel, 5) Keep torso upright.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.ADVANCED,
    tags: ['bulgarian split squat', 'legs', 'unilateral', 'form'],
    priority: 7,
    exerciseNames: ['Bulgarian Split Squat'],
    muscleGroups: [MuscleGroup.QUADRICEPS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('2C-uNgKwPLE'),
        thumbnailUrl: thumbnailUrl('2C-uNgKwPLE'),
        duration: 360,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Leg Press - Quad Development',
    summary: 'Learn proper leg press form for quadriceps development.',
    content:
      "Leg press targets quads: 1) Feet shoulder-width on platform, 2) Lower until knees at 90 degrees, 3) Drive through heels, 4) Don't lock out knees, 5) Control the weight.",
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['leg press', 'quads', 'legs', 'form'],
    priority: 7,
    exerciseNames: ['Leg Press'],
    muscleGroups: [MuscleGroup.QUADRICEPS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('IZxyjW7MPJQ'),
        thumbnailUrl: thumbnailUrl('IZxyjW7MPJQ'),
        duration: 290,
        isPrimary: true,
      },
    ],
  },

  // ARM EXERCISES
  {
    title: 'Dumbbell Bicep Curl - Perfect Form',
    summary: 'Master the bicep curl for maximum arm development.',
    content:
      'Bicep curls build arm size: 1) Keep elbows at sides, 2) Curl weight to shoulders, 3) Squeeze biceps at top, 4) Control the negative, 5) Avoid swinging.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['bicep curl', 'biceps', 'arms', 'form'],
    priority: 7,
    exerciseNames: ['Dumbbell Bicep Curl'],
    muscleGroups: [MuscleGroup.BICEPS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('ykJmrZ5v0Oo'),
        thumbnailUrl: thumbnailUrl('ykJmrZ5v0Oo'),
        duration: 270,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Tricep Pushdown - Arm Development',
    summary: 'Learn proper tricep pushdown form for bigger arms.',
    content:
      'Tricep pushdowns isolate triceps: 1) Elbows at sides, 2) Push handle down, 3) Extend fully, 4) Squeeze triceps, 5) Control the negative.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['tricep pushdown', 'triceps', 'arms', 'form'],
    priority: 7,
    exerciseNames: ['Tricep Pushdown'],
    muscleGroups: [MuscleGroup.TRICEPS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('2-LAM9824Rk'),
        thumbnailUrl: thumbnailUrl('2-LAM9824Rk'),
        duration: 260,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Close Grip Bench Press - Tricep Focus',
    summary: 'Master close grip bench press for tricep development.',
    content:
      'Close grip bench targets triceps: 1) Hands shoulder-width, 2) Lower to lower chest, 3) Press up explosively, 4) Keep elbows close, 5) Full extension.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['close grip bench', 'triceps', 'chest', 'form'],
    priority: 8,
    exerciseNames: ['Close Grip Bench Press'],
    muscleGroups: [MuscleGroup.TRICEPS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('nEf0ay2jf4'),
        thumbnailUrl: thumbnailUrl('nEf0ay2jf4'),
        duration: 340,
        isPrimary: true,
      },
    ],
  },

  // CORE EXERCISES
  {
    title: 'Plank - Core Stability',
    summary: 'Master the plank for core strength and stability.',
    content:
      "Planks build core stability: 1) Body in straight line, 2) Engage core and glutes, 3) Hold position, 4) Breathe normally, 5) Don't let hips sag.",
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['plank', 'core', 'stability', 'form'],
    priority: 8,
    exerciseNames: ['Plank'],
    muscleGroups: [MuscleGroup.ABS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('ASdvN_XEl_c'),
        thumbnailUrl: thumbnailUrl('ASdvN_XEl_c'),
        duration: 250,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Hanging Leg Raise - Lower Abs',
    summary: 'Learn proper hanging leg raise form for lower ab development.',
    content:
      'Hanging leg raises target lower abs: 1) Hang from bar, 2) Raise legs to 90 degrees, 3) Control the negative, 4) Avoid swinging, 5) Engage core throughout.',
    type: TutorialType.FORM,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['hanging leg raise', 'abs', 'core', 'form'],
    priority: 7,
    exerciseNames: ['Hanging Leg Raise'],
    muscleGroups: [MuscleGroup.ABS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('hdng3DmxgLU'),
        thumbnailUrl: thumbnailUrl('hdng3DmxgLU'),
        duration: 300,
        isPrimary: true,
      },
    ],
  },

  // ========== HEALTH TIPS (using INJURY_PREVENTION type) ==========
  {
    title: '10 Essential Health Tips for Lifters',
    summary:
      'Comprehensive health tips to keep you training strong and injury-free.',
    content:
      'Health tips for lifters: 1) Get 7-9 hours of sleep, 2) Stay hydrated (0.5-1oz per pound bodyweight), 3) Manage stress levels, 4) Regular health checkups, 5) Listen to your body, 6) Balance training with rest, 7) Maintain good posture, 8) Warm up properly, 9) Cool down after workouts, 10) Track your progress.',
    type: TutorialType.INJURY_PREVENTION,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['health', 'tips', 'wellness', 'lifestyle'],
    priority: 9,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('7FwGjR3rC6w'),
        thumbnailUrl: thumbnailUrl('7FwGjR3rC6w'),
        duration: 600,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Sleep Quality for Muscle Recovery',
    summary: 'Learn how sleep affects your training and recovery.',
    content:
      'Sleep is crucial for recovery: 1) Aim for 7-9 hours nightly, 2) Maintain consistent sleep schedule, 3) Create dark, cool sleep environment, 4) Avoid screens before bed, 5) Sleep affects growth hormone and testosterone production.',
    type: TutorialType.INJURY_PREVENTION,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['sleep', 'health', 'recovery', 'wellness'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('3Mrb8hX00Sg'),
        thumbnailUrl: thumbnailUrl('3Mrb8hX00Sg'),
        duration: 480,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Hydration for Athletes',
    summary: 'Understand proper hydration strategies for optimal performance.',
    content:
      'Hydration guidelines: 1) Drink 0.5-1oz water per pound bodyweight daily, 2) Pre-workout: 16-20oz 2-3 hours before, 3) During workout: 7-10oz every 10-20 minutes, 4) Post-workout: replace fluids lost, 5) Monitor urine color (pale yellow is ideal).',
    type: TutorialType.INJURY_PREVENTION,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['hydration', 'health', 'performance', 'water'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('9iMGFqanyrI'),
        thumbnailUrl: thumbnailUrl('9iMGFqanyrI'),
        duration: 420,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Stress Management for Lifters',
    summary: 'Learn how to manage stress for better training and recovery.',
    content:
      "Stress management: 1) Identify stress sources, 2) Practice meditation or breathing exercises, 3) Schedule rest days, 4) Don't overtrain, 5) Maintain work-life balance, 6) Seek support when needed, 7) High stress = poor recovery.",
    type: TutorialType.INJURY_PREVENTION,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['stress', 'health', 'mental health', 'wellness'],
    priority: 7,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('hnpQrMqDDiE'),
        thumbnailUrl: thumbnailUrl('hnpQrMqDDiE'),
        duration: 500,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Posture Correction for Lifters',
    summary: 'Fix common postural issues from desk work and training.',
    content:
      'Posture correction: 1) Strengthen upper back, 2) Stretch chest and hip flexors, 3) Maintain neutral spine, 4) Take breaks from sitting, 5) Practice good posture throughout day, 6) Use ergonomic setup.',
    type: TutorialType.INJURY_PREVENTION,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['posture', 'health', 'prevention', 'ergonomics'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [MuscleGroup.BACK, MuscleGroup.SHOULDERS],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('QA1hQo_jS6s'),
        thumbnailUrl: thumbnailUrl('QA1hQo_jS6s'),
        duration: 550,
        isPrimary: true,
      },
    ],
  },

  // ========== RECOVERY TIPS ==========
  {
    title: 'Complete Post-Workout Recovery Guide',
    summary:
      'Essential recovery techniques to maximize gains and reduce soreness.',
    content:
      'Recovery strategies: 1) Proper nutrition timing (protein + carbs within 30-60 min), 2) Sleep quality (7-9 hours), 3) Active recovery (light movement), 4) Stretching and foam rolling, 5) Hydration, 6) Contrast therapy (hot/cold), 7) Massage or self-myofascial release.',
    type: TutorialType.RECOVERY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['recovery', 'post-workout', 'soreness', 'tips'],
    priority: 10,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('T9b6R47x6t8'),
        thumbnailUrl: thumbnailUrl('T9b6R47x6t8'),
        duration: 600,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Foam Rolling Complete Guide',
    summary: 'Learn how to use foam rolling to improve recovery and mobility.',
    content:
      'Foam rolling techniques: 1) IT band rolling, 2) Quad and hamstring rolling, 3) Glute and hip rolling, 4) Upper back rolling, 5) Proper pressure and duration (30-60 seconds per area), 6) Breathe through discomfort.',
    type: TutorialType.RECOVERY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['foam rolling', 'recovery', 'mobility', 'soreness'],
    priority: 9,
    exerciseNames: [],
    muscleGroups: [
      MuscleGroup.QUADRICEPS,
      MuscleGroup.HAMSTRINGS,
      MuscleGroup.GLUTES,
      MuscleGroup.BACK,
    ],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('y8mJCVd5sTQ'),
        thumbnailUrl: thumbnailUrl('y8mJCVd5sTQ'),
        duration: 520,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Active Recovery Strategies',
    summary: 'Learn how to use active recovery to enhance your training.',
    content:
      'Active recovery options: 1) Light cardio (walking, cycling), 2) Yoga or stretching, 3) Swimming, 4) Low-intensity movement, 5) Promotes blood flow without stress, 6) Aids in recovery between sessions.',
    type: TutorialType.RECOVERY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['active recovery', 'recovery', 'cardio', 'tips'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('GEyqzUPjlQQ'),
        thumbnailUrl: thumbnailUrl('GEyqzUPjlQQ'),
        duration: 450,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Deload Week Guide',
    summary: 'Understand when and how to implement deload weeks.',
    content:
      'Deload week strategy: 1) Reduce volume by 40-60%, 2) Maintain intensity (weight), 3) Do every 4-8 weeks, 4) Allows recovery and supercompensation, 5) Prevents overtraining, 6) Return stronger next week.',
    type: TutorialType.RECOVERY,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['deload', 'recovery', 'overtraining', 'periodization'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('S9M3jtrC1h0'),
        thumbnailUrl: thumbnailUrl('S9M3jtrC1h0'),
        duration: 480,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Stretching Routine for Lifters',
    summary: 'Essential stretches to improve flexibility and recovery.',
    content:
      "Stretching routine: 1) Hip flexor stretches, 2) Hamstring stretches, 3) Chest stretches, 4) Shoulder stretches, 5) Calf stretches, 6) Hold 30-60 seconds, 7) Stretch after workouts, 8) Don't stretch cold muscles.",
    type: TutorialType.RECOVERY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['stretching', 'recovery', 'flexibility', 'mobility'],
    priority: 7,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('yYv25eYdM54'),
        thumbnailUrl: thumbnailUrl('yYv25eYdM54'),
        duration: 540,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Contrast Therapy for Recovery',
    summary: 'Learn how hot and cold therapy can enhance recovery.',
    content:
      'Contrast therapy: 1) Alternating hot (3-4 min) and cold (1-2 min), 2) Improves circulation, 3) Reduces inflammation, 4) Can use showers or baths, 5) End with cold, 6) 3-4 cycles recommended.',
    type: TutorialType.RECOVERY,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['contrast therapy', 'recovery', 'ice', 'heat'],
    priority: 7,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('1Pj3LpMhJ9M'),
        thumbnailUrl: thumbnailUrl('1Pj3LpMhJ9M'),
        duration: 400,
        isPrimary: true,
      },
    ],
  },

  // ========== NUTRITION TIPS (using THEORY type) ==========
  {
    title: 'Protein for Muscle Building',
    summary: 'Complete guide to protein intake for muscle growth.',
    content:
      'Protein guidelines: 1) Aim for 0.7-1g per pound bodyweight, 2) Distribute throughout day (4-6 meals), 3) Post-workout window (30-60 min), 4) Complete proteins (meat, eggs, dairy), 5) Plant-based options (combine sources), 6) Quality matters.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['nutrition', 'protein', 'muscle building', 'diet'],
    priority: 10,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('Pok0Jg2JAkE'),
        thumbnailUrl: thumbnailUrl('Pok0Jg2JAkE'),
        duration: 580,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Pre-Workout Nutrition',
    summary: 'What to eat before training for optimal performance.',
    content:
      'Pre-workout nutrition: 1) Eat 1-3 hours before, 2) Carbs for energy (30-60g), 3) Moderate protein (20-30g), 4) Low fat and fiber, 5) Stay hydrated, 6) Experiment to find what works for you.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['nutrition', 'pre-workout', 'energy', 'diet'],
    priority: 9,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('yWbB39d9b6Q'),
        thumbnailUrl: thumbnailUrl('yWbB39d9b6Q'),
        duration: 450,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Post-Workout Nutrition',
    summary: 'Optimal post-workout meal timing and composition.',
    content:
      'Post-workout nutrition: 1) Eat within 30-60 minutes, 2) Protein (20-40g) for muscle repair, 3) Carbs (30-60g) for glycogen replenishment, 4) 3:1 or 4:1 carb to protein ratio, 5) Whole foods preferred, 6) Hydration is crucial.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['nutrition', 'post-workout', 'recovery', 'diet'],
    priority: 10,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('rb7I1jL_b00'),
        thumbnailUrl: thumbnailUrl('rb7I1jL_b00'),
        duration: 500,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Meal Timing for Lifters',
    summary: 'Understand meal timing strategies for muscle growth.',
    content:
      'Meal timing: 1) Eat every 3-4 hours, 2) Pre-workout meal 1-3 hours before, 3) Post-workout meal within 1 hour, 4) Bedtime protein (casein), 5) Consistent meal schedule, 6) Total daily intake matters most.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['nutrition', 'meal timing', 'diet', 'strategy'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('kY2M_J6B044'),
        thumbnailUrl: thumbnailUrl('kY2M_J6B044'),
        duration: 520,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Carbohydrates for Training',
    summary: 'Learn how to use carbs effectively for performance.',
    content:
      'Carbohydrate strategy: 1) Complex carbs for sustained energy, 2) Simple carbs around workouts, 3) 2-3g per pound bodyweight for bulking, 4) Time carbs around training, 5) Whole grains, fruits, vegetables, 6) Adjust based on goals.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['nutrition', 'carbs', 'energy', 'diet'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('OlbTpxdnMCI'),
        thumbnailUrl: thumbnailUrl('OlbTpxdnMCI'),
        duration: 480,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Fats for Hormone Production',
    summary: 'Understand the role of dietary fats in training.',
    content:
      "Dietary fats: 1) Essential for hormone production, 2) Aim for 0.3-0.5g per pound, 3) Include healthy fats (avocado, nuts, olive oil), 4) Omega-3s for inflammation, 5) Don't fear fats, 6) Balance is key.",
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['nutrition', 'fats', 'hormones', 'diet'],
    priority: 7,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('OlbTpxdnMCI'),
        thumbnailUrl: thumbnailUrl('OlbTpxdnMCI'),
        duration: 420,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Calorie Surplus for Muscle Gain',
    summary: 'Learn how to calculate and maintain a calorie surplus.',
    content:
      'Calorie surplus: 1) Calculate maintenance calories, 2) Add 300-500 calories for bulking, 3) Track weight gain (0.5-1lb per week), 4) Adjust as needed, 5) Focus on quality foods, 6) Monitor body composition.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['nutrition', 'calories', 'bulking', 'diet'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('q2qM3D1lX9I'),
        thumbnailUrl: thumbnailUrl('q2qM3D1lX9I'),
        duration: 550,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Supplements for Lifters',
    summary: 'Evidence-based supplement guide for strength training.',
    content:
      'Key supplements: 1) Protein powder (convenience), 2) Creatine (strength and size), 3) Multivitamin (insurance), 4) Omega-3 (inflammation), 5) Vitamin D (if deficient), 6) Pre-workout (optional), 7) Focus on food first.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.INTERMEDIATE,
    tags: ['nutrition', 'supplements', 'diet', 'health'],
    priority: 7,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('VJq9JYTRH5Y'),
        thumbnailUrl: thumbnailUrl('VJq9JYTRH5Y'),
        duration: 600,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Hydration and Electrolytes',
    summary: 'Complete guide to hydration for training performance.',
    content:
      'Hydration strategy: 1) Drink 0.5-1oz water per pound daily, 2) Pre-workout: 16-20oz, 3) During: 7-10oz every 10-20 min, 4) Post: replace losses, 5) Add electrolytes for long sessions, 6) Monitor urine color.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['nutrition', 'hydration', 'electrolytes', 'performance'],
    priority: 8,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('9iMGFqanyrI'),
        thumbnailUrl: thumbnailUrl('9iMGFqanyrI'),
        duration: 450,
        isPrimary: true,
      },
    ],
  },
  {
    title: 'Meal Prep for Lifters',
    summary: 'Learn how to meal prep for consistent nutrition.',
    content:
      'Meal prep tips: 1) Plan meals for the week, 2) Batch cook proteins, 3) Prep vegetables, 4) Portion meals in containers, 5) Cook rice/potatoes in bulk, 6) Keep it simple, 7) Prep 2-3 times per week.',
    type: TutorialType.THEORY,
    difficulty: TutorialDifficulty.BEGINNER,
    tags: ['nutrition', 'meal prep', 'diet', 'planning'],
    priority: 7,
    exerciseNames: [],
    muscleGroups: [],
    media: [
      {
        provider: 'youtube',
        url: videoUrl('DP_wZkL9FhQ'),
        thumbnailUrl: thumbnailUrl('DP_wZkL9FhQ'),
        duration: 620,
        isPrimary: true,
      },
    ],
  },
];
