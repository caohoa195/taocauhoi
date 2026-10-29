export enum Subject {
  PHYSICS = 'Vật lý',
  MATH = 'Toán học đại cương',
  ENGLISH = 'Tiếng Anh',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Trắc nghiệm 4 phương án',
  TRUE_FALSE = 'Đúng/Sai',
  FILL_BLANK = 'Điền vào chỗ trống',
  ESSAY = 'Tự luận',
}

export enum DifficultyLevel {
  RECOGNITION = 'Nhận biết',
  UNDERSTANDING = 'Thông hiểu',
  APPLICATION = 'Vận dụng',
  ADVANCED_APPLICATION = 'Vận dụng nâng cao',
}

export interface ExamConfig {
  subject: string;
  topic: string;
  specificRequirement: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  quantity: number;
  sourceFiles: File[];
  // New Header Fields
  faculty: string;
  department: string;
  targetAudience: string;
  duration: string;
  signerTitle: string;
  signerName: string;
  // Matrix Fields
  levelDistribution?: {
    [DifficultyLevel.RECOGNITION]: number;
    [DifficultyLevel.UNDERSTANDING]: number;
    [DifficultyLevel.APPLICATION]: number;
    [DifficultyLevel.ADVANCED_APPLICATION]: number;
  };
  variantCount?: number;
}

export interface GeneratedContent {
  questions: string;
  answers: string;
}

export interface GradingConfig {
  submissionFile: File | null;
  answerKeyFile: File | null;
  gradingType: 'trac-nghiem' | 'tu-luan';
}

export interface GradingResult {
  feedback: string;
  score: string;
}

export interface FileData {
  inlineData: {
    data: string;
    mimeType: string;
  };
}