/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  FileText,
  HelpCircle,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  X,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  SlidersHorizontal,
  Edit3,
  Award,
  Upload,
  Paperclip,
  Mail,
  ShieldCheck,
  FileCheck,
  User,
  Trash2,
  FileUp,
} from 'lucide-react';

/* =========================================================================
   TYPES & DATA MODELS
   ========================================================================= */

export type AppTab = 'definition' | 'execution' | 'final_report';

export type TaskType = '핵심과제' | '사업이슈과제' | '퀵윈과제';

export interface KPIRow {
  id: string;
  type: 'Goal' | 'KPI_1' | 'KPI_2' | 'KPI_3';
  name: string;
  currentLevel: string;
  targetLevel: string;
}

export interface ScheduleRow {
  id: string;
  task: string;
  milestone: string;
  months: boolean[]; // index 0: 3월 ... index 9: 12월
}

export interface FormData {
  taskType: TaskType;
  title: string;
  processProduct: string;
  manager: string;
  managerDept: string;
  participants: string;
  participantsDept: string;
  reason: string;
  improvementContent: string;
  goalInputMode: 'direct' | 'dx_platform';
  kpis: KPIRow[];
  financialBenefit: string;
  qualitativeEffect: string;
  investmentCost: string;
  schedules: ScheduleRow[];
}

export interface FeedbackItem {
  fieldKey: string;
  fieldLabel: string;
  severity: 'warning' | 'info' | 'success';
  comment: string;
  recommendation: string;
}

export interface EvaluationResult {
  passed: boolean;
  score: number;
  feedbacks: FeedbackItem[];
  summary: string;
}

export interface SupplementItem {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  currentContent: string;
  reason: string;
  recommendation: string;
}

export interface SupplementReport {
  docNo: string;
  createdDate: string;
  sender: string;
  receiver: string;
  projectTitle: string;
  processProduct: string;
  overallOpinion: string;
  items: SupplementItem[];
}

/* Screen 2 & 3: Rubric & Mentoring Types */
export type RubricGrade = '상' | '중' | '하';

export interface RubricItem {
  id: number;
  stage: '1. Define' | '2. Goal Setting' | '3. Analyze' | '4. Practice';
  procedure: string;
  item: string;
  criterion: string;
  points: number;
  grade: RubricGrade;
  weight: number;
  score: number;
  reason: string;
}

export interface ExecutionMentoringRequest {
  defineText: string;
  goalSettingText: string;
  analyzeText: string;
  practiceText: string;
  files: { name: string; size: string; date: string }[];
}

export interface FinalReportSubmission {
  executiveName: string;
  approvalDocTitle: string;
  signedDocScan: { name: string; size: string } | null;
  finalReportFile: { name: string; size: string } | null;
  summaryNote: string;
}

/* =========================================================================
   49-ITEM AXAGE 핵심과제 평가 기준 (PDF 100% 반영)
   ========================================================================= */

