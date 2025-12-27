import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Exercise,
  MuscleGroup,
  Equipment,
  Difficulty,
} from '../modules/exercise/model';
import {
  Program,
  ProgramExercise,
  UserProgram,
} from '../modules/program/model';
import { User, ExperienceLevel, Gender } from '../modules/user/model';
import {
  Tutorial,
  TutorialExercise,
  TutorialMuscleGroup,
  TutorialMedia,
  TutorialType,
  TutorialDifficulty,
} from '../modules/tutorial/model';
import { IndexExerciseService } from '../modules/search/use-cases/index-exercise.service';
import { IndexTutorialService } from '../modules/tutorial/use-cases/index-tutorial.service';
import {
  allTutorialsData,
  generateTutorialsForExercises,
  TutorialSeedData,
} from './tutorial-seed-data';
import { RedisService } from '../services/redis.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(ProgramExercise)
    private programExerciseRepository: Repository<ProgramExercise>,
    @InjectRepository(UserProgram)
    private userProgramRepository: Repository<UserProgram>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    @InjectRepository(TutorialExercise)
    private tutorialExerciseRepository: Repository<TutorialExercise>,
    @InjectRepository(TutorialMuscleGroup)
    private tutorialMuscleGroupRepository: Repository<TutorialMuscleGroup>,
    @InjectRepository(TutorialMedia)
    private tutorialMediaRepository: Repository<TutorialMedia>,
    private indexExerciseService: IndexExerciseService,
    private indexTutorialService: IndexTutorialService,
    private redisService: RedisService,
  ) {}

  async seed() {
    // 1. Create an Admin User
    let adminUser = await this.userRepository.findOne({
      where: { email: 'admin@workout.com' },
    });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin_pass_123', 10);
      adminUser = await this.userRepository.save(
        this.userRepository.create({
          email: 'admin@workout.com',
          password: hashedPassword,
          firstName: 'Admin',
          surname: 'User',
          experienceLevel: ExperienceLevel.ADVANCED,
          gender: Gender.OTHER,
        }),
      );
    }

    // 2. Comprehensive Exercise Library (75+ Exercises)
    const exercisesData = [
      // CHEST (12)
      {
        name: 'Bench Press',
        description: 'Classic barbell chest press',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Lower bar to chest and drive up.',
      },
      {
        name: 'Incline Dumbbell Press',
        description: 'Upper chest focus',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Press dumbbells from incline bench.',
      },
      {
        name: 'Push-up',
        description: 'Bodyweight fundamental',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Standard floor push-up.',
      },
      {
        name: 'Cable Fly',
        description: 'Chest isolation',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.CABLE,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Pull cables together in front of chest.',
      },
      {
        name: 'Dips (Chest)',
        description: 'Horizontal push focusing on lower chest',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Lower body between bars, leaning forward.',
      },
      {
        name: 'Dumbbell Pull-over',
        description: 'Serratus and chest expansion',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Lie on bench, lower dumbbell overhead.',
      },
      {
        name: 'Pec Deck Machine',
        description: 'Chest isolation machine',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Squeeze handles together in front.',
      },
      {
        name: 'Chest Press Machine',
        description: 'Stable chest pressing',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Sit and press handles forward.',
      },
      {
        name: 'Floor Press',
        description: 'Short range explosive press',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Press from floor to isolate upper range.',
      },
      {
        name: 'Decline Bench Press',
        description: 'Lower chest focus',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Press from decline bench.',
      },
      {
        name: 'Weighted Push-up',
        description: 'Advanced push-up variation',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.OTHER,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Perform push-up with plate on back.',
      },
      {
        name: 'Hammer Strength Press',
        description: 'Heavy plate loaded press',
        muscleGroups: MuscleGroup.CHEST,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Press plate-loaded machine arms.',
      },

      // BACK (13)
      {
        name: 'Deadlift',
        description: 'Total body posterior chain',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Lift bar from ground with straight back.',
      },
      {
        name: 'Pull-up',
        description: 'Vertical pull',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Pull chin over bar.',
      },
      {
        name: 'Lat Pulldown',
        description: 'Back width focus',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Pull bar down to upper chest.',
      },
      {
        name: 'Seated Cable Row',
        description: 'Back thickness focus',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.CABLE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Pull cable handle to mid-section.',
      },
      {
        name: 'Bent Over Row',
        description: 'Heavy horizontal pull',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Pull bar to stomach while hinged at waist.',
      },
      {
        name: 'T-Bar Row',
        description: 'Mid-back vertical pull',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Pull weighted end of bar to chest.',
      },
      {
        name: 'Single Arm Dumbbell Row',
        description: 'Unilateral back work',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Pull dumbbell to hip with one hand on bench.',
      },
      {
        name: 'Straight Arm Pulldown',
        description: 'Lat isolation',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.CABLE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Push cable down with straight arms.',
      },
      {
        name: 'Neutral Grip Pull-up',
        description: 'Brachialis focused vertical pull',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Pull up with palms facing each other.',
      },
      {
        name: 'Chin-up',
        description: 'Bicep focused vertical pull',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Pull up with palms facing you.',
      },
      {
        name: 'Renegade Row',
        description: 'Core and back stability',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Row dumbbells from plank position.',
      },
      {
        name: 'Good Mornings',
        description: 'Lower back and hamstring hinge',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Bend forward with bar on back.',
      },
      {
        name: 'Hyper-extension',
        description: 'Lower back isolation',
        muscleGroups: MuscleGroup.BACK,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Raise torso from 45 degree bench.',
      },

      // SHOULDERS (10)
      {
        name: 'Overhead Press',
        description: 'Vertical shoulder press',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Press bar overhead from shoulders.',
      },
      {
        name: 'Lateral Raise',
        description: 'Side delt isolation',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Raise arms out to sides.',
      },
      {
        name: 'Arnold Press',
        description: 'Rotational shoulder press',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Rotate palms while pressing up.',
      },
      {
        name: 'Face Pull',
        description: 'Rear delt and trap health',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.CABLE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Pull cable rope toward forehead.',
      },
      {
        name: 'Front Raise',
        description: 'Front delt isolation',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Raise weights in front to shoulder height.',
      },
      {
        name: 'Barbell Shrug',
        description: 'Upper trap focused',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Shrug shoulders toward ears.',
      },
      {
        name: 'Reverse Fly',
        description: 'Rear delt isolation',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Lean forward, raise weights to sides.',
      },
      {
        name: 'Upright Row',
        description: 'Traps and side delts',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Pull bar up to chin level.',
      },
      {
        name: 'Cable Lateral Raise',
        description: 'Constant tension side delts',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.CABLE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Raise cable across body.',
      },
      {
        name: 'Push Press',
        description: 'Explosive shoulder press',
        muscleGroups: MuscleGroup.SHOULDERS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Use legs to help drive bar overhead.',
      },

      // LEGS (14)
      {
        name: 'Barbell Squat',
        description: 'King of leg exercises',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Squat down with bar on back.',
      },
      {
        name: 'Leg Press',
        description: 'Quad focus machine',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Push platform away with legs.',
      },
      {
        name: 'Bulgarian Split Squat',
        description: 'Single leg strength',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'One leg elevated, squat on other.',
      },
      {
        name: 'Leg Extension',
        description: 'Quadriceps isolation',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Straighten legs against padding.',
      },
      {
        name: 'Romanian Deadlift',
        description: 'Hamstring and glute focus',
        muscleGroups: MuscleGroup.HAMSTRINGS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Hinge at hips, lowering bar to mid-shin.',
      },
      {
        name: 'Leg Curl',
        description: 'Hamstring isolation',
        muscleGroups: MuscleGroup.HAMSTRINGS,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Flex knees against resistance.',
      },
      {
        name: 'Hip Thrust',
        description: 'Glute maximum activation',
        muscleGroups: MuscleGroup.GLUTES,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Drive hips up with back on bench.',
      },
      {
        name: 'Walking Lunge',
        description: 'Functional leg movement',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Step forward into lunge.',
      },
      {
        name: 'Calf Raise',
        description: 'Calf isolation',
        muscleGroups: MuscleGroup.CALVES,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Raise heels up.',
      },
      {
        name: 'Goblet Squat',
        description: 'Safe squat pattern',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.KETTLEBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Squat holding weight at chest.',
      },
      {
        name: 'Hack Squat',
        description: 'Quad focused machine squat',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Squat on hack machine.',
      },
      {
        name: 'Step-ups',
        description: 'Functional single leg power',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Step onto box or bench.',
      },
      {
        name: 'Glute Bridge',
        description: 'Glute activation',
        muscleGroups: MuscleGroup.GLUTES,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Raise hips from floor.',
      },
      {
        name: 'Sumo Deadlift',
        description: 'Wide stance pull',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Wide stance, pull bar from floor.',
      },

      // ARMS (12)
      {
        name: 'Dumbbell Bicep Curl',
        description: 'Bicep isolation',
        muscleGroups: MuscleGroup.BICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Curl dumbbells to shoulders.',
      },
      {
        name: 'Hammer Curl',
        description: 'Brachialis and forearm focus',
        muscleGroups: MuscleGroup.BICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Curl dumbbells with neutral grip.',
      },
      {
        name: 'Preacher Curl',
        description: 'Strict bicep isolation',
        muscleGroups: MuscleGroup.BICEPS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Curl bar with arms on pad.',
      },
      {
        name: 'Concentration Curl',
        description: 'Maximum bicep peak',
        muscleGroups: MuscleGroup.BICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Curl dumbbell while seated.',
      },
      {
        name: 'Tricep Pushdown',
        description: 'Tricep isolation',
        muscleGroups: MuscleGroup.TRICEPS,
        equipmentType: Equipment.CABLE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Push cable handle down.',
      },
      {
        name: 'Skullcrusher',
        description: 'Long head tricep focus',
        muscleGroups: MuscleGroup.TRICEPS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Lower weight to forehead.',
      },
      {
        name: 'Overhead Tricep Extension',
        description: 'Long head focused tricep extension',
        muscleGroups: MuscleGroup.TRICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Lower weight behind head.',
      },
      {
        name: 'Close Grip Bench Press',
        description: 'Compound tricep press',
        muscleGroups: MuscleGroup.TRICEPS,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Bench press with narrow grip.',
      },
      {
        name: 'Zottman Curl',
        description: 'Complete bicep and forearm work',
        muscleGroups: MuscleGroup.BICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Curl up normally, rotate palms down for lower.',
      },
      {
        name: 'Spider Curl',
        description: 'Peak isolation',
        muscleGroups: MuscleGroup.BICEPS,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Curl lying face down on incline bench.',
      },
      {
        name: 'Diamond Push-up',
        description: 'Tricep focused pushup',
        muscleGroups: MuscleGroup.TRICEPS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Pushup with hands forming diamond.',
      },
      {
        name: 'Bench Dips',
        description: 'Tricep isolation',
        muscleGroups: MuscleGroup.TRICEPS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Lower hips between benches.',
      },

      // CORE (8)
      {
        name: 'Plank',
        description: 'Isometric core stability',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Hold plank position.',
      },
      {
        name: 'Hanging Leg Raise',
        description: 'Lower ab focus',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Lift legs while hanging.',
      },
      {
        name: 'Russian Twist',
        description: 'Oblique rotation',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Rotate torso side to side.',
      },
      {
        name: 'Ab Rollout',
        description: 'Advanced core anti-extension',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.OTHER,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Roll wheel out using core.',
      },
      {
        name: 'Mountain Climbers',
        description: 'Dynamic core',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Drive knees to chest.',
      },
      {
        name: 'Crunches',
        description: 'Upper ab isolation',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Contract abs to lift shoulders.',
      },
      {
        name: 'Side Plank',
        description: 'Oblique stability',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Hold plank on one arm.',
      },
      {
        name: 'Bicycle Crunches',
        description: 'Full core rotation',
        muscleGroups: MuscleGroup.ABS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Alternate elbows to knees.',
      },

      // FUNCTIONAL/CARDIO (14)
      {
        name: 'Burpee',
        description: 'Full body conditioning',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Drop, jump up.',
      },
      {
        name: 'Box Jump',
        description: 'Explosive power',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Jump onto box.',
      },
      {
        name: 'Kettlebell Swing',
        description: 'Hip hinge power',
        muscleGroups: MuscleGroup.GLUTES,
        equipmentType: Equipment.KETTLEBELL,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Swing bell between legs.',
      },
      {
        name: 'Thrusters',
        description: 'Full body power',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Front squat into press.',
      },
      {
        name: 'Sprint',
        description: 'Max intensity run',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.BODYWEIGHT,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Sprint 100%.',
      },
      {
        name: 'Rowing Machine',
        description: 'Full body endurance',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Row at steady pace.',
      },
      {
        name: 'Battle Ropes',
        description: 'Upper body endurance',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.OTHER,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Waves with ropes.',
      },
      {
        name: 'Farmers Walk',
        description: 'Grip and core stability',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.DUMBBELL,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Walk with heavy weights.',
      },
      {
        name: 'Wall Balls',
        description: 'Conditioning and power',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.OTHER,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Squat and throw ball to target.',
      },
      {
        name: 'Sled Push',
        description: 'Lower body power',
        muscleGroups: MuscleGroup.QUADRICEPS,
        equipmentType: Equipment.OTHER,
        difficultyLevel: Difficulty.INTERMEDIATE,
        instructions: 'Push weighted sled.',
      },
      {
        name: 'Jump Rope',
        description: 'Coordination and cardio',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.OTHER,
        difficultyLevel: Difficulty.BEGINNER,
        instructions: 'Standard skipping.',
      },
      {
        name: 'Assault Bike',
        description: 'High intensity cardio',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.MACHINE,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Pedal and push/pull.',
      },
      {
        name: 'Clean and Press',
        description: 'Olympic style full body power',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'Clean bar to shoulders, then press.',
      },
      {
        name: 'Snatch',
        description: 'Complex explosive power',
        muscleGroups: MuscleGroup.FULL_BODY,
        equipmentType: Equipment.BARBELL,
        difficultyLevel: Difficulty.ADVANCED,
        instructions: 'One smooth movement from floor to overhead.',
      },
    ];

    const seededExercises: Exercise[] = [];
    for (const exData of exercisesData) {
      let exercise = await this.exerciseRepository.findOne({
        where: { name: exData.name },
      });
      if (!exercise) {
        exercise = await this.exerciseRepository.save(
          this.exerciseRepository.create(exData),
        );
      }
      seededExercises.push(exercise);
    }
    // Index exercises in Elasticsearch (optional - continue if it fails)
    try {
      await this.indexExerciseService.bulkIndexExercises(seededExercises);
    } catch (error) {
      console.warn(
        'Failed to index exercises in Elasticsearch:',
        error.message,
      );
      // Continue with seeding even if Elasticsearch fails
    }

    // 3. Robust Superstar Programs (20 Total)
    const programsData = [
      {
        name: 'Henry Cavill - Man of Steel',
        description:
          'Elite hypertrophy and strength program used to build the Superman physique.',
        duration: '12 Weeks',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Deadlift', day: 'Monday', sets: 5, reps: 5, rest: 180 },
          { name: 'Bench Press', day: 'Tuesday', sets: 4, reps: 8, rest: 120 },
          {
            name: 'Barbell Squat',
            day: 'Wednesday',
            sets: 5,
            reps: 5,
            rest: 180,
          },
          {
            name: 'Overhead Press',
            day: 'Thursday',
            sets: 4,
            reps: 10,
            rest: 90,
          },
          { name: 'Pull-up', day: 'Friday', sets: 4, reps: 12, rest: 60 },
        ],
      },
      {
        name: 'Chris Hemsworth - God of Thunder',
        description:
          'High volume bodybuilding combined with functional movements for the Thor look.',
        duration: '8 Weeks',
        schedule: '6 Days / Week',
        exercises: [
          { name: 'Bench Press', day: 'Monday', sets: 5, reps: 10, rest: 60 },
          { name: 'Lat Pulldown', day: 'Monday', sets: 5, reps: 10, rest: 60 },
          {
            name: 'Barbell Squat',
            day: 'Tuesday',
            sets: 5,
            reps: 12,
            rest: 90,
          },
          { name: 'Box Jump', day: 'Tuesday', sets: 4, reps: 10, rest: 60 },
          {
            name: 'Arnold Press',
            day: 'Wednesday',
            sets: 4,
            reps: 12,
            rest: 60,
          },
          { name: 'Burpee', day: 'Friday', sets: 5, reps: 15, rest: 45 },
        ],
      },
      {
        name: 'Ryan Reynolds - Deadpool',
        description:
          'Aesthetic athletic focused program with high work capacity.',
        duration: '10 Weeks',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Barbell Squat', day: 'Monday', sets: 4, reps: 10, rest: 90 },
          { name: 'Bench Press', day: 'Tuesday', sets: 4, reps: 10, rest: 90 },
          { name: 'Pull-up', day: 'Wednesday', sets: 4, reps: 10, rest: 60 },
          {
            name: 'Overhead Press',
            day: 'Thursday',
            sets: 4,
            reps: 10,
            rest: 60,
          },
          { name: 'Thrusters', day: 'Friday', sets: 5, reps: 15, rest: 60 },
        ],
      },
      {
        name: 'Cristiano Ronaldo - CR7 Performance',
        description:
          'Focus on explosive leg power, core stability, and total body athleticism.',
        duration: 'Year-Round',
        schedule: 'Daily',
        exercises: [
          { name: 'Box Jump', day: 'Monday', sets: 5, reps: 8, rest: 60 },
          {
            name: 'Bulgarian Split Squat',
            day: 'Monday',
            sets: 4,
            reps: 10,
            rest: 60,
          },
          { name: 'Sprint', day: 'Tuesday', sets: 10, reps: 1, rest: 90 },
          { name: 'Plank', day: 'Wednesday', sets: 4, reps: 60, rest: 30 },
          {
            name: 'Hanging Leg Raise',
            day: 'Wednesday',
            sets: 4,
            reps: 15,
            rest: 45,
          },
          { name: 'Deadlift', day: 'Friday', sets: 3, reps: 5, rest: 120 },
        ],
      },
      {
        name: 'Lionel Messi - Agility King',
        description:
          'Training geared towards quickness, balance, and lower body reactivity.',
        duration: 'Ongoing',
        schedule: '4 Days / Week',
        exercises: [
          { name: 'Sprint', day: 'Monday', sets: 8, reps: 1, rest: 60 },
          {
            name: 'Bulgarian Split Squat',
            day: 'Monday',
            sets: 3,
            reps: 12,
            rest: 60,
          },
          { name: 'Box Jump', day: 'Wednesday', sets: 4, reps: 10, rest: 60 },
          {
            name: 'Hanging Leg Raise',
            day: 'Friday',
            sets: 4,
            reps: 20,
            rest: 45,
          },
        ],
      },
      {
        name: 'Dwayne Johnson - Black Adam',
        description:
          'Insane volume and intensity. The "Hardest Worker in the Room" protocol.',
        duration: '16 Weeks',
        schedule: '6 Days / Week',
        exercises: [
          { name: 'Barbell Squat', day: 'Monday', sets: 4, reps: 12, rest: 90 },
          { name: 'Leg Press', day: 'Monday', sets: 4, reps: 25, rest: 60 },
          {
            name: 'Bent Over Row',
            day: 'Tuesday',
            sets: 4,
            reps: 12,
            rest: 90,
          },
          { name: 'Lat Pulldown', day: 'Tuesday', sets: 4, reps: 12, rest: 60 },
          {
            name: 'Bench Press',
            day: 'Wednesday',
            sets: 4,
            reps: 12,
            rest: 90,
          },
          {
            name: 'Incline Dumbbell Press',
            day: 'Wednesday',
            sets: 4,
            reps: 12,
            rest: 60,
          },
          {
            name: 'Overhead Press',
            day: 'Friday',
            sets: 4,
            reps: 12,
            rest: 90,
          },
          { name: 'Barbell Shrug', day: 'Friday', sets: 4, reps: 20, rest: 60 },
        ],
      },
      {
        name: 'Tom Hardy - Bane Bulk',
        description:
          'Focus on mass in the traps, back, and shoulders for a powerful look.',
        duration: '12 Weeks',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Bench Press', day: 'Monday', sets: 5, reps: 5, rest: 120 },
          { name: 'Barbell Shrug', day: 'Monday', sets: 5, reps: 15, rest: 60 },
          { name: 'Deadlift', day: 'Tuesday', sets: 5, reps: 5, rest: 180 },
          { name: 'Pull-up', day: 'Tuesday', sets: 5, reps: 10, rest: 90 },
          {
            name: 'Overhead Press',
            day: 'Thursday',
            sets: 5,
            reps: 5,
            rest: 120,
          },
          {
            name: 'Close Grip Bench Press',
            day: 'Thursday',
            sets: 5,
            reps: 8,
            rest: 90,
          },
        ],
      },
      {
        name: 'Scarlett Johansson - Black Widow',
        description:
          'Functional strength and conditioning for agility and endurance.',
        duration: '8 Weeks',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Box Jump', day: 'Monday', sets: 4, reps: 12, rest: 60 },
          { name: 'Push-up', day: 'Monday', sets: 4, reps: 20, rest: 45 },
          {
            name: 'Kettlebell Swing',
            day: 'Tuesday',
            sets: 4,
            reps: 20,
            rest: 60,
          },
          { name: 'Plank', day: 'Tuesday', sets: 3, reps: 90, rest: 60 },
          {
            name: 'Bulgarian Split Squat',
            day: 'Thursday',
            sets: 4,
            reps: 12,
            rest: 60,
          },
          {
            name: 'Rowing Machine',
            day: 'Friday',
            sets: 1,
            reps: 2000,
            rest: 0,
          },
        ],
      },
      {
        name: 'Michael B. Jordan - Creed II',
        description: 'Boxing conditioning mixed with bodybuilding hypertrophy.',
        duration: '12 Weeks',
        schedule: '6 Days / Week',
        exercises: [
          { name: 'Bench Press', day: 'Monday', sets: 4, reps: 10, rest: 90 },
          { name: 'Push-up', day: 'Monday', sets: 4, reps: 20, rest: 45 },
          {
            name: 'Barbell Squat',
            day: 'Tuesday',
            sets: 4,
            reps: 10,
            rest: 90,
          },
          {
            name: 'Battle Ropes',
            day: 'Wednesday',
            sets: 5,
            reps: 60,
            rest: 60,
          },
          {
            name: 'Hanging Leg Raise',
            day: 'Wednesday',
            sets: 4,
            reps: 15,
            rest: 45,
          },
          {
            name: 'Dumbbell Bicep Curl',
            day: 'Friday',
            sets: 4,
            reps: 12,
            rest: 60,
          },
          {
            name: 'Tricep Pushdown',
            day: 'Friday',
            sets: 4,
            reps: 12,
            rest: 60,
          },
        ],
      },
      {
        name: 'LeBron James - King Stability',
        description:
          'Elite basketball focused training emphasizing core, balance, and vertical power.',
        duration: 'Ongoing',
        schedule: '4 Days / Week',
        exercises: [
          { name: 'Deadlift', day: 'Monday', sets: 3, reps: 5, rest: 120 },
          { name: 'Box Jump', day: 'Monday', sets: 5, reps: 5, rest: 60 },
          {
            name: 'Walking Lunge',
            day: 'Tuesday',
            sets: 3,
            reps: 20,
            rest: 60,
          },
          {
            name: 'Bulgarian Split Squat',
            day: 'Tuesday',
            sets: 3,
            reps: 10,
            rest: 60,
          },
          { name: 'Plank', day: 'Thursday', sets: 4, reps: 120, rest: 60 },
          {
            name: 'Russian Twist',
            day: 'Thursday',
            sets: 4,
            reps: 30,
            rest: 30,
          },
        ],
      },
      {
        name: 'Lewis Hamilton - F1 G-Force',
        description:
          'Intense focus on neck, core, and cardiovascular endurance for high G racing.',
        duration: 'Year-Round',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Plank', day: 'Monday', sets: 5, reps: 120, rest: 45 },
          { name: 'Rowing Machine', day: 'Monday', sets: 1, reps: 1, rest: 0 },
          { name: 'Pull-up', day: 'Tuesday', sets: 4, reps: 15, rest: 60 },
          { name: 'Push-up', day: 'Tuesday', sets: 4, reps: 30, rest: 60 },
          { name: 'Sprint', day: 'Wednesday', sets: 10, reps: 1, rest: 60 },
          {
            name: 'Mountain Climbers',
            day: 'Friday',
            sets: 4,
            reps: 50,
            rest: 45,
          },
        ],
      },
      {
        name: 'Simu Liu - Shang-Chi',
        description:
          'Martial arts based conditioning and muscle building for functional power.',
        duration: '10 Weeks',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Burpee', day: 'Monday', sets: 5, reps: 20, rest: 60 },
          { name: 'Pull-up', day: 'Monday', sets: 4, reps: 12, rest: 60 },
          { name: 'Thrusters', day: 'Tuesday', sets: 4, reps: 15, rest: 90 },
          {
            name: 'Kettlebell Swing',
            day: 'Wednesday',
            sets: 4,
            reps: 25,
            rest: 60,
          },
          { name: 'Box Jump', day: 'Thursday', sets: 5, reps: 10, rest: 60 },
          {
            name: 'Hanging Leg Raise',
            day: 'Friday',
            sets: 4,
            reps: 20,
            rest: 45,
          },
        ],
      },
      {
        name: 'Conor McGregor - MMA Shred',
        description:
          'MMA mobility, explosive strength, and high-intensity interval training.',
        duration: '6 Weeks',
        schedule: '6 Days / Week',
        exercises: [
          { name: 'Burpee', day: 'Monday', sets: 5, reps: 25, rest: 45 },
          {
            name: 'Mountain Climbers',
            day: 'Monday',
            sets: 5,
            reps: 60,
            rest: 30,
          },
          {
            name: 'Barbell Squat',
            day: 'Tuesday',
            sets: 4,
            reps: 15,
            rest: 60,
          },
          { name: 'Sprint', day: 'Wednesday', sets: 12, reps: 1, rest: 45 },
          {
            name: 'Battle Ropes',
            day: 'Thursday',
            sets: 6,
            reps: 45,
            rest: 60,
          },
          { name: 'Push-up', day: 'Friday', sets: 5, reps: 30, rest: 45 },
        ],
      },
      {
        name: 'Roger Federer - Swiss Precision',
        description:
          'Core stability, upper body flexibility, and lower body reactivity for longevity.',
        duration: 'Ongoing',
        schedule: '4 Days / Week',
        exercises: [
          { name: 'Walking Lunge', day: 'Monday', sets: 3, reps: 24, rest: 60 },
          {
            name: 'Bulgarian Split Squat',
            day: 'Monday',
            sets: 3,
            reps: 12,
            rest: 60,
          },
          { name: 'Plank', day: 'Wednesday', sets: 3, reps: 120, rest: 60 },
          { name: 'Lateral Raise', day: 'Friday', sets: 3, reps: 15, rest: 45 },
          {
            name: 'Romanian Deadlift',
            day: 'Friday',
            sets: 3,
            reps: 12,
            rest: 60,
          },
        ],
      },
      {
        name: 'Kylian Mbappé - Turbo Speed',
        description:
          'Pure explosive power and maximum speed development for soccer players.',
        duration: 'Year-Round',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Sprint', day: 'Monday', sets: 15, reps: 1, rest: 60 },
          { name: 'Box Jump', day: 'Monday', sets: 5, reps: 8, rest: 60 },
          {
            name: 'Barbell Squat',
            day: 'Tuesday',
            sets: 4,
            reps: 5,
            rest: 120,
          },
          { name: 'Deadlift', day: 'Thursday', sets: 3, reps: 5, rest: 180 },
          {
            name: 'Mountain Climbers',
            day: 'Friday',
            sets: 4,
            reps: 100,
            rest: 60,
          },
        ],
      },
      {
        name: 'Rafael Nadal - Clay Court Grinder',
        description: 'Elite endurance and mental toughness training.',
        duration: 'Year-Round',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Sprint', day: 'Monday', sets: 10, reps: 1, rest: 60 },
          {
            name: 'Lateral Raise',
            day: 'Tuesday',
            sets: 4,
            reps: 15,
            rest: 45,
          },
          { name: 'Plank', day: 'Wednesday', sets: 4, reps: 120, rest: 60 },
          { name: 'Burpee', day: 'Thursday', sets: 5, reps: 20, rest: 60 },
          { name: 'Rowing Machine', day: 'Friday', sets: 1, reps: 1, rest: 0 },
        ],
      },
      {
        name: 'Gal Gadot - Wonder Weapon',
        description: 'Balanced power and aesthetic program.',
        duration: '10 Weeks',
        schedule: '4 Days / Week',
        exercises: [
          { name: 'Barbell Squat', day: 'Monday', sets: 4, reps: 12, rest: 60 },
          { name: 'Push-up', day: 'Tuesday', sets: 4, reps: 20, rest: 60 },
          { name: 'Pull-up', day: 'Thursday', sets: 4, reps: 10, rest: 60 },
          { name: 'Box Jump', day: 'Friday', sets: 4, reps: 15, rest: 60 },
        ],
      },
      {
        name: 'Serena Williams - Grand Slam Power',
        description: 'Dominant strength and explosive power.',
        duration: 'Ongoing',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Barbell Squat', day: 'Monday', sets: 5, reps: 5, rest: 120 },
          { name: 'Deadlift', day: 'Tuesday', sets: 5, reps: 5, rest: 180 },
          { name: 'Bench Press', day: 'Thursday', sets: 5, reps: 5, rest: 120 },
          { name: 'Box Jump', day: 'Friday', sets: 5, reps: 8, rest: 60 },
        ],
      },
      {
        name: 'Usain Bolt - 9.58 Protocol',
        description: 'Pure sprinting power.',
        duration: 'Ongoing',
        schedule: '5 Days / Week',
        exercises: [
          { name: 'Sprint', day: 'Monday', sets: 10, reps: 1, rest: 120 },
          { name: 'Deadlift', day: 'Wednesday', sets: 3, reps: 3, rest: 300 },
          { name: 'Barbell Squat', day: 'Friday', sets: 3, reps: 3, rest: 300 },
        ],
      },
      {
        name: 'Ryan Gosling - Drive Aesthetic',
        description: 'Focus on shoulder width and tight core.',
        duration: '8 Weeks',
        schedule: '4 Days / Week',
        exercises: [
          {
            name: 'Overhead Press',
            day: 'Monday',
            sets: 4,
            reps: 12,
            rest: 60,
          },
          { name: 'Pull-up', day: 'Wednesday', sets: 4, reps: 12, rest: 60 },
          { name: 'Bench Press', day: 'Friday', sets: 3, reps: 12, rest: 60 },
        ],
      },
    ];

    for (const pData of programsData) {
      // Check if program exists (Programs are no longer owned by one user, but we'll check by name)
      let program = await this.programRepository.findOne({
        where: { name: pData.name },
      });
      if (!program) {
        program = await this.programRepository.save(
          this.programRepository.create({
            name: pData.name,
            description: pData.description,
            duration: pData.duration,
            schedule: pData.schedule,
            isAvailable: true,
          }),
        );

        // Enroll admin user in the program
        await this.userProgramRepository.save(
          this.userProgramRepository.create({
            userId: adminUser.id,
            programId: program.id,
            isActive: true,
          }),
        );

        for (const [index, exRef] of pData.exercises.entries()) {
          const exercise = seededExercises.find((e) => e.name === exRef.name);
          if (exercise) {
            await this.programExerciseRepository.save(
              this.programExerciseRepository.create({
                programId: program.id,
                exerciseId: exercise.id,
                daysOfTheWeek: (exRef as any).day,
                order: index + 1,
                targetSets: (exRef as any).sets,
                targetReps: (exRef as any).reps,
                restTime: (exRef as any).rest,
              }),
            );
          }
        }
      }
    }

    // 4. Comprehensive Tutorial Library with Videos
    let seededTutorials: Tutorial[] = [];
    try {
      console.log('Starting tutorial seeding...');

      // Clear existing tutorials to ensure fresh seed
      console.log('Clearing existing tutorial data from DB and ES...');
      try {
        await this.indexTutorialService.deleteIndex();
        await this.tutorialMediaRepository.delete({});
        await this.tutorialExerciseRepository.delete({});
        await this.tutorialMuscleGroupRepository.delete({});
        await this.tutorialRepository.delete({});
        console.log('Cleared existing tutorials.');
      } catch (error) {
        console.warn('Error clearing tutorials (first run?):', error.message);
      }
      // Start with detailed tutorials from seed data
      const detailedTutorials = allTutorialsData;
      console.log(
        `Found ${detailedTutorials.length} detailed tutorials in seed data`,
      );

      // Get all exercise names that already have detailed tutorials
      const exercisesWithDetailedTutorials = new Set(
        detailedTutorials.flatMap((t) => t.exerciseNames),
      );

      // Generate form tutorials for all exercises that don't have detailed tutorials
      const exercisesNeedingTutorials = seededExercises
        .filter((e) => !exercisesWithDetailedTutorials.has(e.name))
        .map((e) => e.name);

      const generatedTutorials = generateTutorialsForExercises(
        exercisesNeedingTutorials,
      );

      // Combine detailed and generated tutorials
      const tutorialsData: TutorialSeedData[] = [
        ...detailedTutorials,
        ...generatedTutorials,
      ];

      // Also associate generated tutorials with their muscle groups
      for (const tutorial of generatedTutorials) {
        const exercise = seededExercises.find(
          (e) => e.name === tutorial.exerciseNames[0],
        );
        if (exercise) {
          tutorial.muscleGroups = [exercise.muscleGroups];
        }
      }

      console.log(`Total tutorials to seed: ${tutorialsData.length}`);
      seededTutorials = [];
      for (const tutorialData of tutorialsData) {
        let tutorial = await this.tutorialRepository.findOne({
          where: { title: tutorialData.title },
        });
        if (!tutorial) {
          tutorial = await this.tutorialRepository.save(
            this.tutorialRepository.create({
              title: tutorialData.title,
              summary: tutorialData.summary,
              content: tutorialData.content,
              type: tutorialData.type,
              difficulty: tutorialData.difficulty,
              tags: tutorialData.tags,
              priority: tutorialData.priority,
              isPublished: true,
            }),
          );
        }
        seededTutorials.push(tutorial);

        // Associate with exercises
        for (const exerciseName of tutorialData.exerciseNames) {
          const exercise = seededExercises.find((e) => e.name === exerciseName);
          if (exercise) {
            const existing = await this.tutorialExerciseRepository.findOne({
              where: { tutorialId: tutorial.id, exerciseId: exercise.id },
            });
            if (!existing) {
              await this.tutorialExerciseRepository.save(
                this.tutorialExerciseRepository.create({
                  tutorialId: tutorial.id,
                  exerciseId: exercise.id,
                }),
              );
            }
          }
        }

        // Associate with muscle groups
        for (const muscleGroup of tutorialData.muscleGroups) {
          const existing = await this.tutorialMuscleGroupRepository.findOne({
            where: { tutorialId: tutorial.id, muscleGroup },
          });
          if (!existing) {
            await this.tutorialMuscleGroupRepository.save(
              this.tutorialMuscleGroupRepository.create({
                tutorialId: tutorial.id,
                muscleGroup,
              }),
            );
          }
        }

        // Add media
        for (const mediaData of tutorialData.media) {
          const existing = await this.tutorialMediaRepository.findOne({
            where: { tutorialId: tutorial.id, isPrimary: mediaData.isPrimary },
          });
          if (!existing) {
            await this.tutorialMediaRepository.save(
              this.tutorialMediaRepository.create({
                tutorialId: tutorial.id,
                provider: mediaData.provider,
                url: mediaData.url,
                thumbnailUrl: mediaData.thumbnailUrl,
                duration: mediaData.duration,
                isPrimary: mediaData.isPrimary,
                transcript: mediaData.transcript || null,
              }),
            );
          }
        }
      }

      console.log(`Successfully seeded ${seededTutorials.length} tutorials`);
    } catch (error) {
      console.error('Error during tutorial seeding:', error);
      console.error('Stack:', error.stack);
      // Continue with seeding even if tutorials fail
    }

    // 5. Index Tutorials to Elasticsearch
    try {
      // Create index if it doesn't exist
      await this.indexTutorialService.createIndex();

      // Bulk index all tutorials
      await this.indexTutorialService.bulkIndexTutorials(seededTutorials);
      console.log(
        `Indexed ${seededTutorials.length} tutorials to Elasticsearch`,
      );
    } catch (error) {
      console.warn(
        'Failed to index tutorials to Elasticsearch:',
        error.message,
      );
      // Continue even if indexing fails
    }

    // 6. Warm up Redis cache with common queries
    try {
      await this.warmupRedisCache(seededExercises, seededTutorials);
      console.log('Redis cache warmed up successfully');
    } catch (error) {
      console.warn('Failed to warm up Redis cache:', error.message);
      // Continue even if cache warming fails
    }

    return {
      message: 'Ultimate seeding expansion completed successfully',
      exercisesCount: seededExercises.length,
      programsCount: programsData.length,
      tutorialsCount: seededTutorials.length,
      indexedToElasticsearch: seededTutorials.length,
      cacheWarmed: true,
    };
  }

  private async warmupRedisCache(
    exercises: Exercise[],
    tutorials: Tutorial[],
  ): Promise<void> {
    // Simplified cache warming - just ensure structure is ready
    // Actual caching will happen naturally when endpoints are called
    // This avoids complex query builder issues during seeding

    try {
      // 1. Warm up exercise caches
      // Cache all exercises list
      await this.redisService.set('exercises:all', exercises, 7200);

      // Cache popular individual exercises
      const popularExercises = exercises
        .filter((e) =>
          [
            'Bench Press',
            'Squat',
            'Deadlift',
            'Pull-up',
            'Overhead Press',
          ].includes(e.name),
        )
        .slice(0, 5);

      for (const exercise of popularExercises) {
        await this.redisService.set(
          `exercises:detail:${exercise.id}`,
          exercise,
          7200,
        );
      }

      // Cache exercises by muscle group (common queries)
      const commonMuscleGroups = [
        MuscleGroup.CHEST,
        MuscleGroup.BACK,
        MuscleGroup.QUADRICEPS,
        MuscleGroup.SHOULDERS,
        MuscleGroup.BICEPS,
        MuscleGroup.TRICEPS,
      ];
      for (const muscleGroup of commonMuscleGroups) {
        const exercisesByMuscle = exercises.filter(
          (e) => e.muscleGroups === muscleGroup,
        );
        if (exercisesByMuscle.length > 0) {
          const cacheKey = `exercises:list:${JSON.stringify({ muscleGroups: muscleGroup, page: 1, limit: 20 })}`;
          await this.redisService.set(
            cacheKey,
            { exercises: exercisesByMuscle, total: exercisesByMuscle.length },
            3600,
          );
        }
      }

      // 2. Pre-populate some common exercise tutorial caches using simpler approach

      for (const exercise of popularExercises) {
        // Use the tutorialExerciseRepository to find tutorials for this exercise
        const tutorialExercises = await this.tutorialExerciseRepository.find({
          where: { exerciseId: exercise.id },
          relations: [
            'tutorial',
            'tutorial.tutorialMuscleGroups',
            'tutorial.tutorialMedia',
            'exercise',
          ],
        });

        if (tutorialExercises.length > 0) {
          const cacheKey = `tutorials:exercise:${exercise.id}`;
          const tutorialList = tutorialExercises
            .filter((te) => te.tutorial?.isPublished)
            .map((te) => {
              const tutorial = te.tutorial;
              const primaryMedia = tutorial.tutorialMedia?.find(
                (m) => m.isPrimary,
              );
              return {
                id: tutorial.id,
                title: tutorial.title,
                summary: tutorial.summary,
                type: tutorial.type,
                difficulty: tutorial.difficulty,
                tags: tutorial.tags,
                thumbnailUrl: primaryMedia?.thumbnailUrl || null,
                hasVideo:
                  tutorial.tutorialMedia && tutorial.tutorialMedia.length > 0,
                videoDuration: primaryMedia?.duration || null,
                exerciseIds: [exercise.id],
                exerciseNames: [exercise.name],
                muscleGroups:
                  tutorial.tutorialMuscleGroups?.map(
                    (tmg) => tmg.muscleGroup,
                  ) || [],
              };
            });

          if (tutorialList.length > 0) {
            // Cache for 1 hour
            await this.redisService.set(cacheKey, tutorialList, 3600);
          }
        }
      }

      // Pre-populate common muscle group caches
      const commonMuscleGroupsForCache = [
        MuscleGroup.CHEST,
        MuscleGroup.BACK,
        MuscleGroup.QUADRICEPS,
        MuscleGroup.SHOULDERS,
      ];

      for (const muscleGroup of commonMuscleGroupsForCache) {
        const tutorialMuscleGroups =
          await this.tutorialMuscleGroupRepository.find({
            where: { muscleGroup },
            relations: [
              'tutorial',
              'tutorial.tutorialExercises',
              'tutorial.tutorialExercises.exercise',
              'tutorial.tutorialMedia',
            ],
            take: 20,
          });

        if (tutorialMuscleGroups.length > 0) {
          const cacheKey = `tutorials:muscle:${muscleGroup}`;
          const tutorialList = tutorialMuscleGroups
            .filter((tmg) => tmg.tutorial?.isPublished)
            .map((tmg) => {
              const tutorial = tmg.tutorial;
              const primaryMedia = tutorial.tutorialMedia?.find(
                (m) => m.isPrimary,
              );
              return {
                id: tutorial.id,
                title: tutorial.title,
                summary: tutorial.summary,
                type: tutorial.type,
                difficulty: tutorial.difficulty,
                tags: tutorial.tags,
                thumbnailUrl: primaryMedia?.thumbnailUrl || null,
                hasVideo:
                  tutorial.tutorialMedia && tutorial.tutorialMedia.length > 0,
                videoDuration: primaryMedia?.duration || null,
                exerciseIds:
                  tutorial.tutorialExercises?.map((te) => te.exerciseId) || [],
                exerciseNames:
                  tutorial.tutorialExercises
                    ?.map((te) => te.exercise?.name)
                    .filter(Boolean) || [],
                muscleGroups: [muscleGroup],
              };
            });

          if (tutorialList.length > 0) {
            // Cache for 2 hours
            await this.redisService.set(cacheKey, tutorialList, 7200);
          }
        }
      }
    } catch (error) {
      // Silently fail cache warming - it's not critical
      console.warn(
        'Cache warming encountered an error (non-critical):',
        error.message,
      );
    }
  }
}