const INITIAL_RUBRIC: RubricItem[] = [
  // 1. Define
  {
    id: 1,
    stage: '1. Define',
    procedure: '① 과제선정 배경',
    item: '1. 과제는 전략과제 또는 팀 목표와 연계되어 있다.',
    criterion: '선정된 과제가 전략과제 또는 팀 목표와 연계되어 있음을 설명하는 자료를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Q-cost 분석 결과 및 전사 실패비용 감소 전략과제와의 구체적 연계성을 명확히 증빙함.'
  },
  {
    id: 2,
    stage: '1. Define',
    procedure: '② 예비안건 도출 및 과제 선정',
    item: '1. 과제는 합리적이고 적절한 우선순위 평가에 의해 선정되었다.',
    criterion: '선정된 CTQ를 해결하기 위한 후보과제 중 적합성 평가를 통해 본 과제가 선정되었음을 제시한다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '부적합품 손실비 34.8% 기여도 기반 우선순위 매트릭스 도출 근거가 타당함.'
  },

  // 2. Goal Setting
  {
    id: 3,
    stage: '2. Goal Setting',
    procedure: '① Goal 특성 선정',
    item: '1. 과제의 Goal(=CTQ-Y) 은 측정 가능한 특성이다.',
    criterion: 'Goal 은 측정 가능한 특성이어야 한다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: '부적합품율(%)로 정량적 측정 가능 지표이며 센서 및 검사 데이터로 연속 측정 가능함.'
  },
  {
    id: 4,
    stage: '2. Goal Setting',
    procedure: '② Goal 목표 설정',
    item: '1. Goal(=CTQ-Y) 의 도전 목표치를 설정하였고 그 근거를 제시하였다.',
    criterion: 'Goal 의 도전 목표치를 제시한다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '현수준 1.99% 대비 63.8% 개선된 도전 목표치(0.72%)를 명확히 제시함.'
  },
  {
    id: 5,
    stage: '2. Goal Setting',
    procedure: '② Goal 목표 설정',
    item: '1. Goal(=CTQ-Y) 의 도전 목표치를 설정하였고 그 근거를 제시하였다.',
    criterion: 'Goal 의 도전 목표치 선정의 근거를 제시한다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '과거 공정 최고 실적(Best) 및 공정능력 개선 잠재력을 통계적으로 분석하여 산출함.'
  },
  {
    id: 6,
    stage: '2. Goal Setting',
    procedure: '③ Goal 운영 정의',
    item: '1. Goal(CTQ-Y) 의 운영 정의가 명확하다.',
    criterion: 'Goal 의 개념을 정의 하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '제막공정 검사 라인에서 판정된 총 부적합 롤 수 / 총 생산 롤 수 비율로 명확히 정의함.'
  },
  {
    id: 7,
    stage: '2. Goal Setting',
    procedure: '③ Goal 운영 정의',
    item: '1. Goal(CTQ-Y) 의 운영 정의가 명확하다.',
    criterion: 'Goal 의 단위를 표기하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '백분율(%) 단위가 명시됨.'
  },
  {
    id: 8,
    stage: '2. Goal Setting',
    procedure: '③ Goal 운영 정의',
    item: '1. Goal(CTQ-Y) 의 운영 정의가 명확하다.',
    criterion: 'Goal 의 규격을 제시하였다.',
    points: 1,
    grade: '중',
    weight: 0.5,
    score: 0.5,
    reason: '상한 규격(USL 0.8%)은 제시되었으나 하한 관리선에 대한 추가 보완이 일부 필요함.'
  },
  {
    id: 9,
    stage: '2. Goal Setting',
    procedure: '③ Goal 운영 정의',
    item: '1. Goal(CTQ-Y) 의 운영 정의가 명확하다.',
    criterion: 'Goal 의 측정빈도를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Lot별 권취 완료 시점 및 1일 단위 집계 주기 명시.'
  },
  {
    id: 10,
    stage: '2. Goal Setting',
    procedure: '③ Goal 운영 정의',
    item: '1. Goal(CTQ-Y) 의 운영 정의가 명확하다.',
    criterion: 'Goal 의 측정시스템을 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'MES 품질검사 모듈 및 자동 표면결함 검사기(AOI) 시스템 연동 표기.'
  },
  {
    id: 11,
    stage: '2. Goal Setting',
    procedure: '④ 성과측정지표(KPI) 선정',
    item: '1. 성과측정 지표는 Goal 에 충분하게 기여한다.',
    criterion: 'Goal(CTQ-Y)에 가장 큰 영향을 미치는 성과측정지표(KPI=CTQ-y) 선정 과정을 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: '외부이물, 횡방향결점, Scratch 결점 항목이 전체 불량의 85%를 차지함을 파레토 분석으로 입증.'
  },
  {
    id: 12,
    stage: '2. Goal Setting',
    procedure: '④ 성과측정지표(KPI) 선정',
    item: '1. 성과측정 지표는 Goal 에 충분하게 기여한다.',
    criterion: '성과측정지표(KPI)의 우선순위 평가 결과를 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: '결점 유형별 영향도 및 개선 시급성 평가 매트릭스를 제시함.'
  },
  {
    id: 13,
    stage: '2. Goal Setting',
    procedure: '④ 성과측정지표(KPI) 선정',
    item: '2. 성과측정지표는 측정 가능한 특성이어야 한다.',
    criterion: 'KPI 는 측정가능한 특성이어야 한다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: '세부 결점 항목별 발생 빈도 및 결점률(%) 연속 측정이 가능함.'
  },
  {
    id: 14,
    stage: '2. Goal Setting',
    procedure: '⑤ 성과측정지표(KPI) 운영 정의',
    item: '1. 성과측정지표의 운영 정의가 명확하다.',
    criterion: 'KPI 의 개념을 정의 하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '외부이물(원단 표면 50um 이상 이물 흡착) 등 구체적 정의 완료.'
  },
  {
    id: 15,
    stage: '2. Goal Setting',
    procedure: '⑤ 성과측정지표(KPI) 운영 정의',
    item: '1. 성과측정지표의 운영 정의가 명확하다.',
    criterion: 'KPI 의 단위를 표기하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '백분율(%) 표기 완료.'
  },
  {
    id: 16,
    stage: '2. Goal Setting',
    procedure: '⑤ 성과측정지표(KPI) 운영 정의',
    item: '1. 성과측정지표의 운영 정의가 명확하다.',
    criterion: 'KPI 의 규격을 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '각 KPI별 규격 한계선 설정 완료.'
  },
  {
    id: 17,
    stage: '2. Goal Setting',
    procedure: '⑤ 성과측정지표(KPI) 운영 정의',
    item: '1. 성과측정지표의 운영 정의가 명확하다.',
    criterion: 'KPI 의 측정빈도를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '라인별 1회/시프트 측정 주기 수립.'
  },
  {
    id: 18,
    stage: '2. Goal Setting',
    procedure: '⑤ 성과측정지표(KPI) 운영 정의',
    item: '1. 성과측정지표의 운영 정의가 명확하다.',
    criterion: 'KPI 의 측정시스템을 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '고속 카메라 비전 계측 장비 운영 체계 명시.'
  },
  {
    id: 19,
    stage: '2. Goal Setting',
    procedure: '⑥ 성과측정지표(KPI) 목표 설정',
    item: '1. 성과측정지표의 목표를 설정하였고 그 근거를 제시하였다.',
    criterion: 'KPI 의 목표를 설정하고 근거를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'KPI_1(0.60->0.45%), KPI_2(0.24->0.17%) 등 합리적 목표와 산출 근거 명시.'
  },
  {
    id: 20,
    stage: '2. Goal Setting',
    procedure: '⑥ 성과측정지표(KPI) 목표 설정',
    item: '2. Goal 의 연간 기대 유형 효과를 산출한다.',
    criterion: 'KPI 의 목표를 바탕으로 Goal 과 연간 재무성과 목표를 산출하였다.',
    points: 5,
    grade: '상',
    weight: 1.0,
    score: 5.0,
    reason: '월간 절감량(8.06ton/월) × 단가(3,219원/kg) × 12개월 = 311백만원 산출식 명확함.'
  },

  // 3. Analyze
  {
    id: 21,
    stage: '3. Analyze',
    procedure: '① 성과측정지표(KPI) 의 측정시스템 분석',
    item: '1. 성과측정지표의 측정시스템은 신뢰할 수 있다.',
    criterion: 'KPI의 측정시스템 분석 결과를 제시한다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Gage R&R 변동 비율(GRR% = 12.4%) 분석 결과 보고서 첨부됨.'
  },
  {
    id: 22,
    stage: '3. Analyze',
    procedure: '① 성과측정지표(KPI) 의 측정시스템 분석',
    item: '1. 성과측정지표의 측정시스템은 신뢰할 수 있다.',
    criterion: 'KPI의 측정시스템 분석 결과에 대한 판정을 제시한다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '측정시스템 신뢰성 양호(Acceptable) 판정 근거 명시.'
  },
  {
    id: 23,
    stage: '3. Analyze',
    procedure: '② 성과측정지표(KPI) 의 현수준 분석',
    item: '1. 성과측정지표의 현수준을 파악하였다. (관리상태, 정규분포, 공정능력분석)',
    criterion: 'KPI의 관리상태를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'I-MR 관리도 분석 결과 특이점 발생 시기 및 공정 변동성 확인.'
  },
  {
    id: 24,
    stage: '3. Analyze',
    procedure: '② 성과측정지표(KPI) 의 현수준 분석',
    item: '1. 성과측정지표의 현수준을 파악하였다. (관리상태, 정규분포, 공정능력분석)',
    criterion: 'KPI의 정규성을 검토한 결과를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Anderson-Darling 정규성 검정 P-value > 0.05 확인 완료.'
  },
  {
    id: 25,
    stage: '3. Analyze',
    procedure: '② 성과측정지표(KPI) 의 현수준 분석',
    item: '1. 성과측정지표의 현수준을 파악하였다. (관리상태, 정규분포, 공정능력분석)',
    criterion: 'KPI의 공정능력분석 결과를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '초기 공정능력 Cpk = 0.78 수준으로 개선 필요성 입증.'
  },
  {
    id: 26,
    stage: '3. Analyze',
    procedure: '③ QC도구를 활용한 잠재원인변수 도출',
    item: "1. 도출된 잠재원인변수(X's)는 구체적이며 타당하다.",
    criterion: 'KPI에 영향을 미칠 것으로 예상되는 잠재 원인 변수를 파악한 결과를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '특성요인도(Fishbone) 및 프로세스 맵핑을 통해 18개 잠재인자 발굴.'
  },
  {
    id: 27,
    stage: '3. Analyze',
    procedure: '③ QC도구를 활용한 잠재원인변수 도출',
    item: "1. 도출된 잠재원인변수(X's)는 구체적이며 타당하다.",
    criterion: '잠재 원인변수들에 대한 위험 우선순위 분석을 통해 잠재인자를 선정한 결과를 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: 'FMEA(고장유형영향분석)를 적용하여 위험우선순위(RPN) 산출 및 상위 7개 인자 압축.'
  },
  {
    id: 28,
    stage: '3. Analyze',
    procedure: '④ 빅데이터 분석을 통한 잠재원인변수 도출',
    item: '1. 빅데이터 분석기법을 활용하여 잠재원인변수를 도출한다.',
    criterion: '사용된 원천 테이블의 목록 및 정보를 제시한다.',
    points: 2,
    grade: '상',
    weight: 1.0,
    score: 2.0,
    reason: 'DX데이터플랫폼 kii_mfg 원천 히스토리안 데이터 테이블 4종 연계 정보 수록.'
  },
  {
    id: 29,
    stage: '3. Analyze',
    procedure: '④ 빅데이터 분석을 통한 잠재원인변수 도출',
    item: '1. 빅데이터 분석기법을 활용하여 잠재원인변수를 도출한다.',
    criterion: '복수의 분석 알고리즘 모델을 검토하여 선정한다.',
    points: 2,
    grade: '중',
    weight: 0.5,
    score: 1.0,
    reason: 'Random Forest 위주로 검토되었으며 XGBoost 및 LightGBM 간 앙상블 비교 보완 필요.'
  },
  {
    id: 30,
    stage: '3. Analyze',
    procedure: '④ 빅데이터 분석을 통한 잠재원인변수 도출',
    item: '1. 빅데이터 분석기법을 활용하여 잠재원인변수를 도출한다.',
    criterion: '모델 평가 지표를 선정한다.',
    points: 2,
    grade: '상',
    weight: 1.0,
    score: 2.0,
    reason: 'RMSE, R-squared 및 F1-Score 평가 기준 선정 완료.'
  },
  {
    id: 31,
    stage: '3. Analyze',
    procedure: '④ 빅데이터 분석을 통한 잠재원인변수 도출',
    item: '1. 빅데이터 분석기법을 활용하여 잠재원인변수를 도출한다.',
    criterion: '데이터셋을 분할한다.',
    points: 2,
    grade: '중',
    weight: 0.5,
    score: 1.0,
    reason: 'Train/Test 8:2 분할은 수행되었으나 시계열 특성을 반영한 롤링 윈도우 검증 보완 필요.'
  },
  {
    id: 32,
    stage: '3. Analyze',
    procedure: '④ 빅데이터 분석을 통한 잠재원인변수 도출',
    item: '1. 빅데이터 분석기법을 활용하여 잠재원인변수를 도출한다.',
    criterion: '각 모델을 평가하고 최적 모델을 선정한다.',
    points: 2,
    grade: '상',
    weight: 1.0,
    score: 2.0,
    reason: '검증 데이터셋에서 예측 정확도 91.3%를 달성한 최적 모델 채택.'
  },
  {
    id: 33,
    stage: '3. Analyze',
    procedure: '④ 빅데이터 분석을 통한 잠재원인변수 도출',
    item: '1. 빅데이터 분석기법을 활용하여 잠재원인변수를 도출한다.',
    criterion: '최적 모델로부터 잠재원인변수를 도출한다.',
    points: 5,
    grade: '상',
    weight: 1.0,
    score: 5.0,
    reason: 'SHAP(Shapley Additive exPlanations) 기여도 분석으로 상위 영향 인자 3종 도출.'
  },
  {
    id: 34,
    stage: '3. Analyze',
    procedure: '⑤ 즉개선 실시',
    item: '1. 선정된 잠재 인자 중 통계적 검증이 불필요한 항목은 즉개선을 실행하였다.',
    criterion: '즉 개선 대상으로 선정 된 잠재인자에 대해 개선을 실행하고 그 결과를 제시한다.',
    points: 1,
    grade: '하',
    weight: 0.0,
    score: 0.0,
    reason: '즉개선 항목에 대한 현장 청결도 점검 체크리스트 결과 기록이 누락됨.'
  },
  {
    id: 35,
    stage: '3. Analyze',
    procedure: '⑥ 잠재인자 유의성 검증 - 통계기법 활용',
    item: '1. 선정된 잠재 인자가 KPI에 대해 유의한지 적절한 통계 tool 을 적용하여 검정하였다.',
    criterion: '선정된 잠재 인자 중 우선순위가 높고 KPI에 미치는 효과가 유의한지 불확실한 잠재 인자에 대해 선정한 결과를 제시한다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '가설검정 대상 인자(풍속, 정전기, 롤 온도) 명확히 선정.'
  },
  {
    id: 36,
    stage: '3. Analyze',
    procedure: '⑥ 잠재인자 유의성 검증 - 통계기법 활용',
    item: '1. 선정된 잠재 인자가 KPI에 대해 유의한지 적절한 통계 tool 을 적용하여 검정하였다.',
    criterion: '해당 잠재 인자에 대해 통계적 분석을 통해 유의성 여부를 판단한 근거를 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: 'ANOVA 분산분석 및 다중회귀분석을 통해 P-value < 0.01로 유의성 입증.'
  },
  {
    id: 37,
    stage: '3. Analyze',
    procedure: '⑦ 잠재인자 유의성 검증 - 그 외 방법',
    item: '1. 선정된 잠재 인자 중 KPI에 유의한 영향을 미치는지 통계적 검증이 불가능한 경우 이론적, 경험적, 기술적 분석을 통해 검증을 대체할 수 있다.',
    criterion: '선정된 잠재 인자 중 우선순위가 높고 KPI에 미치는 효과가 유의한지 불확실한 잠재 인자에 대해 선정한 결과를 제시한다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '설비 기밀도 및 덕트 와류 현상에 대한 기술적 검토 대상 선정.'
  },
  {
    id: 38,
    stage: '3. Analyze',
    procedure: '⑦ 잠재인자 유의성 검증 - 그 외 방법',
    item: '1. 선정된 잠재 인자 중 KPI에 유의한 영향을 미치는지 통계적 검증이 불가능한 경우 이론적, 경험적, 기술적 분석을 통해 검증을 대체할 수 있다.',
    criterion: '해당 잠재 인자에 대해 이론적, 경험적 또는 기술적 분석을 통해 유의성 여부를 판단한 근거를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '기류 해석 시뮬레이션(CFD) 및 작업자 심층 인터뷰를 통한 기술적 판단 완료.'
  },
  {
    id: 39,
    stage: '3. Analyze',
    procedure: '⑦ 잠재인자 유의성 검증 - 그 외 방법',
    item: '1. 선정된 잠재 인자 중 KPI에 유의한 영향을 미치는지 통계적 검증이 불가능한 경우 이론적, 경험적, 기술적 분석을 통해 검증을 대체할 수 있다.',
    criterion: '유의한 것으로 판단 된 잠재 인자에 대해 치명인자로 선정된 판정 결과를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'T/up 측면부 외기 유입 와류를 치명인자(Vital Few)로 확정.'
  },
  {
    id: 40,
    stage: '3. Analyze',
    procedure: '⑧ 주요원인변수(치명인자) 선정',
    item: '1. 잠재인자에 대한 분석 결과를 바탕으로 주요 원인변수(=vital few, 치명인자)를 선정하였다.',
    criterion: '잠재 인자들이 KPI 미치는 효과가 유의한지 검토한 결과를 요약하여 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '통계적 검증 및 기술적 분석 결과를 종합 정리하여 최종 치명인자 2종 선정.'
  },

  // 4. Practice
  {
    id: 41,
    stage: '4. Practice',
    procedure: '① 주요원인변수(치명인자) 개선계획 수립',
    item: '1. (PDCA) 주요 원인변수 개선은 주요 원인변수 개선 계획을 수립하고 P-D-C-A 절차에 따라 실행하였다.',
    criterion: '각 주요 원인변수 개선은 P-D-C-A 절차에 따라 실행하며, 그 결과를 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: '치명인자별 세부 대책 수립 및 PDCA 사이클에 맞춘 실행 일정표 완비.'
  },
  {
    id: 42,
    stage: '4. Practice',
    procedure: '① 주요원인변수(치명인자) 개선계획 수립',
    item: '1. (PDCA) 주요 원인변수 개선은 주요 원인변수 개선 계획을 수립하고 P-D-C-A 절차에 따라 실행하였다.',
    criterion: '주요 원인변수 개선 계획을 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Air curtain 차압 설계 및 풍속 제어 계획서 제시.'
  },
  {
    id: 43,
    stage: '4. Practice',
    procedure: '② 주요원인변수(치명인자) 개선방안 도출',
    item: '1. (PDCA) 주요 원인변수 개선을 위한 아이디어는 충분히 도출되었다.',
    criterion: '주요 원인변수 개선을 위한 검토 자료를 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '벤치마킹 및 설비개선 브레인스토밍 아이디어 평가서 첨부.'
  },
  {
    id: 44,
    stage: '4. Practice',
    procedure: '③ 개선 방안에 대한 효과 검증',
    item: '1. (PDCA) 개선안 도출 및 결과 검증을 위한 적합한 통계 tool 을 적용하고 올바르게 해석하였다.',
    criterion: '주요 원인변수 개선을 위해 실험계획법을 통한 최적화 결과를 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: '반응표면분석(RSM) 실험계획법으로 최적 풍속 및 분사각도 조건 도출.'
  },
  {
    id: 45,
    stage: '4. Practice',
    procedure: '③ 개선 방안에 대한 효과 검증',
    item: '1. (PDCA) 개선안 도출 및 결과 검증을 위한 적합한 통계 tool 을 적용하고 올바르게 해석하였다.',
    criterion: '개선의 효과에 대해 적절한 검정을 실행한 결과를 제시하였다.',
    points: 2,
    grade: '상',
    weight: 1.0,
    score: 2.0,
    reason: '개선 전/후 2-Sample t-test 실행하여 유의한 불량 감소(P<0.001) 검증.'
  },
  {
    id: 46,
    stage: '4. Practice',
    procedure: '④ Pilot Test 에 대한 효과 검증',
    item: '1. (PDCA) 개선안에 대한 개선 효과를 검증하였고, 미흡한 사항은 보완되었다.',
    criterion: '주요 원인변수의 개선안을 검증하기 위한 Pilot test 를 실시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '1호기 시범 적용(2주간) 테스트 데이터 확보 완료.'
  },
  {
    id: 47,
    stage: '4. Practice',
    procedure: '④ Pilot Test 에 대한 효과 검증',
    item: '1. (PDCA) 개선안에 대한 개선 효과를 검증하였고, 미흡한 사항은 보완되었다.',
    criterion: 'Pilot test 결과에 대해 적절한 검정을 실시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '시범 생산 50 Lot 대상 결점 수 모니터링 분석 완료.'
  },
  {
    id: 48,
    stage: '4. Practice',
    procedure: '⑤ 개선 결과 분석',
    item: '1. 전체적인 개선 결과가 Goal 목표 달성에 기여하는 효과를 파악하였다.',
    criterion: '각 주요 원인 변수들의 개선 효과들이 Goal 목표 달성에 어떤 효과를 미쳤는지 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Air curtain 설치로 외부이물 0.60% -> 0.41% 감소하여 Goal 달성에 78% 기여함.'
  },
  {
    id: 49,
    stage: '4. Practice',
    procedure: '⑥ 유무형 효과 파악',
    item: '1. 유형의 재무성과 및 수반 비용에 대해 관계부서의 객관적 검증을 득하였다.',
    criterion: '유형의 재무성과를 산출하고 그 근거를 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: '원가관리팀 확인 연간 311백만원 유형 절감액 검증 확인서 첨부.'
  },
  {
    id: 50,
    stage: '4. Practice',
    procedure: '⑥ 유무형 효과 파악',
    item: '1. 유형의 재무성과 및 수반 비용에 대해 관계부서의 객관적 검증을 득하였다.',
    criterion: '재무성과 목표를 달성하였다.(100%:상, 50%이상:중)',
    points: 10,
    grade: '중',
    weight: 0.5,
    score: 5.0,
    reason: '현재 연간 누적 달성률 약 82% 수준으로 목표 달성(100%) 추이 모니터링 진행 중.'
  },
  {
    id: 51,
    stage: '4. Practice',
    procedure: '⑥ 유무형 효과 파악',
    item: '1. 유형의 재무성과 및 수반 비용에 대해 관계부서의 객관적 검증을 득하였다.',
    criterion: '재무성과 효과(1억이상:상, 0.5억 이상:중)',
    points: 10,
    grade: '상',
    weight: 1.0,
    score: 10.0,
    reason: '검증된 연간 순절감액 205백만원(수반비용 차감 후)으로 1억원 이상 기준 충족.'
  },
  {
    id: 52,
    stage: '4. Practice',
    procedure: '⑥ 유무형 효과 파악',
    item: '2. 무형의 성과를 구체적으로 기술하였다.',
    criterion: '무형 효과를 구체적으로 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '제막공정 클린룸 청정도 등급 개선(Class 10,000 -> Class 1,000) 및 작업환경 안전화.'
  },
  {
    id: 53,
    stage: '4. Practice',
    procedure: '⑦ 표준화 및 관리계획',
    item: '1. 개선과 관련된 회사표준은 개정(또는 제정) 되었다.(규격, 표준, 관리계획서)',
    criterion: '개선에 데한 표준화 문서(규격, 표준)의 표준명, 번호, 주요 변경 사항을 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: '사내 작업표준서(SOP-KPX-1028-04) 개정 및 관리기준 등록 완료.'
  },
  {
    id: 54,
    stage: '4. Practice',
    procedure: '⑦ 표준화 및 관리계획',
    item: '1. 개선과 관련된 회사표준은 개정(또는 제정) 되었다.(규격, 표준, 관리계획서)',
    criterion: '주요 원인변수의 관리를 위한 계획이 관리계획서로 작성 되었으며 그 결과가 제시되었다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Air curtain 필터 교체 주기(1회/월) 및 풍속 일상점검 관리계획서(QC Plan) 반영.'
  },
  {
    id: 55,
    stage: '4. Practice',
    procedure: '⑧ 공정적용 및 사후관리',
    item: '1. Goal 특성의 관리상태에 대해 개선 전/후 비교를 통해 검토하였다.',
    criterion: 'Goal 특성에 대해 개선 전과 개선 후의 관리도를 비교한 결과를 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: 'P-관리도 개선 전/후 비교 그래프 제시(불량률 중심선 1.99% -> 0.68%로 하향 안정화).'
  },
  {
    id: 56,
    stage: '4. Practice',
    procedure: '⑨ 과제활동 평가 및 보완',
    item: '1. 각 단계별 활동을 되돌아 보고 보완할 점을 검토하였다.',
    criterion: 'DGAP 각 단계 별 활동 평가를 통해 잘 된 점과 잘 되지 않았던 점들을 검토하고 앞으로 보완해야 할 점들을 제시하였다.',
    points: 1,
    grade: '상',
    weight: 1.0,
    score: 1.0,
    reason: 'Lesson Learned 정리 및 타 공정 롤 권취 라인 수평전개(Yokoten) 계획 수립.'
  },
  {
    id: 57,
    stage: '4. Practice',
    procedure: '⑩ 과제활동 요약',
    item: '1. 과제 활동 요약서를 작성하였다.',
    criterion: 'DGAP 각 단계별 과제 활동을 요약하여 제시하였다.',
    points: 3,
    grade: '상',
    weight: 1.0,
    score: 3.0,
    reason: 'DGAP 핵심 과제 추진 결과 1-Page Summary 작성 완료.'
  }
];

/* =========================================================================
   GUIDE & BEST PRACTICE DATA (AXAGE 과제정의 가이드)
   ========================================================================= */

const GUIDE_SECTIONS = [
  {
    id: 'attributes',
    title: '1. 과제의 속성 & KII 의미',
    summary: '과제는 목표가 있고, 기한을 정하여 실행하며, 해결책을 모르는 문제를 해결하는 활동입니다.',
    content: [
      '과제의 속성: 1) 목표를 가지고 있다, 2) 기한을 정하여 실행한다, 3) 해결책을 알지 못하는 문제를 포함하고 있다.',
      'KII 과제의 정의: 해결책을 알지 못하는 어떠한 문제 상황의 해결을 위해 목표와 기한을 구체적으로 정하여 실행하는 것.',
      '과제 실행의 목적: 재무적 성과 개선을 기본으로 추구하며, 비재무적 개선(프로세스, 학습/성장, 고객만족)도 동반합니다.',
      '개선의 대원칙: "측정할 수 없으면 개선할 수 없다." (측정 가능한 과제 정의 = 명확한 성과)'
    ]
  },
  {
    id: 'smart',
    title: '2. 목표 선정의 원칙 (SMART)',
    summary: 'Specific, Measurable, Achievable, Relevant, Time-bound 5대 원칙을 철저히 준수해야 합니다.',
    content: [
      'S (Specific): 과제의 범위는 너무 넓지 않게, 구체적으로 설정 (전략과제 3~5년을 분할하여 핵심과제 수준으로 구체화).',
      'M (Measurable): KPI는 측정 가능하도록 설정 (①정량적일 것, ②측정 방법/기준이 정의되어 있을 것, ③과거 측정 data를 확인할 수 있을 것).',
      'A (Achievable & Aggressive): 엔지니어의 경험을 바탕으로 현실적이면서 통계적으로 유의미한 변화를 달성하도록 설정.',
      'R (Relevant): 전사/사업부 경영방향 및 전략과제/목표와 연계되도록 정의.',
      'T (Time-bound): 과제 추진 기간이 길어질수록 성공 확률이 낮아지고 효율성이 저하되므로, 완료 기한을 명확히 제시.'
    ]
  },
  {
    id: 'naming',
    title: '3. 과제명 작성 공식 & 사례',
    summary: '과제명은 반드시 [대상공정(범위) + 개선 수단 + 목표 지표]로 구성되어야 합니다.',
    content: [
      '과제명 핵심 공식: 대상공정(범위) + 개선 수단 + 목표 지표',
      '🏆 우수 사례 (BP):',
      ' • 제막공정 이물 개선으로 부적합품률 감소 (구체적 단위공정 한정)',
      ' • 염화비닐 열분해 공정 운전조건 개선으로 불순물 함량 감소 (2019 은상)',
      ' • BPA 결정화 공정 증류공정 개선으로 생산손실량 감소 (2012 금상)',
      ' • 탈알코올폐수공정 공정 최적화로 스팀사용량 절감 (2008 금상)',
      ' • DFR AHU 운전 최적화로 스팀 사용량 절감',
      '❌ 권장되지 않는 사례 (지양):',
      ' • A제조라인 원료 변경 후 조업 안정화 (수단 및 목표 지표 모호)',
      ' • B고객 향 200ton급 판막 2만대 생산라인 구축 (단순 업무 구축형)',
      ' • C제품 원료투입비율 조정 통한 물성 개선 (목표 지표 불명확)'
    ]
  },
  {
    id: 'reason',
    title: '4. 과제선정 배경(문제점 기술) 작성법',
    summary: '과제선정 배경은 전략 및 부서 목표와의 연관성과 Q-cost 분석 등 정량적 통계를 포함해야 합니다.',
    content: [
      '🏆 우수 작성 예시:',
      ' "Q-cost 분석 결과, 내부실패비용이 전체 68.0%를 차지하여 가장 높은 비중을 차지함. 내부실패비용 감소를 23년 전략과제로 선정. 내부실패 비용을 세부 분석한 결과, 연내 개선 가능한 실패요인 中 부적합품 손실비 감소가 34.8%로 가장 높은 비중을 차지하여 CTQ로 선정되었음."',
      '❌ 지양할 사례:',
      ' "A공정 온도 최적화 기술 확보에 따른 원가절감" -> 과제의 필요성만 언급되고 전사 전략/팀 목표 및 Q-cost 실패비용과의 연계 근거가 결여됨.'
    ]
  },
  {
    id: 'kpi_rules',
    title: '5. 목표 및 재무성과 산출 가이드',
    summary: 'Goal은 최상위 핵심 지표, KPI는 선행/세부 인자이며 재무성과는 명확한 계산식이 있어야 합니다.',
    content: [
      'Goal 지표: 부적합품율, 종합 불량률, 단위 수율, 원단위 절감 등',
      '재무성과 계산 공식 필수:',
      ' • [개선 전 발생량 - 개선 후 발생량] = 절감량(ton/월)',
      ' • [절감량 × 단가(원/kg) × 12개월] = 연간 재무성과(원/년)',
      ' • 총 투입 비용(설비, 센서, Air curtain 등 투자비용) 명시'
    ]
  }
];

/* 우수사례 (BP) 풀 템플릿 */
const BP_SAMPLE: FormData = {
  taskType: '핵심과제',
  title: '제막공정 이물 개선으로 부적합품률 감소',
  processProduct: 'KPX1028 제막공정',
  manager: '김생산',
  managerDept: '생산1팀',
  participants: '이기술',
  participantsDept: '기술2팀',
  reason: 'Q-cost 분석 결과, 내부실패비용이 전체 68.0%를 차지하여 가장 높은 비중을 차지함. 내부실패비용 감소를 23년 전략과제로 선정. 내부실패 비용을 세부 분석한 결과, 연내 개선 가능한 실패요인 中 부적합품 손실비 감소가 34.8%로 가장 높은 비중을 차지하여 CTQ로 선정되었음.',
  improvementContent: '제막공정의 이물발생 원인을 규명하여 부적합품율을 개선',
  goalInputMode: 'direct',
  kpis: [
    { id: '1', type: 'Goal', name: '부적합품율(%)', currentLevel: '1.99', targetLevel: '0.72' },
    { id: '2', type: 'KPI_1', name: '외부이물(%)', currentLevel: '0.60', targetLevel: '0.45' },
    { id: '3', type: 'KPI_2', name: '횡방향결점(%)', currentLevel: '0.24', targetLevel: '0.17' },
    { id: '4', type: 'KPI_3', name: 'Scratch(%)', currentLevel: '0.15', targetLevel: '0.11' }
  ],
  financialBenefit: `▶ 205 백만원/년
-. 개선 후 이물에 의한 내부 부적합품 발생 절감량 : 개선 전(16.01ton/월) – 개선 후(7.95ton/월) = 8.06ton/월
-. 계산식 : 8.06(ton) × 3,219(원/kg) × 12(개월/년) = 311,496,192(원/년)`,
  qualitativeEffect: '제막공정 표준작업 개선 및 작업 환경 클린화',
  investmentCost: `▶ 총 투입 비용 : 106백만원
1) T/up 측면부 Air curtain 설치 (78백만원)
2) 이물 모니터링 고속 카메라 센서 도입 (28백만원)`,
  schedules: [
    { id: 's1', task: '현상파악 및 목표설정', milestone: '목표설정', months: [true, true, false, false, false, false, false, false, false, false] },
    { id: 's2', task: '데이터 확보 및 전처리', milestone: '데이터셋 확보', months: [false, true, true, false, false, false, false, false, false, false] },
    { id: 's3', task: '탐색적 분석 및 치명인자 선정', milestone: '치명인자 도출', months: [false, false, true, true, true, false, false, false, false, false] },
    { id: 's4', task: '개선방안 검토 및 개선실행', milestone: '개선효과 검증', months: [false, false, false, false, true, true, true, false, false, false] },
    { id: 's5', task: '개선안 실행 및 표준화', milestone: '성과파악', months: [false, false, false, false, false, false, true, true, true, true] }
  ]
};

/* DX 데이터플랫폼 데이터셋 (image.png 화면 100% 충실 재현) */
interface DXDataset {
  id: string;
  domain: string;
  sourceType: string;
  name: string;
  tableName: string;
  tag?: string;
  updatedAt: string;
  columns: { name: string; type: string; comment?: string }[];
  suggestedMetric: { name: string; current: string; target: string; unit: string; description: string };
}

const DX_DATASETS: DXDataset[] = [
  {
    id: 'dx_1',
    domain: 'Specialty소재사업본부 > 증착 (kii_mtl)',
    sourceType: 'Specialty소재사업본부',
    name: 'manual_tbl_mtl_vp5_len_pv_cond',
    tableName: 'manual_tbl_mtl_vp5_len_pv_cond',
    tag: '증착',
    updatedAt: '2026-09-28 14:20:10',
    columns: [
      { name: 'role_type', type: 'string', comment: '롤 유형 식별자' },
      { name: 'type_min_len', type: 'bigint', comment: '최소 권취 길이' },
      { name: 'type_max_len', type: 'bigint', comment: '최대 권취 길이' },
      { name: 'role_stage', type: 'string', comment: '공정 스테이지 단계' },
      { name: 'stage_min_len', type: 'bigint', comment: '단계별 최소길이' },
      { name: 'stage_max_len', type: 'bigint', comment: '단계별 최대길이' },
      { name: 'row_updated_at', type: 'timestamp', comment: '최종 동기화 일시' }
    ],
    suggestedMetric: {
      name: '증착 공정 부적합품율(%)',
      current: '2.15',
      target: '0.85',
      unit: '%',
      description: 'manual_tbl_mtl_vp5_len_pv_cond 데이터 기반 롤별 파라미터 제어 부적합품률 지표'
    }
  },
  {
    id: 'dx_2',
    domain: '(Sandbox) 공통 > Tableau 시각화 (kii_tableau_sb)',
    sourceType: '공통',
    name: '뷰_화면_전공정비 원가 차이분석_ZCOR3360_v260918_전사 제조원가 대시보드',
    tableName: 'vw_sap_view_zcor3360_v260918',
    updatedAt: '2026-09-18 09:12:00',
    columns: [
      { name: 'plant_cd', type: 'string', comment: '플랜트 코드' },
      { name: 'cost_center', type: 'string', comment: '코스트 센터' },
      { name: 'std_cost', type: 'decimal', comment: '표준 제조원가' },
      { name: 'act_cost', type: 'decimal', comment: '실적 제조원가' },
      { name: 'cost_diff', type: 'decimal', comment: '원가 차이금액' },
      { name: 'prod_qty', type: 'bigint', comment: '생산 수량' }
    ],
    suggestedMetric: {
      name: '제조원가 차이율(%)',
      current: '4.80',
      target: '1.50',
      unit: '%',
      description: 'ZCOR3360 제조원가 대시보드 실적 기준 원가 차이율 절감 지표'
    }
  },
  {
    id: 'dx_3',
    domain: '공통 > SAP 공통 (kii_sap)',
    sourceType: '공통',
    name: '화면_월별 투입계획 리포트',
    tableName: 'sap_view_1121_zppr7530',
    updatedAt: '2026-09-20 18:30:15',
    columns: [
      { name: 'plan_yyyymm', type: 'string', comment: '계획 연월' },
      { name: 'mat_code', type: 'string', comment: '원자재 코드' },
      { name: 'input_plan_ton', type: 'decimal', comment: '계획 투입량' },
      { name: 'actual_input_ton', type: 'decimal', comment: '실제 투입량' },
      { name: 'loss_rate', type: 'decimal', comment: '투입 손실률' }
    ],
    suggestedMetric: {
      name: '원자재 투입 손실률(%)',
      current: '3.40',
      target: '1.20',
      unit: '%',
      description: '월별 투입계획 대비 원자재 투입 손실률 지표'
    }
  },
  {
    id: 'dx_4',
    domain: '(Sandbox) 공통 > Tableau 시각화 (kii_tableau_sb)',
    sourceType: '공통',
    name: '뷰_CMS종합품질목표_v260928_종합 품질 실적',
    tableName: 'vw_csm_total_quality_ent_goal_v260928',
    updatedAt: '2026-09-28 17:05:44',
    columns: [
      { name: 'csm_line_id', type: 'string', comment: 'CSM 라인 ID' },
      { name: 'defect_cnt', type: 'bigint', comment: '결점 발생 건수' },
      { name: 'defect_rate_pct', type: 'decimal', comment: '결점률(%)' },
      { name: 'scrap_loss_ton', type: 'decimal', comment: '스크랩 손실량' },
      { name: 'target_defect_rate', type: 'decimal', comment: '목표 결점률' }
    ],
    suggestedMetric: {
      name: '부적합품율(%)',
      current: '1.99',
      target: '0.72',
      unit: '%',
      description: 'CMS종합품질목표 연동 부적합품률(%) 통합 지표'
    }
  },
  {
    id: 'dx_5',
    domain: 'Specialty소재사업본부 > 제막공정 (kii_mfg)',
    sourceType: 'Specialty소재사업본부',
    name: 'mfg_kpx1028_surface_defect_summary',
    tableName: 'mfg_kpx1028_surface_defect_summary',
    tag: '제막공정',
    updatedAt: '2026-09-25 11:45:00',
    columns: [
      { name: 'lot_no', type: 'string', comment: '제조 LOT 번호' },
      { name: 'foreign_particle_pct', type: 'decimal', comment: '외부이물 비율(%)' },
      { name: 'transverse_defect_pct', type: 'decimal', comment: '횡방향결점 비율(%)' },
      { name: 'scratch_defect_pct', type: 'decimal', comment: '스크래치 비율(%)' },
      { name: 'total_defect_pct', type: 'decimal', comment: '총 부적합품율(%)' }
    ],
    suggestedMetric: {
      name: '부적합품율(%)',
      current: '1.99',
      target: '0.72',
      unit: '%',
      description: 'KPX1028 제막공정 결점 분석 센서 데이터 기반 부적합품률 지표'
    }
  }
];

/* =========================================================================
   MAIN APP COMPONENT
   ========================================================================= */

export default function App() {
  // Navigation State (3 Screens)
  const [activeTab, setActiveTab] = useState<AppTab>('definition');

  // Screen 1: Form State
  const [formData, setFormData] = useState<FormData>(BP_SAMPLE);

  // Screen 1: Modals & Panels
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedGuideTopic, setSelectedGuideTopic] = useState('naming');
  const [isDXPlatformOpen, setIsDXPlatformOpen] = useState(false);
  const [selectedDXDatasetId, setSelectedDXDatasetId] = useState<string>('dx_1');
  const [dxSearchQuery, setDxSearchQuery] = useState('');
  const [activeDomainFilter, setActiveDomainFilter] = useState<string>('all');

  // Screen 1: Workflow / Review State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSupplementRequestOpen, setIsSupplementRequestOpen] = useState(false);
  const [isEditingSupplementRequest, setIsEditingSupplementRequest] = useState(false);
  const [supplementReport, setSupplementReport] = useState<SupplementReport | null>(null);
  const [supplementSentNotice, setSupplementSentNotice] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Screen 2: Execution Mentoring State
  const [executionRequest, setExecutionRequest] = useState<ExecutionMentoringRequest>({
    defineText: '과제 정의 단계에서 Q-cost 분석을 통해 도출한 부적합품 손실비 감소 목표(0.72%)의 타당성 및 제막 단위공정 한정 범위의 적절성에 대해 멘토링을 요청합니다.',
    goalSettingText: '최상위 Goal(CTQ-Y)인 부적합품율과 하위 성과측정지표(외부이물, 횡방향결점, Scratch) 간 가중치 부여 기준 및 연간 재무성과 계산식(311백만원/년)의 검증을 요청합니다.',
    analyzeText: '고속 카메라 AOI 계측 시스템의 Gage R&R 신뢰성 검토와 DX플랫폼 원천데이터(kii_mfg) 기반 Random Forest 알고리즘의 SHAP 변수 중요도 분석 결과의 치명인자 판정 근거를 검토해 주시기 바랍니다.',
    practiceText: 'T/up 측면부 Air curtain 최적 풍속 설계를 위한 반응표면분석(RSM) 실험계획법 결과와 파일럿 테스트 전후 2-Sample t-test 유의성 판정에 대해 멘토링 의견을 구합니다.',
    files: [
      { name: 'KPX1028_제막공정_원천데이터셋_분석.xlsx', size: '2.4 MB', date: '2026-10-08' },
      { name: '빅데이터_SHAP_변수중요도_분석보고서.pdf', size: '4.8 MB', date: '2026-10-09' },
      { name: 'Air_Curtain_설치설계도_및_RSM최적화.pdf', size: '3.1 MB', date: '2026-10-10' }
    ]
  });

  const [isConfirm2WeeksModalOpen, setIsConfirm2WeeksModalOpen] = useState(false);
  const [rubricData, setRubricData] = useState<RubricItem[]>(INITIAL_RUBRIC);
  const [isEmailReportModalOpen, setIsEmailReportModalOpen] = useState(false);
  const [emailActionNotice, setEmailActionNotice] = useState<string | null>(null);
  const [isEditingEmailReport, setIsEditingEmailReport] = useState(false);

  // Screen 3: Final Report State
  const [finalReportSubmission, setFinalReportSubmission] = useState<FinalReportSubmission>({
    executiveName: '김경영 부사장 (생산혁신본부장)',
    approvalDocTitle: '2026년도 제4차 경영전략회의 의결서 (Doc #KII-2026-EX-104)',
    signedDocScan: { name: '경영전략회의_의결서_임원서명_스캔본.pdf', size: '1.8 MB' },
    finalReportFile: { name: 'AXAGE_핵심과제_제막공정_이물개선_최종완료보고서.pdf', size: '12.4 MB' },
    summaryNote: '임원 서명 및 최종 성과 검증 완료 건으로, 연간 순재무효과 205백만원 검증 및 사내 표준 개정 완료되었습니다.'
  });

  const [isFinalEmailReportModalOpen, setIsFinalEmailReportModalOpen] = useState(false);
  const [finalEmailActionNotice, setFinalEmailActionNotice] = useState<string | null>(null);

  // Screen 1: Calculate completeness
  const isFormComplete = useMemo(() => {
    return Boolean(
      formData.title.trim() &&
      formData.processProduct.trim() &&
      formData.manager.trim() &&
      formData.managerDept.trim() &&
      formData.reason.trim() &&
      formData.improvementContent.trim() &&
      formData.kpis.length > 0 &&
      formData.kpis[0].name.trim() &&
      formData.kpis[0].targetLevel.trim() &&
      formData.financialBenefit.trim()
    );
  }, [formData]);

  // Total Rubric Score Calculation
  const totalRubricScore = useMemo(() => {
    return rubricData.reduce((acc, curr) => acc + curr.score, 0);
  }, [rubricData]);

  const maxRubricScore = 111;

  // Evaluate Screen 1 Charter against SMART criteria
  const evaluateCharter = (): EvaluationResult => {
    const feedbacks: FeedbackItem[] = [];
    let score = 100;

    const title = formData.title.trim();
    const hasTarget = /공정|라인|제품|모듈|성형|원료|DFR|AHU|KPX|BPA/i.test(title);
    const hasMeans = /개선|최적화|개발|조정|확보|도입|분석|제어/i.test(title);
    const hasMetric = /감소|절감|단축|향상|개선|원단위|부적합|손실/i.test(title);
    const hasProhibitedPattern = /구축$|안정화$|달성$/i.test(title);

    if (!hasTarget || !hasMeans || !hasMetric || hasProhibitedPattern) {
      score -= 25;
      feedbacks.push({
        fieldKey: 'title',
        fieldLabel: '과제명',
        severity: 'warning',
        comment: '과제명 공식 [대상공정(범위) + 개선 수단 + 목표 지표]가 충분히 반영되지 않았거나 지양할 표현(단순 구축/안정화)이 포함되어 있습니다.',
        recommendation: '예시: "카트리지 원심 성형 공정 개선으로 부적합품률 감소" 또는 "DFR AHU 운전 최적화로 스팀 사용량 절감"과 같이 대상, 수단, 목표 지표가 한눈에 보이도록 작성해 주세요.'
      });
    }

    const reason = formData.reason.trim();
    const hasStrategy = /전략|경영|본부|목표|CTQ|과제/i.test(reason);
    const hasQuantNumbers = /\d+%|\d+백만원|\d+억|Q-cost|비용|손실/i.test(reason);

    if (!hasStrategy || !hasQuantNumbers) {
      score -= 25;
      feedbacks.push({
        fieldKey: 'reason',
        fieldLabel: '선정 사유 (문제점 기술)',
        severity: 'warning',
        comment: '과제선정 배경에 전사/본부 전략목표와의 연계성 설명 또는 Q-cost/실패비용 등 정량적 수치 근거가 부족합니다.',
        recommendation: '우수 사례처럼 "Q-cost 분석 결과, 내부실패비용 중 OO%를 차지하여 전략과제로 선정하였으며, 연내 개선 가능한 실패요인 중 부적합품 손실비 감소가 OO%로 가장 높아 CTQ로 선정함" 형태로 보강해 주세요.'
      });
    }

    const goalKpi = formData.kpis.find((k) => k.type === 'Goal');
    if (!goalKpi || !goalKpi.name.trim() || !goalKpi.currentLevel.trim() || !goalKpi.targetLevel.trim()) {
      score -= 20;
      feedbacks.push({
        fieldKey: 'kpis',
        fieldLabel: '목표 (Goal)',
        severity: 'warning',
        comment: '최상위 핵심 Goal 지표와 현수준 및 목표치가 명확히 입력되지 않았습니다.',
        recommendation: '정량적 지표명(예: 부적합품율(%), 스팀 원단위 등)과 함께 현재 실적치(현수준) 및 현실적이면서 도전적인 목표치를 명시해 주세요.'
      });
    }

    const benefit = formData.financialBenefit.trim();
    const hasFormula = /계산식|×|\*|-|월|년|절감량|원\/kg|백만원/i.test(benefit);
    if (!hasFormula) {
      score -= 20;
      feedbacks.push({
        fieldKey: 'financialBenefit',
        fieldLabel: '예상 유형 재무성과(백만원/년)',
        severity: 'warning',
        comment: '재무성과 산출의 객관적 계산식(절감량 × 단가 × 12개월 등)이 누락되었습니다.',
        recommendation: '가이드 원칙에 따라 "[개선 전 발생량 - 개선 후 발생량 = 절감량(ton/월)] × [단가(원/kg)] × 12개월 = 연간 절감액" 산출식을 투명하게 기술해 주세요.'
      });
    }

    const passed = feedbacks.length === 0;

    return {
      passed,
      score: Math.max(score, 0),
      feedbacks,
      summary: passed
        ? '축하합니다! AXAGE 과제정의서 작성 가이드(SMART 원칙 및 우수 사례 기준)를 모두 완벽하게 충족하였습니다.'
        : `가이드 기준 검토 결과 총 ${feedbacks.length}건의 보완 권장사항이 도출되었습니다. 내용을 확인하고 보완을 진행해 주세요.`
    };
  };

  // Screen 1: Action handlers
  const handleCompleteAndGetFeedback = () => {
    const result = evaluateCharter();
    setEvaluationResult(result);

    const items: SupplementItem[] = result.feedbacks.map((fb, idx) => {
      let currentVal = '';
      if (fb.fieldKey === 'title') currentVal = formData.title;
      else if (fb.fieldKey === 'reason') currentVal = formData.reason;
      else if (fb.fieldKey === 'kpis') {
        const g = formData.kpis.find((k) => k.type === 'Goal');
        currentVal = g ? `${g.name} (현수준: ${g.currentLevel} / 목표: ${g.targetLevel})` : '-';
      } else if (fb.fieldKey === 'financialBenefit') currentVal = formData.financialBenefit;
      else if (fb.fieldKey === 'schedules') currentVal = formData.schedules.map((s) => s.task).join(', ');
      else currentVal = '-';

      return {
        id: `item_${idx}`,
        fieldKey: fb.fieldKey,
        fieldLabel: fb.fieldLabel,
        currentContent: currentVal,
        reason: fb.comment,
        recommendation: fb.recommendation
      };
    });

    if (items.length === 0) {
      items.push({
        id: 'item_none',
        fieldKey: 'general',
        fieldLabel: '종합 진단',
        currentContent: '가이드 기준 충족 완료',
        reason: '주요 검토 기준(과제명 3요소, SMART 목표, 재무성과 산출식 등)을 모두 우수하게 작성하였습니다.',
        recommendation: '보완 사항 없음. 결재 상신을 권장합니다.'
      });
    }

    setSupplementReport({
      docNo: `AXAGE-REV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      createdDate: new Date().toLocaleDateString('ko-KR'),
      sender: 'AX Innovation 센터 AX기획팀 / 과제심의담당',
      receiver: `${formData.manager || '과제담당자'} (${formData.managerDept || '담당부서'})`,
      projectTitle: formData.title || '과제명 미정',
      processProduct: formData.processProduct || '-',
      overallOpinion: result.passed
        ? '본 과제기술서는 SMART 원칙 및 AXAGE 작성 가이드를 우수하게 충족하여 보완 요청 사항이 없습니다.'
        : `제출된 과제기술서 검토 결과, 총 ${items.length}건에 대해 가이드 기준에 따른 보완이 필요하여 본 보완요청서를 발송합니다. 아래 상세 보완 의견을 참고하여 수정 후 재상신해 주시기 바랍니다.`,
      items
    });

    setIsEditingSupplementRequest(false);
    setIsSupplementRequestOpen(true);
  };

  const handleSendSupplementRequest = () => {
    if (supplementReport && evaluationResult) {
      const updatedFeedbacks = supplementReport.items
        .filter((it) => it.fieldKey !== 'general')
        .map((it) => ({
          fieldKey: it.fieldKey,
          fieldLabel: it.fieldLabel,
          severity: 'warning' as const,
          comment: it.reason,
          recommendation: it.recommendation
        }));
      if (updatedFeedbacks.length > 0) {
        setEvaluationResult({
          ...evaluationResult,
          feedbacks: updatedFeedbacks,
          summary: supplementReport.overallOpinion
        });
      }
    }

    setIsSupplementRequestOpen(false);
    setIsEditingSupplementRequest(false);
    setSupplementSentNotice(`${formData.manager || '과제작성자'} 님에게 보완요청서가 발송되었습니다.`);

    setTimeout(() => {
      setIsFeedbackModalOpen(true);
      setSupplementSentNotice(null);
    }, 400);
  };

  const handleStartRevision = () => {
    setIsFeedbackModalOpen(false);
    setIsRevisionMode(true);
  };

  const handleSubmitApproval = () => {
    setIsFeedbackModalOpen(false);
    setIsPreviewModalOpen(true);
  };

  const handleQuickApproval = () => {
    setIsPreviewModalOpen(true);
  };

  const handleConfirmFinalSubmit = () => {
    setIsPreviewModalOpen(false);
    setSubmittedMessage('과제정의서를 상신하였습니다.');
  };

  const handleApplyDXDataset = (dataset: DXDataset) => {
    setFormData((prev) => {
      const updatedKpis = [...prev.kpis];
      const goalIndex = updatedKpis.findIndex((k) => k.type === 'Goal');
      const newGoal: KPIRow = {
        id: goalIndex >= 0 ? updatedKpis[goalIndex].id : 'goal-1',
        type: 'Goal',
        name: dataset.suggestedMetric.name,
        currentLevel: dataset.suggestedMetric.current,
        targetLevel: dataset.suggestedMetric.target
      };
      if (goalIndex >= 0) {
        updatedKpis[goalIndex] = newGoal;
      } else {
        updatedKpis.unshift(newGoal);
      }
      return {
        ...prev,
        goalInputMode: 'dx_platform',
        kpis: updatedKpis
      };
    });
    setIsDXPlatformOpen(false);
  };

  const handleLoadBPSample = () => {
    setFormData(BP_SAMPLE);
    setIsRevisionMode(false);
    setEvaluationResult(null);
  };

  // Screen 2: Apply for Mentoring
  const handleApplyMentoringClick = () => {
    setIsConfirm2WeeksModalOpen(true);
  };

  const handleConfirmMentoringApplication = () => {
    setIsConfirm2WeeksModalOpen(false);
    setIsEmailReportModalOpen(true);
  };

  // Screen 2 & 3: Rubric Score update
  const handleRubricGradeChange = (id: number, newGrade: RubricGrade) => {
    setRubricData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const weight = newGrade === '상' ? 1.0 : newGrade === '중' ? 0.5 : 0.0;
          return {
            ...item,
            grade: newGrade,
            weight,
            score: Math.round(item.points * weight * 10) / 10
          };
        }
        return item;
      })
    );
  };

  const handleRubricReasonChange = (id: number, newReason: string) => {
    setRubricData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reason: newReason } : item))
    );
  };

  // Screen 2: Email Mentoring Actions
  const handleEmailReportSave = () => {
    setIsEditingEmailReport(false);
    setEmailActionNotice('수정되었습니다.');
    setTimeout(() => setEmailActionNotice(null), 3000);
  };

  const handleEmailReportSend = () => {
    setIsEmailReportModalOpen(false);
    setEmailActionNotice('발송되었습니다');
    setTimeout(() => setEmailActionNotice(null), 3500);
  };

  // Screen 3: Final Report Actions
  const handleFinalReportAnalyze = () => {
    setIsFinalEmailReportModalOpen(true);
  };

  const handleFinalEmailReportSave = () => {
    setFinalEmailActionNotice('수정되었습니다.');
    setTimeout(() => setFinalEmailActionNotice(null), 3000);
  };

  const handleFinalEmailReportSend = () => {
    setIsFinalEmailReportModalOpen(false);
    setFinalEmailActionNotice('발송되었습니다');
    setTimeout(() => setFinalEmailActionNotice(null), 3500);
  };

  // Filtered DX datasets in modal
  const filteredDXDatasets = useMemo(() => {
    return DX_DATASETS.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(dxSearchQuery.toLowerCase()) ||
        item.tableName.toLowerCase().includes(dxSearchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(dxSearchQuery.toLowerCase());
      const matchDomain =
        activeDomainFilter === 'all' || item.sourceType.includes(activeDomainFilter);
      return matchSearch && matchDomain;
    });
  }, [dxSearchQuery, activeDomainFilter]);

  const selectedDXDataset = useMemo(() => {
    return DX_DATASETS.find((d) => d.id === selectedDXDatasetId) || DX_DATASETS[0];
  }, [selectedDXDatasetId]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* -------------------------------------------------------------
          TOP GLOBAL HEADER & 3-SCREEN NAVIGATION BAR
          ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              AX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AX Innovation 센터
                </span>
                <span className="text-xs text-slate-500">AXAGE 과제 토털 멘토링 포털</span>
              </div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {activeTab === 'definition' && 'AXAGE 과제정의 멘토링'}
                {activeTab === 'execution' && 'AXAGE 과제 실행 멘토링'}
                {activeTab === 'final_report' && '최종 보고서 완료 및 승인'}
              </h1>
            </div>
          </div>

          {/* Navigation Tabs (3 Screens) */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('definition')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'definition'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. AXAGE 과제정의 멘토링</span>
            </button>
            <button
              onClick={() => setActiveTab('execution')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'execution'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>2. AXAGE 과제 실행 멘토링</span>
            </button>
            <button
              onClick={() => setActiveTab('final_report')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'final_report'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. 최종 보고서 완료 및 승인</span>
            </button>
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'definition' && (
              <>
                <button
                  onClick={() => {
                    setIsGuideOpen(true);
                    setSelectedGuideTopic('attributes');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>작성 가이드</span>
                </button>
                <button
                  onClick={handleLoadBPSample}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>우수사례(BP)</span>
                </button>
              </>
            )}
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              담당: {formData.manager} ({formData.managerDept})
            </div>
          </div>
        </div>
      </header>

      {/* Action Notification Toasts */}
      {emailActionNotice && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{emailActionNotice}</span>
        </div>
      )}

      {finalEmailActionNotice && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{finalEmailActionNotice}</span>
        </div>
      )}

      {/* =============================================================
          SCREEN 1: AXAGE 과제정의 멘토링
          ============================================================= */}
      {activeTab === 'definition' && (
        <div className="flex-1 flex flex-col">
          {/* Revision Mode Banner */}
          {isRevisionMode && evaluationResult && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900">
                    과제정의서 보완 피드백 안내 ({evaluationResult.feedbacks.length}건):
                  </span>
                  <span className="text-xs text-amber-800">
                    주황색 표시 항목을 가이드 기준에 맞춰 수정 후 하단의 [작성완료 및 피드백 받기]를 눌러주세요.
                  </span>
                </div>
                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="text-xs font-semibold text-amber-900 underline hover:text-amber-700 shrink-0 px-2 py-0.5 bg-amber-100 rounded border border-amber-300"
                >
                  피드백 상세 보기
                </button>
              </div>
            </div>
          )}

          {/* Main Charter Paper */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
              {/* Document Header Bar */}
              <div className="border-b border-slate-300 px-6 py-3 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                    대외비 (Confidential)
                  </span>
                  <span className="text-xs text-slate-500 font-mono">[첨부2]</span>
                </div>
                <div className="text-xs text-slate-500">
                  작성일자: {new Date().toLocaleDateString('ko-KR')}
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Title Row with Approval Stamp Box */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      AXAGE 과제 기술서
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      데이터 기반 AXAGE 혁신 과제 상세 정의 및 추진 계획서
                    </p>
                  </div>

                  {/* 결재란 (작성 / 검토 / 승인) */}
                  <div className="shrink-0 border border-slate-400 bg-white text-xs text-center shadow-xs">
                    <table className="w-56 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-400">
                          <th className="py-1 px-3 border-r border-slate-400 font-semibold w-1/3">작 성</th>
                          <th className="py-1 px-3 border-r border-slate-400 font-semibold w-1/3">검 토</th>
                          <th className="py-1 px-3 font-semibold w-1/3">승 인</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="h-12 text-slate-400">
                          <td className="border-r border-slate-400 align-middle">
                            {submittedMessage ? (
                              <div className="text-blue-800 font-bold text-[11px] leading-tight flex flex-col items-center">
                                <span>{formData.manager || '김생산'}</span>
                                <span className="text-[10px] text-blue-600">(상신완료)</span>
                              </div>
                            ) : (
                              <span className="italic text-[11px]">작성중</span>
                            )}
                          </td>
                          <td className="border-r border-slate-400 align-middle">
                            <span className="text-[10px]">/</span>
                          </td>
                          <td className="align-middle">
                            <span className="text-[10px]">/</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 과제 유형 선택 라디오 그룹 (핵심과제 / 사업이슈과제 / 퀵윈과제) */}
                <div className="bg-slate-50 border border-slate-300 rounded-md p-3 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      과제 구분 :
                    </span>
                    <div className="flex items-center gap-5">
                      {(['핵심과제', '사업이슈과제', '퀵윈과제'] as TaskType[]).map((type) => (
                        <label
                          key={type}
                          className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer text-slate-800 hover:text-blue-700"
                        >
                          <input
                            type="radio"
                            name="taskType"
                            value={type}
                            checked={formData.taskType === type}
                            onChange={() => setFormData({ ...formData, taskType: type })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    {formData.taskType === '핵심과제' ? (
                      <span>핵심과제는 SMART 원칙에 기반한 <strong>보완요청서 및 피드백 루프</strong>가 적용됩니다.</span>
                    ) : (
                      <span>{formData.taskType}는 작성 완료 즉시 <strong>확인 및 결재 상신</strong>이 가능합니다.</span>
                    )}
                  </div>
                </div>

                {/* Table Form Fields */}
                <div className="border border-slate-400 rounded-none overflow-hidden text-sm">
                  {/* Row 1: 과제명 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                    <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        과제명
                        <span className="text-rose-500">*</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGuideOpen(true);
                          setSelectedGuideTopic('naming');
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="md:col-span-10 p-2 space-y-1.5">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="대상공정(범위) + 개선 수단 + 목표 지표 (예: 제막공정 이물 개선으로 부적합품률 감소)"
                        className={`w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isRevisionMode && evaluationResult?.feedbacks.some((f) => f.fieldKey === 'title')
                            ? 'border-amber-500 bg-amber-50/50'
                            : 'border-slate-300'
                        }`}
                      />
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="font-semibold text-blue-700">작성 공식:</span>
                        <span>대상공정(범위) + 개선 수단 + 목표 지표</span>
                        <span className="text-slate-400">|</span>
                        <span>예: BPA 결정화 공정 증류공정 개선으로 생산손실량 감소</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 대상공정 & 담당자 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                    <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex items-center">
                      <span>대상공정(프로세스) / 대상제품 <span className="text-rose-500">*</span></span>
                    </div>
                    <div className="md:col-span-4 p-2 border-r border-slate-300">
                      <input
                        type="text"
                        value={formData.processProduct}
                        onChange={(e) => setFormData({ ...formData, processProduct: e.target.value })}
                        placeholder="예: KPX1028 제막공정"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div className="md:col-span-6 grid grid-cols-2 divide-x divide-slate-300">
                      <div className="p-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 w-16">과제담당자:</span>
                          <input
                            type="text"
                            value={formData.manager}
                            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 w-16">담당부서:</span>
                          <input
                            type="text"
                            value={formData.managerDept}
                            onChange={(e) => setFormData({ ...formData, managerDept: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 w-16">과제참여자:</span>
                          <input
                            type="text"
                            value={formData.participants}
                            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 w-16">참여부서:</span>
                          <input
                            type="text"
                            value={formData.participantsDept}
                            onChange={(e) => setFormData({ ...formData, participantsDept: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: 선정 사유 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                    <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex flex-col justify-between">
                      <div>
                        <span>선정 사유 <span className="text-rose-500">*</span></span>
                        <span className="text-xs font-normal text-slate-500 block">(문제점 기술)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGuideOpen(true);
                          setSelectedGuideTopic('reason');
                        }}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>가이드</span>
                      </button>
                    </div>
                    <div className="md:col-span-10 p-2 space-y-1.5">
                      <textarea
                        rows={3}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="전략 및 부서 목표와의 연관성과 Q-cost 분석 등 정량적 수치를 포함하여 작성"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 4: 개선 내용 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                    <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex items-center">
                      <span>개선 내용 <span className="text-rose-500">*</span></span>
                    </div>
                    <div className="md:col-span-10 p-2">
                      <input
                        type="text"
                        value={formData.improvementContent}
                        onChange={(e) => setFormData({ ...formData, improvementContent: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 5: 목표 및 재무성과 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                    <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex flex-col justify-between">
                      <div>
                        <span>목표 <span className="text-rose-500">*</span></span>
                        <span className="text-xs font-normal text-slate-500 block">(Goal &amp; KPI)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGuideOpen(true);
                          setSelectedGuideTopic('kpi_rules');
                        }}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>SMART 원칙</span>
                      </button>
                    </div>

                    <div className="md:col-span-10 p-3 space-y-3">
                      {/* Goal 입력 방식 토글 바 */}
                      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-700">Goal 작성 방식:</span>
                          <div className="inline-flex rounded-md shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, goalInputMode: 'dx_platform' });
                                setIsDXPlatformOpen(true);
                              }}
                              className={`px-3 py-1 text-xs font-semibold rounded-l-md border flex items-center gap-1.5 transition-colors ${
                                formData.goalInputMode === 'dx_platform'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <Database className="w-3.5 h-3.5" />
                              <span>DX데이터플랫폼에서 가져오기</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, goalInputMode: 'direct' })}
                              className={`px-3 py-1 text-xs font-semibold rounded-r-md border border-l-0 transition-colors ${
                                formData.goalInputMode === 'direct'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>직접 입력하기</span>
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsDXPlatformOpen(true)}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>DX데이터플랫폼 데이터셋 ({DX_DATASETS.length}개)</span>
                        </button>
                      </div>

                      {/* KPI Table & Financial Benefit */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-7 border border-slate-300 rounded overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                              <tr>
                                <th className="py-2 px-3 w-20 border-r border-slate-300">목표 구분</th>
                                <th className="py-2 px-3 border-r border-slate-300">지표명</th>
                                <th className="py-2 px-3 w-20 border-r border-slate-300 text-center">현수준</th>
                                <th className="py-2 px-3 w-20 text-center">목표</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {formData.kpis.map((kpi, idx) => (
                                <tr key={kpi.id} className={kpi.type === 'Goal' ? 'bg-blue-50/40 font-medium' : 'bg-white'}>
                                  <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-800">
                                    {kpi.type}
                                  </td>
                                  <td className="py-1 px-2 border-r border-slate-300">
                                    <input
                                      type="text"
                                      value={kpi.name}
                                      onChange={(e) => {
                                        const updated = [...formData.kpis];
                                        updated[idx].name = e.target.value;
                                        setFormData({ ...formData, kpis: updated });
                                      }}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                    />
                                  </td>
                                  <td className="py-1 px-2 border-r border-slate-300">
                                    <input
                                      type="text"
                                      value={kpi.currentLevel}
                                      onChange={(e) => {
                                        const updated = [...formData.kpis];
                                        updated[idx].currentLevel = e.target.value;
                                        setFormData({ ...formData, kpis: updated });
                                      }}
                                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs text-center"
                                    />
                                  </td>
                                  <td className="py-1 px-2">
                                    <input
                                      type="text"
                                      value={kpi.targetLevel}
                                      onChange={(e) => {
                                        const updated = [...formData.kpis];
                                        updated[idx].targetLevel = e.target.value;
                                        setFormData({ ...formData, kpis: updated });
                                      }}
                                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs text-center font-bold text-blue-700"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="lg:col-span-5 border border-slate-300 rounded p-2.5 flex flex-col justify-between bg-slate-50/50">
                          <div>
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="text-xs font-bold text-slate-800">
                                예상 유형 재무성과 (백만원/년) <span className="text-rose-500">*</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">연간 산출식</span>
                            </div>
                            <textarea
                              rows={4}
                              value={formData.financialBenefit}
                              onChange={(e) => setFormData({ ...formData, financialBenefit: e.target.value })}
                              className="w-full mt-2 px-2 py-1.5 border rounded text-xs font-mono leading-relaxed bg-white border-slate-300"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Qualitative & Investment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="border border-slate-300 rounded p-2 bg-white">
                          <div className="text-xs font-bold text-slate-700 mb-1">정성적 효과</div>
                          <input
                            type="text"
                            value={formData.qualitativeEffect}
                            onChange={(e) => setFormData({ ...formData, qualitativeEffect: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div className="border border-slate-300 rounded p-2 bg-white">
                          <div className="text-xs font-bold text-slate-700 mb-1">투자비용 (설비 등)</div>
                          <input
                            type="text"
                            value={formData.investmentCost}
                            onChange={(e) => setFormData({ ...formData, investmentCost: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 6: 추진일정 */}
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex flex-col justify-between">
                      <div>
                        <span>추진일정 <span className="text-rose-500">*</span></span>
                        <span className="text-xs font-normal text-slate-500 block">(3월 ~ 12월)</span>
                      </div>
                    </div>

                    <div className="md:col-span-10 p-3 overflow-x-auto">
                      <table className="w-full text-xs border border-slate-300 border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                            <th className="py-2 px-3 border-r border-slate-300 w-44 text-left">세부추진항목</th>
                            <th className="py-2 px-3 border-r border-slate-300 w-28 text-left">세부목표</th>
                            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                              <th key={m} className="py-1 px-1 border-r border-slate-300 last:border-r-0 text-center font-mono w-8">
                                {m}월
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {formData.schedules.map((row, rIdx) => (
                            <tr key={row.id} className="hover:bg-slate-50/70">
                              <td className="p-1 border-r border-slate-300">
                                <input
                                  type="text"
                                  value={row.task}
                                  onChange={(e) => {
                                    const updated = [...formData.schedules];
                                    updated[rIdx].task = e.target.value;
                                    setFormData({ ...formData, schedules: updated });
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-transparent rounded hover:border-slate-300"
                                />
                              </td>
                              <td className="p-1 border-r border-slate-300">
                                <input
                                  type="text"
                                  value={row.milestone}
                                  onChange={(e) => {
                                    const updated = [...formData.schedules];
                                    updated[rIdx].milestone = e.target.value;
                                    setFormData({ ...formData, schedules: updated });
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-transparent rounded hover:border-slate-300"
                                />
                              </td>
                              {row.months.map((active, mIdx) => (
                                <td
                                  key={mIdx}
                                  onClick={() => {
                                    const updated = [...formData.schedules];
                                    updated[rIdx].months[mIdx] = !updated[rIdx].months[mIdx];
                                    setFormData({ ...formData, schedules: updated });
                                  }}
                                  className="border-r border-slate-300 last:border-r-0 text-center cursor-pointer p-0 hover:bg-blue-50"
                                >
                                  <div className="h-7 flex items-center justify-center">
                                    {active ? (
                                      <div className="w-full h-4 bg-blue-600 rounded-2xs mx-0.5 shadow-2xs"></div>
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    )}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-3">
                  본 문서는 영업상 주요 자산으로서 부정경쟁방지 및 영업비밀보호에 관한 법률에 따라 보호되는 중요한 정보를 포함하고 있습니다.
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="border-t border-slate-300 bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">작성 상태:</span>
                  {isFormComplete ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      필수 항목 작성 완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      <Info className="w-3.5 h-3.5" />
                      필수 항목 작성 중
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {(formData.taskType === '사업이슈과제' || formData.taskType === '퀵윈과제') && (
                    <button
                      type="button"
                      disabled={!isFormComplete}
                      onClick={handleQuickApproval}
                      className={`px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 shadow-xs transition-all ${
                        isFormComplete
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>확인 및 결재 상신</span>
                    </button>
                  )}

                  {formData.taskType === '핵심과제' && (
                    <>
                      <button
                        type="button"
                        disabled={!isFormComplete}
                        onClick={handleCompleteAndGetFeedback}
                        className={`px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 shadow-xs transition-all ${
                          isFormComplete
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-98'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>작성완료 및 피드백 받기</span>
                      </button>

                      {evaluationResult?.passed && (
                        <button
                          type="button"
                          onClick={handleSubmitApproval}
                          className="px-5 py-2.5 rounded-md font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>결재상신하기</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* =============================================================
          SCREEN 2: AXAGE 과제 실행 멘토링
          ============================================================= */}
      {activeTab === 'execution' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
          {/* 상단 필수 안내문구 (요구사항 반영) */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 shadow-xs flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>과제실행 멘토링 사전 안내사항</span>
              </h4>
              <p className="text-sm font-bold text-amber-900 leading-snug">
                "멘토링은 첨부된 보고서를 바탕으로 실행됩니다. 지금까지 작성 된 보고서를 반드시 첨부해 주시기 바랍니다."
              </p>
              <p className="text-xs text-amber-800">
                각 단계별(DGAP) 서술형 요청 내용과 함께 추진 결과 문서 및 데이터 분석 파일을 하단의 [파일 첨부하기] 영역에 등록해 주세요.
              </p>
            </div>
          </div>

          {/* Header Banner */}
          <div className="bg-white rounded-lg p-6 border border-slate-300 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                  실행 멘토링
                </span>
                <span className="text-xs text-slate-500 font-mono">연계 과제: {formData.title}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                AXAGE 과제 실행 멘토링
              </h2>
              <p className="text-xs text-slate-600">
                과제정의가 완료된 과제의 실행 과정(Define-Goal-Analyze-Practice)에 대해 분석적 루브릭을 기반으로 멘토링 보고서를 생성하고 피드백을 수신합니다.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs space-y-1 text-slate-700 min-w-[240px]">
              <div><strong>담당자:</strong> {formData.manager} ({formData.managerDept})</div>
              <div><strong>대상공정:</strong> {formData.processProduct}</div>
              <div><strong>진행상태:</strong> 실행 멘토링 접수 가능</div>
            </div>
          </div>

          {/* 4-Stage Mentoring Narrative Request Sections (Define, Goal-setting, Analyze, Practice) */}
          <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>DGAP 4단계별 멘토링 요청 서술 (작성자 입력)</span>
              </h3>
              <span className="text-xs text-slate-500">
                각 단계별 진행 상황과 자문받고자 하는 핵심 이슈를 서술형으로 작성해 주세요.
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Define */}
              <div className="space-y-2 border border-slate-200 rounded-md p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    1. Define (정의 단계)
                  </span>
                  <span className="text-[11px] text-slate-500">배점 2점</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  전략과제 연계성, CTQ 우선순위 도출 및 과제 선정 적합성에 관한 멘토링 요청
                </p>
                <textarea
                  rows={4}
                  value={executionRequest.defineText}
                  onChange={(e) => setExecutionRequest({ ...executionRequest, defineText: e.target.value })}
                  placeholder="Define 단계에서 자문이 필요한 배경 및 문제점 정의 사항을 서술해 주세요."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 2. Goal-setting */}
              <div className="space-y-2 border border-slate-200 rounded-md p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    2. Goal-setting (목표 설정 단계)
                  </span>
                  <span className="text-[11px] text-slate-500">배점 30점</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Goal(CTQ-Y) 특성 및 도전 목표치 근거, KPI 정의, 재무성과(연간 기대효과) 산출
                </p>
                <textarea
                  rows={4}
                  value={executionRequest.goalSettingText}
                  onChange={(e) => setExecutionRequest({ ...executionRequest, goalSettingText: e.target.value })}
                  placeholder="Goal 및 성과측정지표(KPI) 설정과 재무성과 산출식 검증 요청사항을 입력해 주세요."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 3. Analyze */}
              <div className="space-y-2 border border-slate-200 rounded-md p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    3. Analyze (분석 단계)
                  </span>
                  <span className="text-[11px] text-slate-500">배점 33점</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  측정시스템 분석(Gage R&R), QC도구/빅데이터 알고리즘 잠재인자 발굴, 치명인자 유의성 검증
                </p>
                <textarea
                  rows={4}
                  value={executionRequest.analyzeText}
                  onChange={(e) => setExecutionRequest({ ...executionRequest, analyzeText: e.target.value })}
                  placeholder="데이터 분석, 모델링, ANOVA/회귀분석 및 치명인자 판정 과정에서의 멘토링 요청사항을 작성해 주세요."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 4. Practice */}
              <div className="space-y-2 border border-slate-200 rounded-md p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    4. Practice (실행 및 개선 단계)
                  </span>
                  <span className="text-[11px] text-slate-500">배점 46점</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  P-D-C-A 실행, 실험계획법 최적화, Pilot Test, 재무성과 달성도, 표준화 및 사후관리
                </p>
                <textarea
                  rows={4}
                  value={executionRequest.practiceText}
                  onChange={(e) => setExecutionRequest({ ...executionRequest, practiceText: e.target.value })}
                  placeholder="개선안 실행, 통계적 효과 검증, 유무형 효과 파악 및 표준화 계획 관련 멘토링 요청사항을 작성해 주세요."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* File Attachment Section */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-slate-600" />
                  <span>지금까지 작성된 파일 첨부하기 (분석 데이터, 보고서, 도면 등)</span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>파일 추가하기</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setExecutionRequest((prev) => ({
                          ...prev,
                          files: [
                            ...prev.files,
                            {
                              name: file.name,
                              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                              date: new Date().toISOString().split('T')[0]
                            }
                          ]
                        }));
                      }
                    }}
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {executionRequest.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-slate-200 rounded flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-800 truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-400">{file.size} · {file.date}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExecutionRequest((prev) => ({
                          ...prev,
                          files: prev.files.filter((_, i) => i !== idx)
                        }));
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                멘토링 신청 시 첫번째 화면의 과제정의서와 작성된 서술 내용 및 첨부파일을 루브릭으로 정밀 분석합니다.
              </div>
              <button
                type="button"
                onClick={handleApplyMentoringClick}
                className="px-6 py-2.5 rounded-md font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>과제 멘토링 신청하기</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* =============================================================
          SCREEN 3: 최종 보고서 완료 및 승인
          ============================================================= */}
      {activeTab === 'final_report' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
          {/* Requirement 1: Prominent Notice Banner */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-5 shadow-xs flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-black text-rose-900 tracking-tight">
                AXAGE 핵심과제 완료 필수 안내
              </h3>
              <p className="text-sm font-bold text-rose-800 leading-relaxed">
                "AXAGE 핵심과제는 주요경영진으로부터 승인을 받은 경우에만 완료된 것으로 인정됩니다."
              </p>
              <p className="text-xs text-rose-700">
                반드시 임원의 서명이 날인된 최종 결재 의결서 스캔본과 과제 완료 보고서를 함께 첨부하여 최종 승인 검토를 완료해 주시기 바랍니다.
              </p>
            </div>
          </div>

          {/* Final Submission Form */}
          <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>주요경영진 승인 정보 및 최종 완료 보고서 등록</span>
              </h3>
              <span className="text-xs text-slate-500">
                연계 과제: {formData.title}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Fields 2: Executive Name & Approval Doc Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>주요경영진 (임원 이름 및 직책) <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={finalReportSubmission.executiveName}
                    onChange={(e) => setFinalReportSubmission({ ...finalReportSubmission, executiveName: e.target.value })}
                    placeholder="예: 홍길동 부사장 (생산본부장)"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">과제 완료 승인 결재를 진행한 임원의 성명과 직책을 기입합니다.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>승인문서명 (승인 근거 문서) <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={finalReportSubmission.approvalDocTitle}
                    onChange={(e) => setFinalReportSubmission({ ...finalReportSubmission, approvalDocTitle: e.target.value })}
                    placeholder="예: 2026년 4분기 경영전략회의 의결서 (Doc #KII-2026-EX-104)"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">어떤 공식 결재문서를 통해 승인을 받았는지 기록하는 필드입니다.</span>
                </div>
              </div>

              {/* Fields 3 & 4: Two Mandatory Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
                {/* Attachment 1: Signed Doc Scan */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>임원 서명 기록 문서 스캔본 <span className="text-rose-500">*</span></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    임원의 자필 서명 또는 전자결재 인장이 날인된 공식 결재문서 사본을 업로드해 주세요.
                  </p>

                  {finalReportSubmission.signedDocScan ? (
                    <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {finalReportSubmission.signedDocScan.name} ({finalReportSubmission.signedDocScan.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFinalReportSubmission({ ...finalReportSubmission, signedDocScan: null })}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">임원 서명문서 스캔본 업로드</span>
                      <span className="text-[10px] text-slate-400">PDF, JPG, PNG 파일 지원</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            setFinalReportSubmission({
                              ...finalReportSubmission,
                              signedDocScan: { name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` }
                            });
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Attachment 2: Final Report File */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <FileUp className="w-4 h-4 text-blue-600" />
                      <span>최종 완료 보고서 파일 <span className="text-rose-500">*</span></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    DGAP 전 단계의 추진 결과 및 최종 재무성과/표준화가 포함된 완결 보고서 파일입니다.
                  </p>

                  {finalReportSubmission.finalReportFile ? (
                    <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {finalReportSubmission.finalReportFile.name} ({finalReportSubmission.finalReportFile.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFinalReportSubmission({ ...finalReportSubmission, finalReportFile: null })}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">최종 완료 보고서 업로드</span>
                      <span className="text-[10px] text-slate-400">PDF, PPTX, DOCX 파일 지원</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            setFinalReportSubmission({
                              ...finalReportSubmission,
                              finalReportFile: { name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` }
                            });
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Summary Note */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-slate-800">
                  최종 완료 요약 및 검증 의견
                </label>
                <textarea
                  rows={3}
                  value={finalReportSubmission.summaryNote}
                  onChange={(e) => setFinalReportSubmission({ ...finalReportSubmission, summaryNote: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                업로드된 보고서에 대해 두 번째 화면과 동일하게 루브릭 분석을 거쳐 이메일 피드백이 전송됩니다.
              </div>
              <button
                type="button"
                onClick={handleFinalReportAnalyze}
                className="px-6 py-2.5 rounded-md font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>최종 보고서 평가 및 이메일 피드백</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* =============================================================
          MODAL: 2주 후 신청 안내 모달 (Screen 2: 과제 멘토링 신청하기 클릭 시)
          요구사항 5: '다음 멘토링 서비스 신청가능일자는 2주 후 입니다. 신청하시겠습니까?'
          ============================================================= */}
      {isConfirm2WeeksModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-slate-200 p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                과제 멘토링 서비스 신청 확인
              </h3>
              <p className="text-sm font-bold text-blue-900 py-1 bg-blue-50 rounded border border-blue-200">
                "다음 멘토링 서비스 신청가능일자는 2주 후 입니다. 신청하시겠습니까?"
              </p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                신청 완료 즉시 첫번째 화면의 과제정의서와 입력된 서술 요청사항 및 첨부파일을 바탕으로 분석적 루브릭 멘토링 보고서가 생성됩니다.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirm2WeeksModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-md font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmMentoringApplication}
                className="flex-1 py-2.5 px-4 rounded-md font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                신청하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: EMAIL MENTORING REPORT (Screen 2 & Screen 3)
          요구사항 6~9: 첨부된 핵심과제 평가기준 양식 동일 테이블, 상단 분석요약, 하단 '수정하기', '그대로 발송하기'
          ============================================================= */}
      {(isEmailReportModalOpen || isFinalEmailReportModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {isFinalEmailReportModalOpen
                        ? 'AXAGE 핵심과제 최종 완료보고서 평가 및 피드백 보고서'
                        : 'AXAGE 과제 실행 멘토링 분석 보고서 (이메일 서비스)'}
                    </span>
                    {isEditingEmailReport && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                        루브릭 편집 모드
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    수신자: {formData.manager} ({formData.managerDept}) | 과제명: {formData.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEmailReportModalOpen(false);
                  setIsFinalEmailReportModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Report Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 space-y-6">
              {/* Requirement 9: Top Comprehensive Analysis Summary Narrative */}
              <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Overall Diagnostic Summary
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      전체적인 분석 결과에 대한 요약
                    </h3>
                  </div>

                  {/* Total Rubric Score Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 font-medium">루브릭 종합 평가점수</div>
                      <div className="text-xl font-black text-blue-700">
                        {totalRubricScore.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ {maxRubricScore}점 ({(totalRubricScore / maxRubricScore * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded font-black text-sm ${
                      totalRubricScore >= 95 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {totalRubricScore >= 95 ? '우수 (A등급)' : '양호 (B등급)'}
                    </div>
                  </div>
                </div>

                {/* Narrative Summary Text */}
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 bg-slate-50 p-4 rounded-md border border-slate-200">
                  <p>
                    <strong>[과제 개요 및 정의 진단]</strong> 본 과제는 제막공정 부적합품률 저감을 위해 Q-cost 분석과 전략과제를 충실히 연계하여 CTQ-Y(부적합품율 1.99% → 0.72%)를 명확히 수립하였습니다. Define 및 Goal-setting 단계의 평가기준 충족도가 매우 높으며, 311백만원/년 규모의 연간 기대효과 산출 논리가 정교하게 구비되어 있습니다.
                  </p>
                  <p>
                    <strong>[실행 및 분석(DGAP) 핵심 피드백]</strong> Analyze 단계에서 AOI 측정시스템 Gage R&R 및 DX데이터플랫폼 원천데이터를 활용한 Random Forest/SHAP 중요도 분석을 통해 T/up 측면부 외기 유입 와류를 치명인자(Vital Few)로 정확히 규명하였습니다. 다만, 즉개선 체크리스트 기록 보강 및 머신러닝 알고리즘 모델 간 추가 앙상블 비교가 보완될 경우 완성도가 더욱 제고될 것입니다.
                  </p>
                  <p>
                    <strong>[개선 효과 및 표준화]</strong> Practice 단계에서 RSM 반응표면분석을 통한 최적 조건 도출 및 2-Sample t-test 효과 검증이 탁월하며, Air curtain 설치를 통해 실제 205백만원/년 이상의 순절감액을 입증하였습니다. 사내 작업표준서 개정과 관리계획서(QC Plan) 반영이 완료되어 향후 지속적인 성과 유지가 기대됩니다.
                  </p>
                </div>

                {/* Rubric Legend (범례) */}
                <div className="border border-slate-200 rounded p-3 bg-white flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>평가 기준 범례 (가중치 적용 규칙)</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <strong className="text-slate-900">상 (x 1.0)</strong>: <span className="text-slate-600">평가기준을 충족함</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <strong className="text-slate-900">중 (x 0.5)</strong>: <span className="text-slate-600">평가기준을 부분적으로 충족함</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                      <strong className="text-slate-900">하 (x 0.0)</strong>: <span className="text-slate-600">기록이 없거나 기준 현저히 미충족</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement 9: Evaluation Criteria Rubric Table (첨부 PDF와 100% 동일한 형태) */}
              <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    AXAGE 핵심과제 평가 기준 (세부 분석 테이블)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingEmailReport(!isEditingEmailReport)}
                      className={`text-xs px-2.5 py-1 rounded font-semibold border transition-colors ${
                        isEditingEmailReport
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isEditingEmailReport ? '수정 모드 완료' : '평가결과/근거 직접 수정'}
                    </button>
                    <span className="text-xs text-slate-500">총 49개 평가항목</span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded">
                  <table className="w-full text-xs text-left border-collapse min-w-[900px]">
                    <thead className="bg-[#1b365d] text-white font-semibold">
                      <tr>
                        <th className="py-2.5 px-2.5 border-r border-blue-900 w-24">DGAP 구분</th>
                        <th className="py-2.5 px-2.5 border-r border-blue-900 w-36">실행 절차</th>
                        <th className="py-2.5 px-2.5 border-r border-blue-900 w-44">평가 항목</th>
                        <th className="py-2.5 px-2.5 border-r border-blue-900">평가 기준</th>
                        <th className="py-2.5 px-2 text-center border-r border-blue-900 w-12">배점</th>
                        <th className="py-2.5 px-2 text-center border-r border-blue-900 w-16">평가결과</th>
                        <th className="py-2.5 px-2 text-center border-r border-blue-900 w-14">가중치</th>
                        <th className="py-2.5 px-2 text-center border-r border-blue-900 w-16">평가점수</th>
                        <th className="py-2.5 px-3 w-64">평가근거</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {rubricData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 align-top">
                          <td className="py-2 px-2.5 border-r border-slate-300 font-bold text-slate-900 bg-slate-50/50">
                            {row.stage}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 font-semibold text-slate-800">
                            {row.procedure}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-slate-700 leading-tight">
                            {row.item}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-slate-600 leading-tight">
                            {row.criterion}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-300 font-mono font-bold text-slate-800 bg-slate-50/30">
                            {row.points}
                          </td>
                          <td className="py-2 px-1 text-center border-r border-slate-300">
                            {isEditingEmailReport ? (
                              <select
                                value={row.grade}
                                onChange={(e) => handleRubricGradeChange(row.id, e.target.value as RubricGrade)}
                                className="text-xs p-1 rounded border border-slate-300 bg-white font-bold"
                              >
                                <option value="상">상</option>
                                <option value="중">중</option>
                                <option value="하">하</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded font-black text-xs ${
                                row.grade === '상'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : row.grade === '중'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {row.grade}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-1 text-center border-r border-slate-300 font-mono text-slate-600">
                            {row.weight.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-300 font-mono font-black text-blue-700 bg-blue-50/30">
                            {row.score.toFixed(1)}
                          </td>
                          <td className="py-2 px-3">
                            {isEditingEmailReport ? (
                              <textarea
                                rows={2}
                                value={row.reason}
                                onChange={(e) => handleRubricReasonChange(row.id, e.target.value)}
                                className="w-full p-1 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-[11px] leading-relaxed text-slate-700">
                                {row.reason}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#1b365d] text-white font-bold border-t-2 border-slate-900">
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-center text-sm font-black tracking-wide border-r border-blue-900">
                          총 계 (합계)
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-sm border-r border-blue-900">
                          111
                        </td>
                        <td colSpan={2} className="py-3 px-2 text-center text-xs border-r border-blue-900">
                          취득점수 합산
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-base font-black text-yellow-300 border-r border-blue-900">
                          {totalRubricScore.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-xs font-normal">
                          만점 대비 달성율: {(totalRubricScore / 111 * 100).toFixed(1)}% (합격 기준 80점 이상 충족)
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Requirement 9: Bottom Action Buttons ('수정하기' / '그대로 발송하기') */}
            <div className="px-6 py-4 bg-white border-t border-slate-300 flex items-center justify-between shadow-lg">
              <div className="text-xs text-slate-600">
                수정하기 클릭 시 변경 내용이 저장되며, 그대로 발송하기를 누르면 작성자 이메일로 즉시 전송됩니다.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isFinalEmailReportModalOpen ? handleFinalEmailReportSave : handleEmailReportSave}
                  className="px-5 py-2.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>수정하기</span>
                </button>

                <button
                  type="button"
                  onClick={isFinalEmailReportModalOpen ? handleFinalEmailReportSend : handleEmailReportSend}
                  className="px-6 py-2.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>그대로 발송하기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: 보완요청서 (Screen 1 핵심과제 피드백 전 단계)
          ============================================================= */}
      {isSupplementRequestOpen && supplementReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>AXAGE 핵심과제 보완요청서 (검토의견서)</span>
                    {isEditingSupplementRequest && (
                      <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                        수정 모드 활성
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    데이터 필드에 작성된 내용 중 보완이 필요한 항목을 일목요연하게 정리한 공식 보고서입니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupplementRequestOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <div className="bg-white border border-slate-300 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto text-xs text-slate-800 space-y-5">
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      AXAGE Task Charter Review Report
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                      핵심과제 정의서 보완요청서
                    </h2>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>문서번호: <span className="font-semibold text-slate-700">{supplementReport.docNo}</span></div>
                    <div>발행일자: <span className="font-semibold text-slate-700">{supplementReport.createdDate}</span></div>
                  </div>
                </div>

                <div className="border border-slate-300 grid grid-cols-2 divide-x divide-slate-300 text-xs">
                  <div className="p-2.5 space-y-1.5 bg-slate-50/50">
                    <div><span className="text-slate-500 font-medium">수 신 (작성자):</span> <strong className="text-slate-900">{supplementReport.receiver}</strong></div>
                    <div><span className="text-slate-500 font-medium">과제명:</span> <span className="font-bold text-blue-900">{supplementReport.projectTitle}</span></div>
                  </div>
                  <div className="p-2.5 space-y-1.5 bg-slate-50/50">
                    <div><span className="text-slate-500 font-medium">발 신 (검토부서):</span> <strong className="text-slate-900">{supplementReport.sender}</strong></div>
                    <div><span className="text-slate-500 font-medium">대상공정 / 제품:</span> <span className="text-slate-800">{supplementReport.processProduct}</span></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. 종합 검토 의견</span>
                  </div>
                  {isEditingSupplementRequest ? (
                    <textarea
                      rows={3}
                      value={supplementReport.overallOpinion}
                      onChange={(e) => setSupplementReport({ ...supplementReport, overallOpinion: e.target.value })}
                      className="w-full p-2.5 border border-blue-400 rounded text-xs leading-relaxed bg-blue-50/30 font-sans"
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-800">
                      {supplementReport.overallOpinion}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. 항목별 세부 보완 요청 내역 ({supplementReport.items.length}건)</span>
                  </div>

                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                        <tr>
                          <th className="py-2 px-3 border-r border-slate-300 w-28">검토 항목</th>
                          <th className="py-2 px-3 border-r border-slate-300 w-44">현재 기재 내용</th>
                          <th className="py-2 px-3 border-r border-slate-300 w-64">보완 필요 사유 (가이드 기준)</th>
                          <th className="py-2 px-3">구체적 수정 권고안</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {supplementReport.items.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 align-top">
                            <td className="py-2.5 px-3 border-r border-slate-300 font-bold text-slate-900">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                                {item.fieldLabel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-300 text-slate-600 text-[11px] break-all leading-relaxed">
                              {item.currentContent}
                            </td>
                            <td className="py-2 px-2.5 border-r border-slate-300">
                              {isEditingSupplementRequest ? (
                                <textarea
                                  rows={3}
                                  value={item.reason}
                                  onChange={(e) => {
                                    const updated = [...supplementReport.items];
                                    updated[idx].reason = e.target.value;
                                    setSupplementReport({ ...supplementReport, items: updated });
                                  }}
                                  className="w-full p-1.5 border border-slate-300 rounded text-xs font-sans"
                                />
                              ) : (
                                <div className="text-slate-800 text-[11px] leading-relaxed">
                                  {item.reason}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-2.5 bg-blue-50/20">
                              {isEditingSupplementRequest ? (
                                <textarea
                                  rows={3}
                                  value={item.recommendation}
                                  onChange={(e) => {
                                    const updated = [...supplementReport.items];
                                    updated[idx].recommendation = e.target.value;
                                    setSupplementReport({ ...supplementReport, items: updated });
                                  }}
                                  className="w-full p-1.5 border border-blue-300 rounded text-xs bg-white font-sans text-blue-950"
                                />
                              ) : (
                                <div className="text-blue-950 text-[11px] leading-relaxed">
                                  {item.recommendation}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-300 flex items-center justify-between shadow-lg">
              <div className="text-xs text-slate-600">
                {isEditingSupplementRequest ? (
                  <span className="text-amber-700 font-semibold">✏️ 담당자 직접 수정 모드 활성화 중입니다.</span>
                ) : (
                  <span>보완요청서 내용을 확인하신 후 수정하거나 그대로 발송할 수 있습니다.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isEditingSupplementRequest ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingSupplementRequest(true)}
                    className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>보완요청서를 수정하시겠습니까?</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingSupplementRequest(false)}
                    className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>수정 완료</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSendSupplementRequest}
                  className="px-5 py-2.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>그대로 발송하시겠습니까?</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: 작성자 피드백 수신 팝업 (Screen 1)
          ============================================================= */}
      {isFeedbackModalOpen && evaluationResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className={`px-6 py-4 flex items-center justify-between border-b ${
              evaluationResult.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {evaluationResult.passed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {evaluationResult.passed ? '가이드 적합성 검토 완료 (우수)' : '핵심과제 정의서 피드백 결과'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    AXAGE 과제정의서 작성 가이드 &amp; SMART 원칙 기반 진단 결과
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2.5 text-xs text-blue-900">
                <Send className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-blue-950">[보완요청서 수신 완료]</strong> AX Innovation 센터 검토자로부터 공식 보완요청서가 발송되었습니다.
                  아래 항목별 상세 권고사항을 확인하신 후 하단의 <strong>[과제정의서 보완하기]</strong> 버튼을 눌러 양식을 보완해 주세요.
                </div>
              </div>

              {!evaluationResult.passed && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    항목별 상세 보완 권고사항
                  </h4>
                  {evaluationResult.feedbacks.map((fb, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-md p-3.5 bg-slate-50/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          {fb.fieldLabel}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          보완 필요
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mb-2 leading-relaxed">{fb.comment}</p>
                      <div className="bg-white p-2.5 rounded border border-slate-200 text-xs text-blue-900">
                        <strong className="text-blue-700">💡 권장 개선안:</strong> {fb.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="px-4 py-2 rounded text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                닫기
              </button>

              <div className="flex items-center gap-2">
                {!evaluationResult.passed ? (
                  <button
                    type="button"
                    onClick={handleStartRevision}
                    className="px-4 py-2 rounded font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>과제정의서 보완하기</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitApproval}
                    className="px-4 py-2 rounded font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>결재상신하기</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: 완성된 과제정의서 결재 확인 팝업 (Screen 1)
          ============================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">과제정의서 최종 확인 (완성본 미리보기)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <div className="bg-white border border-slate-300 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto text-xs text-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    대외비 (Confidential)
                  </span>
                  <span className="text-[11px] text-slate-500">작성일자: {new Date().toLocaleDateString('ko-KR')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">AXAGE 과제 기술서</h2>
                  <div className="border border-slate-400 bg-white text-center">
                    <table className="w-48 border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-400">
                          <th className="py-0.5 px-2 border-r border-slate-400">작 성</th>
                          <th className="py-0.5 px-2 border-r border-slate-400">검 토</th>
                          <th className="py-0.5 px-2">승 인</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="h-10 text-slate-400">
                          <td className="border-r border-slate-400 align-middle text-blue-700 font-bold">
                            {formData.manager} (상신대기)
                          </td>
                          <td className="border-r border-slate-400 align-middle">/</td>
                          <td className="align-middle">/</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border border-slate-400 divide-y divide-slate-300">
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold border-r border-slate-300">과제명</div>
                    <div className="col-span-10 p-2.5 font-bold text-slate-900">{formData.title}</div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold border-r border-slate-300">대상공정/제품</div>
                    <div className="col-span-4 p-2.5 border-r border-slate-300">{formData.processProduct}</div>
                    <div className="col-span-6 p-2.5">담당자: {formData.manager} ({formData.managerDept})</div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold border-r border-slate-300">선정 사유</div>
                    <div className="col-span-10 p-2.5 leading-relaxed">{formData.reason}</div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold border-r border-slate-300">개선 내용</div>
                    <div className="col-span-10 p-2.5">{formData.improvementContent}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-300 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-extrabold text-slate-900">결재상신 하시겠습니까?</h4>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  수정하기 / 취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFinalSubmit}
                  className="px-6 py-2.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  결재상신
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: DX 데이터플랫폼 (image.png 1:1 재현)
          ============================================================= */}
      {isDXPlatformOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col border border-slate-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#111c2e] text-white px-5 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-slate-300" />
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-blue-400">DX</span>
                  <span className="font-bold text-lg text-white">데이터플랫폼</span>
                </div>
              </div>

              <div className="relative w-80 max-w-full">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요."
                  value={dxSearchQuery}
                  onChange={(e) => setDxSearchQuery(e.target.value)}
                  className="w-full bg-[#1b283d] text-white placeholder-slate-400 text-xs px-3 py-1.5 pr-8 rounded border border-slate-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2" />
              </div>

              <button onClick={() => setIsDXPlatformOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">데이터셋 카탈로그</h2>
              <span className="text-xs text-slate-500">원천 데이터셋에서 Goal 지표를 선택해 과제정의서에 직접 반영합니다.</span>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden bg-slate-50">
              {/* Left Column: Filters */}
              <div className="md:col-span-3 p-4 overflow-y-auto space-y-4 bg-white text-xs">
                <div>
                  <div className="font-bold text-slate-800 pb-1.5 border-b border-slate-200">도메인</div>
                  <div className="mt-2 space-y-1.5 pl-2 text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={activeDomainFilter === 'all' || activeDomainFilter === 'Specialty소재사업본부'} onChange={() => setActiveDomainFilter(activeDomainFilter === 'Specialty소재사업본부' ? 'all' : 'Specialty소재사업본부')} className="rounded text-blue-600" />
                      <span className="font-semibold text-blue-900">Specialty소재사업본부</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>AMS사업본부</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Center Column: Dataset List */}
              <div className="md:col-span-5 flex flex-col bg-white overflow-hidden border-r border-slate-200">
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <span className="text-xs font-bold text-slate-800">데이터셋 <span className="text-blue-600">2976건</span></span>
                  <input
                    type="text"
                    placeholder="검색어"
                    value={dxSearchQuery}
                    onChange={(e) => setDxSearchQuery(e.target.value)}
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white w-28"
                  />
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                  {filteredDXDatasets.map((ds) => (
                    <div
                      key={ds.id}
                      onClick={() => setSelectedDXDatasetId(ds.id)}
                      className={`p-3 rounded-md cursor-pointer transition-all border ${
                        ds.id === selectedDXDatasetId ? 'bg-blue-50/70 border-blue-400' : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[11px] text-amber-700 font-medium mb-1">🍯 {ds.domain}</div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{ds.name}</h4>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{ds.tableName}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Column Inspector */}
              <div className="md:col-span-4 flex flex-col bg-white p-4">
                <div className="pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">{selectedDXDataset.tableName}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">컬럼 {selectedDXDataset.columns.length}건</div>
                </div>

                <div className="flex-1 overflow-y-auto my-3 border border-slate-200 rounded">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-3">필드</th>
                        <th className="py-1.5 px-3 text-right">타입</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDXDataset.columns.map((col, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-3 font-semibold text-slate-800">{col.name}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-[10px] text-slate-500">{col.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-xs space-y-1">
                  <div className="font-bold text-blue-900">추천 Goal 지표 연동</div>
                  <div><strong>지표명:</strong> {selectedDXDataset.suggestedMetric.name}</div>
                  <div><strong>현수준:</strong> {selectedDXDataset.suggestedMetric.current}{selectedDXDataset.suggestedMetric.unit} → <strong>목표:</strong> {selectedDXDataset.suggestedMetric.target}{selectedDXDataset.suggestedMetric.unit}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyDXDataset(selectedDXDataset)}
                  className="w-full py-2.5 px-4 rounded font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>이 지표를 과제정의서 Goal로 가져오기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: 작성 가이드 & BP 사례 열람
          ============================================================= */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[85vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">AXAGE 과제정의서 작성 가이드</h3>
              </div>
              <button onClick={() => setIsGuideOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
              <div className="md:col-span-4 p-3 bg-slate-50 overflow-y-auto space-y-1">
                {GUIDE_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedGuideTopic(sec.id)}
                    className={`w-full text-left p-3 rounded text-xs font-semibold flex items-center justify-between ${
                      selectedGuideTopic === sec.id ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  </button>
                ))}
              </div>

              <div className="md:col-span-8 p-6 overflow-y-auto bg-white space-y-4">
                {(() => {
                  const section = GUIDE_SECTIONS.find((s) => s.id === selectedGuideTopic) || GUIDE_SECTIONS[0];
                  return (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                      <p className="text-xs text-blue-700 font-medium">{section.summary}</p>
                      <div className="space-y-3 pt-2">
                        {section.content.map((p, idx) => (
                          <div key={idx} className="p-3 rounded-md text-xs leading-relaxed bg-slate-50 border border-slate-200 text-slate-800">
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setIsGuideOpen(false)} className="px-4 py-2 rounded text-xs font-semibold bg-slate-800 text-white">
                가이드 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: SUBMITTED SUCCESS DIALOG
          ============================================================= */}
      {submittedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-slate-200 p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">{submittedMessage}</h3>
              <p className="text-xs text-slate-500">
                전자결재 시스템으로 전달되었으며, 상급자 검토 및 승인 프로세스가 시작됩니다.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-left text-slate-700 space-y-1">
              <div><strong>과제명:</strong> {formData.title}</div>
              <div><strong>구분:</strong> {formData.taskType}</div>
              <div><strong>담당자:</strong> {formData.manager} ({formData.managerDept})</div>
            </div>

            <button
              type="button"
              onClick={() => setSubmittedMessage(null)}
              className="w-full py-2.5 px-4 rounded-md font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification when Supplement Report is Sent */}
      {supplementSentNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-emerald-400">보완요청서 발송 완료</div>
            <div className="text-slate-300">{supplementSentNotice}</div>
          </div>
        </div>
      )}
    </div>
  );
}
