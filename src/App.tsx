/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  ArrowRight,
  SlidersHorizontal,
  FolderTree,
  Edit3,
  Award,
  ChevronDown
} from 'lucide-react';

/* =========================================================================
   TYPES & DATA MODELS
   ========================================================================= */

export type TaskType = '본부과제' | '사업이슈과제' | 'Quick-Win과제';

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

/* =========================================================================
   GUIDE & BEST PRACTICE DATA (가이드 PDF 1~18페이지 완벽 반영)
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
      'S (Specific): 과제의 범위는 너무 넓지 않게, 구체적으로 설정 (전략과제 3~5년을 분할하여 본부과제 수준으로 구체화).',
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

/* 우수사례 (BP) 풀 템플릿 (가이드 18페이지 실제 데이터) */
const BP_SAMPLE: FormData = {
  taskType: '본부과제',
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
  },
  {
    id: 'dx_6',
    domain: '공통 > 데이터카탈로그 (kii_data_catalog)',
    sourceType: '공통',
    name: '원천_데이터플랫폼 회사 마스터',
    tableName: 'raw_dataworx_sys_kii_meta_company',
    updatedAt: '2026-09-10 10:00:00',
    columns: [
      { name: 'company_id', type: 'string', comment: '회사 코드' },
      { name: 'company_nm', type: 'string', comment: '회사 명칭' },
      { name: 'biz_reg_no', type: 'string', comment: '사업자등록번호' }
    ],
    suggestedMetric: {
      name: '전사 마스터 정합률(%)',
      current: '92.4',
      target: '99.5',
      unit: '%',
      description: '전사 마스터 데이터 정합률 관리 지표'
    }
  }
];

/* =========================================================================
   MAIN APP COMPONENT
   ========================================================================= */

export default function App() {
  // Form State
  const [formData, setFormData] = useState<FormData>(BP_SAMPLE);

  // UI Modals & Panels
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedGuideTopic, setSelectedGuideTopic] = useState('naming');
  const [isDXPlatformOpen, setIsDXPlatformOpen] = useState(false);
  const [selectedDXDatasetId, setSelectedDXDatasetId] = useState<string>('dx_1');
  const [dxSearchQuery, setDxSearchQuery] = useState('');
  const [activeDomainFilter, setActiveDomainFilter] = useState<string>('all');

  // Workflow / Review State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSupplementRequestOpen, setIsSupplementRequestOpen] = useState(false);
  const [isEditingSupplementRequest, setIsEditingSupplementRequest] = useState(false);
  const [supplementReport, setSupplementReport] = useState<SupplementReport | null>(null);
  const [supplementSentNotice, setSupplementSentNotice] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Field help tooltip popover
  const [activeHelpField, setActiveHelpField] = useState<string | null>(null);

  // Calculate completeness
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

  // Evaluate GDX Charter against Guide & SMART criteria (가이드 평가 엔진)
  const evaluateCharter = (): EvaluationResult => {
    const feedbacks: FeedbackItem[] = [];
    let score = 100;

    // 1. 과제명 평가: 대상공정 + 개선수단 + 목표지표
    const title = formData.title.trim();
    const hasTarget = /공정|라인|라인|제품|모듈|성형|원료|DFR|AHU|KPX|BPA/i.test(title);
    const hasMeans = /개선|최적화|개발|조정|확보|도입|분석|제어/i.test(title);
    const hasMetric = /감소|절감|단축|향상|개선|원단위|부적합|손실/i.test(title);

    // 지양할 사례 키워드 검출 (단순 구축, 안정화 등)
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

    // 2. 선정 사유(문제점 기술) 평가: 전략과제 연계 + Q-cost 분석 / 수치 근거
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

    // 3. 목표 (Goal 및 KPI) SMART 원칙 점검
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
    } else {
      // Measurable 검증 (단위 포함 여부 등)
      if (!/[%(ppm)(kg)(ton)(원)]/.test(goalKpi.name)) {
        score -= 10;
        feedbacks.push({
          fieldKey: 'kpis',
          fieldLabel: '목표 (Goal 단위 명시)',
          severity: 'info',
          comment: 'Goal 지표명에 측정 단위(%, ppm, 원단위 등)가 명확하게 표기되지 않았습니다.',
          recommendation: '지표명 끝에 단위를 괄호로 명시해 주세요. (예: 부적합품율(%), 스팀사용량(kg/hr))'
        });
      }
    }

    // 4. 예상 유형 재무성과 계산식 점검
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

    // 5. 추진일정 점검 (Time-bound)
    const hasSchedules = formData.schedules.length >= 3;
    const hasMarkedMonths = formData.schedules.some((s) => s.months.includes(true));
    if (!hasSchedules || !hasMarkedMonths) {
      score -= 15;
      feedbacks.push({
        fieldKey: 'schedules',
        fieldLabel: '추진일정',
        severity: 'warning',
        comment: '과제 수행기간(3월~12월) 동안의 세부추진항목과 월별 일정이 구체적으로 지정되지 않았습니다.',
        recommendation: '현상파악 -> 데이터 전처리 -> 치명인자 선정 -> 개선안 실행 -> 표준화 단계별로 월별 마일스톤을 체크해 주세요.'
      });
    }

    const passed = feedbacks.length === 0;

    return {
      passed,
      score: Math.max(score, 0),
      feedbacks,
      summary: passed
        ? '축하합니다! GDX 과제정의서 작성 가이드(SMART 원칙 및 우수 사례 기준)를 모두 완벽하게 충족하였습니다.'
        : `가이드 기준 검토 결과 총 ${feedbacks.length}건의 보완 권장사항이 도출되었습니다. 내용을 확인하고 보완을 진행해 주세요.`
    };
  };

  // Action: 본부과제 "작성완료 및 피드백 받기" -> 보완요청서 보고서 먼저 생성
  const handleCompleteAndGetFeedback = () => {
    const result = evaluateCharter();
    setEvaluationResult(result);

    // Build the Supplement Report (보완요청서)
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

    // If passed without issues, add a positive advisory note
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
      docNo: `GDX-REV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      createdDate: new Date().toLocaleDateString('ko-KR'),
      sender: 'AX Innovation 센터 AX기획팀 / 과제심의담당',
      receiver: `${formData.manager || '과제담당자'} (${formData.managerDept || '담당부서'})`,
      projectTitle: formData.title || '과제명 미정',
      processProduct: formData.processProduct || '-',
      overallOpinion: result.passed
        ? '본 과제기술서는 SMART 원칙 및 GDX 작성 가이드를 우수하게 충족하여 보완 요청 사항이 없습니다.'
        : `제출된 과제기술서 검토 결과, 총 ${items.length}건에 대해 가이드 기준에 따른 보완이 필요하여 본 보완요청서를 발송합니다. 아래 상세 보완 의견을 참고하여 수정 후 재상신해 주시기 바랍니다.`,
      items
    });

    setIsEditingSupplementRequest(false);
    setIsSupplementRequestOpen(true);
  };

  // Action: "그대로 발송하시겠습니까?" -> 작성자에게 발송 후 피드백 받은 팝업으로 연결
  const handleSendSupplementRequest = () => {
    // Sync any reviewer modifications to evaluationResult so author feedback popup shows updated notes
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

    // 발송 후 작성자가 피드백 받은 팝업으로 즉시 연결
    setTimeout(() => {
      setIsFeedbackModalOpen(true);
      setSupplementSentNotice(null);
    }, 400);
  };

  // Action: "과제정의서 보완하기" (루프 타기)
  const handleStartRevision = () => {
    setIsFeedbackModalOpen(false);
    setIsRevisionMode(true);
  };

  // Action: "결재상신하기" (보완 불필요 or 결재 진행) -> 완성된 형태 팝업 열기
  const handleSubmitApproval = () => {
    setIsFeedbackModalOpen(false);
    setIsPreviewModalOpen(true);
  };

  // Action: 사업이슈과제/Quick-Win과제 "확인 및 결재 상신" -> 완성된 형태 팝업 열기
  const handleQuickApproval = () => {
    setIsPreviewModalOpen(true);
  };

  // Final Action: 팝업 하단 '결재상신' 확인 클릭 시 최종 상신 처리
  const handleConfirmFinalSubmit = () => {
    setIsPreviewModalOpen(false);
    setSubmittedMessage('과제정의서를 상신하였습니다.');
  };

  // Action: DX 플랫폼에서 Goal 지표 적용
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

  // Action: 우수 사례(BP) 템플릿 불러오기
  const handleLoadBPSample = () => {
    setFormData(BP_SAMPLE);
    setIsRevisionMode(false);
    setEvaluationResult(null);
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
          TOP GLOBAL HEADER & CONTROLS
          ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AX Innovation 센터
                </span>
                <span className="text-xs text-slate-500">KII GDX 과제관리 시스템</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                GDX 과제정의서(기술서) 작성 &amp; 검토
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsGuideOpen(true);
                setSelectedGuideTopic('attributes');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>작성 가이드 보기</span>
            </button>

            <button
              onClick={handleLoadBPSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors"
              title="가이드 첨부 우수사례(제막공정 이물개선) 데이터 자동 입력"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>우수사례(BP) 불러오기</span>
            </button>

            {isRevisionMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                <Edit3 className="w-3.5 h-3.5" />
                보완 수정 모드
              </span>
            )}
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          REVISION MODE BANNER (보완 모드일 때 최상단 안내)
          ------------------------------------------------------------- */}
      {isRevisionMode && evaluationResult && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  과제정의서 보완 피드백 안내 ({evaluationResult.feedbacks.length}건)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  아래 주황색 라벨로 표시된 항목의 코멘트를 확인하고 내용을 보완해 주세요. 수정 완료 후 하단의 [작성완료 및 피드백 받기]를 누르면 다시 검토됩니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="text-xs font-semibold text-amber-900 underline hover:text-amber-700 shrink-0 px-2 py-1 bg-amber-100 rounded border border-amber-300"
            >
              피드백 상세 전체보기
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN FORM WORKSPACE (첨부 양식 1:1 재현)
          ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
          {/* Top Document Header Bar */}
          <div className="border-b border-slate-300 px-6 py-4 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                대외비 (Confidential)
              </span>
              <span className="text-xs text-slate-500 font-mono">[첨부2]</span>
            </div>

            {/* Title & Approval Table Header Area */}
            <div className="flex items-center gap-6">
              <div className="text-right text-xs text-slate-500">
                작성일자: {new Date().toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Title Row with Approval Stamp Box */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  GDX과제 기술서
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  데이터 기반 AX 혁신 과제 상세 정의 및 추진 계획서
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

            {/* 과제 유형 선택 라디오 그룹 */}
            <div className="bg-slate-50 border border-slate-300 rounded-md p-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  과제 구분 :
                </span>
                <div className="flex items-center gap-5">
                  {(['본부과제', '사업이슈과제', 'Quick-Win과제'] as TaskType[]).map((type) => (
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
                {formData.taskType === '본부과제' ? (
                  <span>본부과제는 SMART 원칙에 기반한 <strong>피드백 및 보완 루프</strong>가 적용됩니다.</span>
                ) : (
                  <span>{formData.taskType}는 작성 완료 즉시 <strong>확인 및 결재 상신</strong>이 가능합니다.</span>
                )}
              </div>
            </div>

            {/* =======================================================
                FORM TABLE (양식 그리드)
                ======================================================= */}
            <div className="border border-slate-400 rounded-none overflow-hidden text-sm">
              {/* Row 1: 과제명 & 대상공정 */}
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
                    title="과제명 작성 가이드 (대상+수단+목표)"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="md:col-span-10 p-2 space-y-1.5">
                  <div className="flex items-center gap-2">
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
                  </div>
                  {isRevisionMode && evaluationResult?.feedbacks.find((f) => f.fieldKey === 'title') && (
                    <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>보완 코멘트:</strong> {evaluationResult.feedbacks.find((f) => f.fieldKey === 'title')?.comment}
                      </div>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="font-semibold text-blue-700">작성 공식:</span>
                    <span>대상공정(범위) + 개선 수단 + 목표 지표</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">예: BPA 결정화 공정 증류공정 개선으로 생산손실량 감소</span>
                  </div>
                </div>
              </div>

              {/* Row 2: 대상공정(프로세스)/대상제품 & 담당자/참여자 */}
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        placeholder="이름 (예: 김생산)"
                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 w-16">담당부서:</span>
                      <input
                        type="text"
                        value={formData.managerDept}
                        onChange={(e) => setFormData({ ...formData, managerDept: e.target.value })}
                        placeholder="부서명 (예: 생산1팀)"
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
                        placeholder="이름 (예: 이기술)"
                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 w-16">참여부서:</span>
                      <input
                        type="text"
                        value={formData.participantsDept}
                        onChange={(e) => setFormData({ ...formData, participantsDept: e.target.value })}
                        placeholder="부서명 (예: 기술2팀)"
                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: 선정 사유 (문제점 기술) */}
              <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1">
                      선정 사유 <span className="text-rose-500">*</span>
                    </span>
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
                    <span>작성 가이드</span>
                  </button>
                </div>
                <div className="md:col-span-10 p-2 space-y-1.5">
                  <textarea
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="전략 및 부서 목표와의 연관성과 Q-cost 분석 등 정량적 수치를 포함하여 작성 (예: Q-cost 분석 결과 내부실패비용이 전체 68%를 차지하여 전략과제로 선정...)"
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isRevisionMode && evaluationResult?.feedbacks.some((f) => f.fieldKey === 'reason')
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-300'
                    }`}
                  />
                  {isRevisionMode && evaluationResult?.feedbacks.find((f) => f.fieldKey === 'reason') && (
                    <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>보완 코멘트:</strong> {evaluationResult.feedbacks.find((f) => f.fieldKey === 'reason')?.comment}
                      </div>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500">
                    💡 <strong>가이드 포인트:</strong> 단순한 현상 나열보다 <strong>경영전략/팀목표 연계성 + Q-cost 실패비용 비중(%)</strong>과 CTQ 선정 근거를 반드시 포함해야 채택율이 높습니다.
                  </div>
                </div>
              </div>

              {/* Row 4: 개선 내용 */}
              <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex items-center justify-between">
                  <span>개선 내용 <span className="text-rose-500">*</span></span>
                </div>
                <div className="md:col-span-10 p-2">
                  <input
                    type="text"
                    value={formData.improvementContent}
                    onChange={(e) => setFormData({ ...formData, improvementContent: e.target.value })}
                    placeholder="예: 제막공정의 이물발생 원인을 규명하여 부적합품율을 개선"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: 목표 테이블 (Goal + KPI_1~3 + 예상 재무성과) */}
              <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-300">
                <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1">
                      목표 <span className="text-rose-500">*</span>
                    </span>
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

                {/* KPI Grid & Financial Benefit */}
                <div className="md:col-span-10 p-3 space-y-3">
                  {/* Goal 입력 방식 토글 바 (요구사항 2 반영) */}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDXPlatformOpen(true)}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>DX플랫폼 데이터셋 탐색 ({DX_DATASETS.length}개)</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI Table Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    {/* Left: KPI Rows Table */}
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
                            <tr
                              key={kpi.id}
                              className={kpi.type === 'Goal' ? 'bg-blue-50/40 font-medium' : 'bg-white'}
                            >
                              <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-800">
                                <div className="flex items-center gap-1">
                                  {kpi.type === 'Goal' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                                  <span>{kpi.type}</span>
                                </div>
                              </td>
                              <td className="py-1 px-2 border-r border-slate-300">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={kpi.name}
                                    onChange={(e) => {
                                      const updated = [...formData.kpis];
                                      updated[idx].name = e.target.value;
                                      setFormData({ ...formData, kpis: updated });
                                    }}
                                    placeholder={kpi.type === 'Goal' ? '부적합품율(%)' : '세부 KPI 지표명'}
                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                  />
                                  {kpi.type === 'Goal' && (
                                    <button
                                      type="button"
                                      onClick={() => setIsDXPlatformOpen(true)}
                                      className="p-1 text-blue-600 hover:text-blue-800 shrink-0"
                                      title="DX플랫폼 지표 연동"
                                    >
                                      <Database className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
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
                                  placeholder="1.99"
                                  className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
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
                                  placeholder="0.72"
                                  className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs text-center font-bold text-blue-700 focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Right: 예상 유형 재무성과(백만원/년) */}
                    <div className="lg:col-span-5 border border-slate-300 rounded p-2.5 flex flex-col justify-between bg-slate-50/50">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                          <span className="text-xs font-bold text-slate-800">
                            예상 유형 재무성과 (백만원/년) <span className="text-rose-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">연간 산출식 명시</span>
                        </div>
                        <textarea
                          rows={4}
                          value={formData.financialBenefit}
                          onChange={(e) => setFormData({ ...formData, financialBenefit: e.target.value })}
                          placeholder="▶ 205 백만원/년&#10;-. 개선 후 내부 부적합품 발생 절감량 : 8.06ton/월&#10;-. 계산식 : 8.06(ton) × 3,219(원/kg) × 12(개월) = 311,496,192(원/년)"
                          className={`w-full mt-2 px-2 py-1.5 border rounded text-xs font-mono leading-relaxed focus:ring-1 focus:ring-blue-500 ${
                            isRevisionMode && evaluationResult?.feedbacks.some((f) => f.fieldKey === 'financialBenefit')
                              ? 'border-amber-500 bg-amber-50/60'
                              : 'border-slate-300 bg-white'
                          }`}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        💡 산출식: [개선전-개선후 절감량] × 단가 × 12개월
                      </div>
                    </div>
                  </div>

                  {/* 정성적 효과 & 투자비용 그리드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="border border-slate-300 rounded p-2.5 bg-white">
                      <div className="text-xs font-bold text-slate-700 mb-1">정성적 효과</div>
                      <input
                        type="text"
                        value={formData.qualitativeEffect}
                        onChange={(e) => setFormData({ ...formData, qualitativeEffect: e.target.value })}
                        placeholder="예: 제막공정 표준작업 개선 및 클린룸 작업 환경 최적화"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="border border-slate-300 rounded p-2.5 bg-white">
                      <div className="text-xs font-bold text-slate-700 mb-1">투자비용 (설비, 센서 등)</div>
                      <input
                        type="text"
                        value={formData.investmentCost}
                        onChange={(e) => setFormData({ ...formData, investmentCost: e.target.value })}
                        placeholder="예: ▶ 총 투입 비용 : 106백만원 (T/up 측면부 Air curtain 설치 등)"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: 추진일정 (세부추진항목 + 세부목표 + 3~12월 인터랙티브 간트차트) */}
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-2 bg-slate-100 p-3 font-semibold text-slate-800 border-r border-slate-300 flex flex-col justify-between">
                  <div>
                    <span className="flex items-center gap-1">
                      추진일정 <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-xs font-normal text-slate-500 block">(3월 ~ 12월)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    SMART 원칙 (Time-bound)
                  </div>
                </div>

                <div className="md:col-span-10 p-3 overflow-x-auto">
                  <div className="min-w-[620px]">
                    <table className="w-full text-xs border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                          <th className="py-2 px-3 border-r border-slate-300 w-44 text-left">세부추진항목</th>
                          <th className="py-2 px-3 border-r border-slate-300 w-28 text-left">세부목표</th>
                          <th colSpan={10} className="py-1 px-2 text-center border-b border-slate-200 font-semibold bg-slate-200/70">
                            월별 추진일정 (클릭하여 일정 지정)
                          </th>
                        </tr>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-300 text-center font-mono">
                          <th className="border-r border-slate-300" colSpan={2}></th>
                          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                            <th key={m} className="py-1 px-1 border-r border-slate-300 last:border-r-0 w-8">
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
                                className="w-full px-2 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-blue-500 rounded"
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
                                className="w-full px-2 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-blue-500 rounded"
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
                                className="border-r border-slate-300 last:border-r-0 text-center cursor-pointer p-0 select-none hover:bg-blue-50 transition-colors"
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

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                    <span>💡 각 셀을 클릭하면 추진 월별 마일스톤 막대가 토글됩니다.</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newRow: ScheduleRow = {
                          id: `sched_${Date.now()}`,
                          task: '추가 추진항목',
                          milestone: '세부목표',
                          months: Array(10).fill(false)
                        };
                        setFormData({ ...formData, schedules: [...formData.schedules, newRow] });
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      + 일정 항목 추가
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Notice Footer */}
            <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-3 leading-relaxed">
              본 문서는 영업상 주요 자산으로서 부정경쟁방지 및 영업비밀보호에 관한 법률을 포함하여 관련 법령에 따라 보호되는 중요한 정보를 포함하고 있으므로, 그 전부 또는 일부를 무단으로 열람하거나, 공개, 사용, 복제, 유출 등을 하는 행위는 엄격히 금지됩니다.
            </div>
          </div>

          {/* ---------------------------------------------------------
              BOTTOM ACTION FOOTER (요구사항 3, 4, 5, 7 완벽 반영)
              --------------------------------------------------------- */}
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
                  필수 항목 작성 중 (과제명, 공정, 담당자, 사유, 재무성과 등)
                </span>
              )}
            </div>

            {/* Dynamic Buttons based on Task Type & Status */}
            <div className="flex items-center gap-3">
              {/* Case 1: 사업이슈과제 or Quick-Win 과제 (요구사항 3) */}
              {(formData.taskType === '사업이슈과제' || formData.taskType === 'Quick-Win과제') && (
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

              {/* Case 2: 본부과제 (요구사항 4, 5, 6, 7) */}
              {formData.taskType === '본부과제' && (
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

                  {/* 만약 이미 피드백을 받았고 통과 상태인 경우 즉시 결재 상신 가능 */}
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

      {/* =============================================================
          MODAL 0: 보완요청서 (검토의견 보고서 생성 및 담당자 직접수정 / 발송 모달)
          ============================================================= */}
      {isSupplementRequestOpen && supplementReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>GDX 본부과제 보완요청서 (검토의견서)</span>
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

            {/* Editing Mode Notice */}
            {isEditingSupplementRequest && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-amber-900">
                  <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>담당자 직접 수정 모드:</strong> 종합의견 및 각 항목별 보완 사유/권고사항을 직접 편집하실 수 있습니다.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingSupplementRequest(false)}
                  className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300 hover:bg-amber-200"
                >
                  수정 완료
                </button>
              </div>
            )}

            {/* Modal Body: Formal Report Document */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <div className="bg-white border border-slate-300 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto text-xs text-slate-800 space-y-5">
                {/* Report Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      GDX Task Charter Review Report
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                      본부과제 정의서 보완요청서
                    </h2>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono space-y-0.5">
                    <div>문서번호: <span className="font-semibold text-slate-700">{supplementReport.docNo}</span></div>
                    <div>발행일자: <span className="font-semibold text-slate-700">{supplementReport.createdDate}</span></div>
                  </div>
                </div>

                {/* Metadata Table */}
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

                {/* 종합 검토 의견 */}
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
                      className="w-full p-2.5 border border-blue-400 rounded text-xs leading-relaxed bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-800">
                      {supplementReport.overallOpinion}
                    </div>
                  )}
                </div>

                {/* 항목별 보완 필요 내역 (일목요연 정리 테이블) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>2. 항목별 세부 보완 요청 내역 ({supplementReport.items.length}건)</span>
                    </div>
                    {isEditingSupplementRequest && (
                      <span className="text-[11px] text-blue-700 font-semibold">
                        각 셀의 내용을 클릭하여 직접 수정할 수 있습니다.
                      </span>
                    )}
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
                                  className="w-full p-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-sans"
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
                                  className="w-full p-1.5 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white font-sans text-blue-950"
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

                {/* Footer Guide Note */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
                  <div><strong>안내:</strong> 본 보완요청서는 GDX 과제 가이드라인(SMART 원칙 및 우수사례 기준)에 따라 생성되었습니다.</div>
                  <div>발송 시 과제 작성자에게 통보되며, 작성자는 피드백 팝업을 통해 즉시 과제정의서 보완 작업에 착수하게 됩니다.</div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Controls (요구사항: 버튼 2개 생성) */}
            <div className="px-6 py-4 bg-white border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="text-xs text-slate-600">
                {isEditingSupplementRequest ? (
                  <span className="text-amber-700 font-semibold">
                    ✏️ 내용을 수정한 후 [그대로 발송하시겠습니까?] 버튼을 눌러 발송을 완료하세요.
                  </span>
                ) : (
                  <span>
                    보완요청서 내용을 검토하신 후 수정하거나 작성자에게 발송할 수 있습니다.
                  </span>
                )}
              </div>

              {/* Action Buttons requested by user */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* 버튼 1: 보완요청서를 수정하시겠습니까? */}
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

                {/* 버튼 2: 그대로 발송하시겠습니까? */}
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
          MODAL 1: FEEDBACK & REVISION LOOP MODAL (작성자가 피드백 받는 팝업)
          ============================================================= */}
      {isFeedbackModalOpen && evaluationResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
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
                    {evaluationResult.passed ? '가이드 적합성 검토 완료 (우수)' : '본부과제 정의서 피드백 결과'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    GDX 과제정의서 작성 가이드 &amp; SMART 원칙 기반 종합 진단
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

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Reviewer Dispatch Notice Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2.5 text-xs text-blue-900">
                <Send className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-blue-950">[보완요청서 수신]</strong> AX Innovation 센터 검토자로부터 공식 보완요청서가 발송되었습니다.
                  아래 항목별 상세 권고사항을 확인하신 후 하단의 <strong>[과제정의서 보완하기]</strong> 버튼을 눌러 양식을 보완해 주세요.
                </div>
              </div>

              {/* Summary Box */}
              <div className={`p-4 rounded-md border ${
                evaluationResult.passed
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>가이드 진단 결과 점수</span>
                  <span className="text-base">{evaluationResult.score}점 / 100점</span>
                </div>
                <p className="text-xs leading-relaxed">{evaluationResult.summary}</p>
              </div>

              {/* Feedbacks List (보완해야 할 항목별 상세 코멘트) */}
              {!evaluationResult.passed && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    항목별 상세 보완 권고사항
                  </h4>
                  {evaluationResult.feedbacks.map((fb, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-md p-3.5 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          {fb.fieldLabel}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          보완 필요
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                        {fb.comment}
                      </p>
                      <div className="bg-white p-2.5 rounded border border-slate-200 text-xs text-blue-900">
                        <strong className="text-blue-700">💡 권장 개선안:</strong> {fb.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 통과한 경우 (보완 불필요) 안내 */}
              {evaluationResult.passed && (
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    검토 기준 충족 사항
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>과제명 공식 [대상공정 + 개선수단 + 목표지표] 구조 준수</li>
                    <li>전사/본부 경영방향 연계 및 Q-cost 분석/수치 근거 명시</li>
                    <li>SMART 원칙에 따른 정량적 Goal 및 세부 KPI 지표 설정</li>
                    <li>연간 유형 재무성과(백만원/년)의 투명한 산출 계산식 포함</li>
                    <li>3월~12월 세부추진항목 및 마일스톤 일정 확정</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer Controls (요구사항 5, 6, 7 반영) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="px-4 py-2 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                닫기
              </button>

              <div className="flex items-center gap-2">
                {/* 보완이 필요한 경우 -> '과제정의서 보완하기' 활성화 (요구사항 5, 6) */}
                {!evaluationResult.passed && (
                  <button
                    type="button"
                    onClick={handleStartRevision}
                    className="px-4 py-2 rounded font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>과제정의서 보완하기</span>
                  </button>
                )}

                {/* 보완이 불필요한 경우 -> '결재상신하기' 활성화 (요구사항 7) */}
                {evaluationResult.passed && (
                  <button
                    type="button"
                    onClick={handleSubmitApproval}
                    className="px-4 py-2 rounded font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
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
          MODAL 2: DX 데이터플랫폼 화면 (image.png 100% 충실 재현)
          요구사항 2: "DX데이터플랫폼에서 가져오기 버튼을 누르면 첨부의 image.png 화면으로 연결"
          ============================================================= */}
      {isDXPlatformOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col border border-slate-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Top Dark Navy Header (matching image.png) */}
            <div className="bg-[#111c2e] text-white px-5 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-slate-300 hover:text-white flex items-center justify-center p-1"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-blue-400">DX</span>
                  <span className="font-bold text-lg text-white">데이터플랫폼</span>
                </div>
              </div>

              {/* Center Search Input */}
              <div className="relative w-80 max-w-full">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요."
                  value={dxSearchQuery}
                  onChange={(e) => setDxSearchQuery(e.target.value)}
                  className="w-full bg-[#1b283d] text-white placeholder-slate-400 text-xs px-3 py-1.5 pr-8 rounded border border-slate-600 focus:outline-none focus:border-blue-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsDXPlatformOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sub-header: 데이터셋 타이틀 */}
            <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">데이터셋</h2>
              <div className="text-xs text-slate-500">
                원천 및 전사 표준 KPI 카탈로그에서 Goal 지표를 선택해 과제정의서에 직접 반영합니다.
              </div>
            </div>

            {/* 3-Column Body Layout matching image.png */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden bg-slate-50">
              {/* Col 1: Filters (Left Sidebar, md:col-span-3) */}
              <div className="md:col-span-3 p-4 overflow-y-auto space-y-4 bg-white text-xs">
                {/* 도메인 Filter */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      도메인
                    </span>
                    <label className="text-[11px] font-normal text-slate-500 flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-600 w-3 h-3" defaultChecked />
                      OR 검색
                    </label>
                  </div>
                  <div className="mt-2 space-y-1.5 pl-2 text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                      <input
                        type="checkbox"
                        checked={activeDomainFilter === 'all' || activeDomainFilter === '공통'}
                        onChange={() => setActiveDomainFilter(activeDomainFilter === '공통' ? 'all' : '공통')}
                        className="rounded text-blue-600 w-3.5 h-3.5"
                      />
                      <span>공통</span>
                    </label>
                    <div className="pl-4 text-slate-500 space-y-1">
                      <div className="hover:text-blue-600 cursor-pointer">교육</div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 pt-1">
                      <input type="checkbox" className="rounded text-blue-600 w-3.5 h-3.5" defaultChecked />
                      <span className="font-semibold text-slate-900">AMS사업본부</span>
                    </label>
                    <div className="pl-4 text-slate-500 space-y-1">
                      <div className="hover:text-blue-600 cursor-pointer">Airbag</div>
                      <div className="hover:text-blue-600 cursor-pointer">샤무드</div>
                      <div className="hover:text-blue-600 cursor-pointer">FCH</div>
                      <div className="hover:text-blue-600 cursor-pointer">KVC</div>
                      <div className="hover:text-blue-600 cursor-pointer">CSM</div>
                      <div className="hover:text-blue-600 cursor-pointer">CIM</div>
                      <div className="hover:text-blue-600 cursor-pointer">김천1공장(PU)</div>
                      <div className="hover:text-blue-600 cursor-pointer">울산2공장(CSM)</div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 pt-1">
                      <input
                        type="checkbox"
                        checked={activeDomainFilter === 'all' || activeDomainFilter === 'Specialty소재사업본부'}
                        onChange={() => setActiveDomainFilter(activeDomainFilter === 'Specialty소재사업본부' ? 'all' : 'Specialty소재사업본부')}
                        className="rounded text-blue-600 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-blue-900">Specialty소재사업본부</span>
                    </label>
                  </div>
                </div>

                {/* 분류 Filter */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      분류
                    </span>
                    <label className="text-[11px] font-normal text-slate-500 flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-600 w-3 h-3" />
                      OR 검색
                    </label>
                  </div>
                  <div className="mt-2 space-y-1 pl-2 text-slate-600">
                    <div className="font-semibold text-slate-700">데이터셋 유형</div>
                    <div className="pl-2 space-y-1">
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" className="rounded text-blue-600 w-3 h-3" defaultChecked />
                        원천 테이블
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" className="rounded text-blue-600 w-3 h-3" defaultChecked />
                        화면 데이터
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" className="rounded text-blue-600 w-3 h-3" />
                        분석 데이터셋
                      </label>
                    </div>

                    <div className="font-semibold text-slate-700 pt-1.5">시스템 명칭</div>
                    <div className="pl-2 space-y-1">
                      <label className="flex items-center gap-1.5"><input type="checkbox" className="rounded text-blue-600 w-3 h-3" /> 히스토리안</label>
                      <label className="flex items-center gap-1.5"><input type="checkbox" className="rounded text-blue-600 w-3 h-3" /> MES시스템</label>
                      <label className="flex items-center gap-1.5"><input type="checkbox" className="rounded text-blue-600 w-3 h-3" /> SAP시스템</label>
                    </div>
                  </div>
                </div>

                {/* 데이터베이스 Filter */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      데이터베이스
                    </span>
                    <label className="text-[11px] font-normal text-slate-500 flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-600 w-3 h-3" />
                      OR 검색
                    </label>
                  </div>
                  <div className="mt-2 space-y-1 pl-2 text-slate-600">
                    <div className="text-slate-800 font-medium">Hive</div>
                    <div className="pl-2 space-y-1">
                      <div>kii_airbag</div>
                      <div>kii_airbag_sb</div>
                      <div>kii_akilen</div>
                      <div>kii_akilen_sb</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: Dataset List (Center, md:col-span-5) */}
              <div className="md:col-span-5 flex flex-col bg-white overflow-hidden border-r border-slate-200">
                {/* Search & Sort Controls */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
                  <div className="text-xs font-bold text-slate-800">
                    데이터셋 <span className="text-blue-600">2976건</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="검색어"
                      value={dxSearchQuery}
                      onChange={(e) => setDxSearchQuery(e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded bg-white w-28 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700">
                      <option>최근 변경 순</option>
                      <option>이름 순</option>
                    </select>
                  </div>
                </div>

                {/* Dataset Scroll Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                  {filteredDXDatasets.map((ds) => {
                    const isSelected = ds.id === selectedDXDatasetId;
                    return (
                      <div
                        key={ds.id}
                        onClick={() => setSelectedDXDatasetId(ds.id)}
                        className={`p-3 rounded-md cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-400 shadow-2xs'
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium mb-1">
                          <span>🍯</span>
                          <span className="truncate">{ds.domain}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug break-all">
                          {ds.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          {ds.tableName}
                        </div>
                        {ds.tag && (
                          <div className="mt-1.5">
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 font-semibold">
                              #{ds.tag}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Col 3: Column Inspector & Goal Apply Action (Right, md:col-span-4) */}
              <div className="md:col-span-4 flex flex-col bg-white overflow-hidden p-4">
                <div className="pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 break-all">
                    {selectedDXDataset.tableName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>컬럼 {selectedDXDataset.columns.length}건</span>
                    <span className="text-[10px] text-slate-400">{selectedDXDataset.updatedAt}</span>
                  </div>
                </div>

                {/* Columns Table */}
                <div className="flex-1 overflow-y-auto my-3 border border-slate-200 rounded">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-3 font-semibold">필드</th>
                        <th className="py-1.5 px-3 font-semibold text-right">타입</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDXDataset.columns.map((col, cIdx) => (
                        <tr key={cIdx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3">
                            <div className="font-semibold text-slate-800">{col.name}</div>
                            {col.comment && <div className="text-[10px] text-slate-400">{col.comment}</div>}
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              {col.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Suggested Goal Metric Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    추천 Goal 지표 (과제정의서 자동연동)
                  </div>
                  <div className="text-xs text-slate-800 space-y-1">
                    <div><strong>지표명:</strong> {selectedDXDataset.suggestedMetric.name}</div>
                    <div className="flex items-center gap-3">
                      <span><strong>현수준:</strong> {selectedDXDataset.suggestedMetric.current}{selectedDXDataset.suggestedMetric.unit}</span>
                      <span><strong>목표:</strong> {selectedDXDataset.suggestedMetric.target}{selectedDXDataset.suggestedMetric.unit}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight pt-1">
                      {selectedDXDataset.suggestedMetric.description}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button to import into Charter */}
                <button
                  type="button"
                  onClick={() => handleApplyDXDataset(selectedDXDataset)}
                  className="w-full py-2.5 px-4 rounded-md font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
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
          MODAL 3: 작성 가이드 & BP 사례 열람 모달 (첨부 PDF 가이드)
          ============================================================= */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[85vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Guide Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">GDX 과제정의서 작성 가이드</h3>
                  <p className="text-xs text-slate-400">AX Innovation 센터 AX기획팀 (2026. 9)</p>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
              {/* Left TOC */}
              <div className="md:col-span-4 p-3 bg-slate-50 overflow-y-auto space-y-1">
                {GUIDE_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedGuideTopic(sec.id)}
                    className={`w-full text-left p-3 rounded text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedGuideTopic === sec.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </button>
                ))}

                <div className="pt-4 px-1">
                  <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="font-bold flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-700" />
                      우수사례 즉시 적용
                    </div>
                    <p className="text-[11px] leading-tight text-amber-800">
                      가이드 18페이지에 수록된 금상/우수상 수상작(제막공정 이물 개선)을 양식에 로드해 볼 수 있습니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleLoadBPSample();
                        setIsGuideOpen(false);
                      }}
                      className="w-full py-1.5 px-2 bg-amber-600 text-white font-semibold rounded text-xs hover:bg-amber-700"
                    >
                      우수사례 템플릿 로드
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="md:col-span-8 p-6 overflow-y-auto bg-white space-y-4">
                {(() => {
                  const section = GUIDE_SECTIONS.find((s) => s.id === selectedGuideTopic) || GUIDE_SECTIONS[0];
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                        <p className="text-xs text-blue-700 font-medium mt-1">{section.summary}</p>
                      </div>

                      <div className="space-y-3 pt-2">
                        {section.content.map((p, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-md text-xs leading-relaxed ${
                              p.startsWith('🏆')
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium'
                                : p.startsWith('❌')
                                ? 'bg-rose-50 border border-rose-200 text-rose-950'
                                : 'bg-slate-50 border border-slate-200 text-slate-800'
                            }`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Guide Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-2 rounded text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
              >
                가이드 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 4: 완성된 과제정의서 팝업 & '결재상신 하시겠습니까?' 확인 모달
          ============================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    과제정의서 최종 확인 (완성본 미리보기)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    작성된 과제정의서의 전체 내용을 검토한 후 결재를 진행합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Document Full View (첨부 양식 1:1 완성본 형태) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <div className="bg-white border border-slate-300 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto text-xs text-slate-800 space-y-4">
                {/* Document Top Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      대외비 (Confidential)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">[첨부2]</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    작성일자: {new Date().toLocaleDateString('ko-KR')}
                  </div>
                </div>

                {/* Title & Approval Table Header */}
                <div className="flex items-center justify-between gap-4 pb-2">
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      GDX과제 기술서
                    </h2>
                  </div>

                  {/* 결재란 (작성 / 검토 / 승인) */}
                  <div className="border border-slate-400 bg-white text-center shadow-2xs">
                    <table className="w-48 border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-400">
                          <th className="py-0.5 px-2 border-r border-slate-400 font-semibold w-1/3">작 성</th>
                          <th className="py-0.5 px-2 border-r border-slate-400 font-semibold w-1/3">검 토</th>
                          <th className="py-0.5 px-2 font-semibold w-1/3">승 인</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="h-10 text-slate-400">
                          <td className="border-r border-slate-400 align-middle">
                            <div className="text-blue-700 font-bold text-[10px] leading-tight">
                              <span>{formData.manager || '김생산'}</span>
                              <span className="text-[9px] block text-blue-500">(상신대기)</span>
                            </div>
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

                {/* 과제 유형 표시 */}
                <div className="flex items-center gap-6 py-2 px-3 bg-slate-50 border border-slate-300 font-semibold text-xs">
                  <span className="text-slate-600">과제 구분 :</span>
                  {(['본부과제', '사업이슈과제', 'Quick-Win과제'] as TaskType[]).map((type) => (
                    <span
                      key={type}
                      className={`inline-flex items-center gap-1.5 ${
                        formData.taskType === type ? 'text-blue-900 font-bold' : 'text-slate-400 font-normal'
                      }`}
                    >
                      <span className="text-sm">{formData.taskType === type ? '■' : '□'}</span>
                      <span>{type}</span>
                    </span>
                  ))}
                </div>

                {/* Document Main Grid Table */}
                <div className="border border-slate-400 divide-y divide-slate-300">
                  {/* Row: 과제명 */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300 flex items-center">
                      과제명
                    </div>
                    <div className="col-span-10 p-2.5 font-bold text-slate-900 text-sm bg-white">
                      {formData.title || '-'}
                    </div>
                  </div>

                  {/* Row: 대상공정 & 담당자/참여자 */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300 flex items-center">
                      대상공정 / 제품
                    </div>
                    <div className="col-span-4 p-2.5 border-r border-slate-300 font-medium text-slate-800">
                      {formData.processProduct || '-'}
                    </div>
                    <div className="col-span-6 grid grid-cols-2 divide-x divide-slate-300">
                      <div className="p-2 space-y-1">
                        <div><span className="text-slate-500 font-medium">과제담당자:</span> <strong className="text-slate-900">{formData.manager}</strong></div>
                        <div><span className="text-slate-500 font-medium">담당부서:</span> <span className="text-slate-800">{formData.managerDept}</span></div>
                      </div>
                      <div className="p-2 space-y-1">
                        <div><span className="text-slate-500 font-medium">과제참여자:</span> <strong className="text-slate-900">{formData.participants || '-'}</strong></div>
                        <div><span className="text-slate-500 font-medium">참여부서:</span> <span className="text-slate-800">{formData.participantsDept || '-'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Row: 선정 사유 (문제점 기술) */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">
                      <div>선정 사유</div>
                      <div className="text-[10px] text-slate-500 font-normal">(문제점 기술)</div>
                    </div>
                    <div className="col-span-10 p-2.5 whitespace-pre-wrap leading-relaxed text-slate-800 bg-white">
                      {formData.reason || '-'}
                    </div>
                  </div>

                  {/* Row: 개선 내용 */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300 flex items-center">
                      개선 내용
                    </div>
                    <div className="col-span-10 p-2.5 text-slate-800 bg-white font-medium">
                      {formData.improvementContent || '-'}
                    </div>
                  </div>

                  {/* Row: 목표 테이블 & 예상 재무성과 */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">
                      목표
                    </div>
                    <div className="col-span-10 p-2.5 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* KPI Table */}
                        <div className="md:col-span-7 border border-slate-300 rounded-none overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                              <tr>
                                <th className="py-1 px-2 border-r border-slate-300 w-20">목표 구분</th>
                                <th className="py-1 px-2 border-r border-slate-300">지표명</th>
                                <th className="py-1 px-2 border-r border-slate-300 w-16 text-center">현수준</th>
                                <th className="py-1 px-2 w-16 text-center">목표</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {formData.kpis.map((kpi) => (
                                <tr key={kpi.id} className={kpi.type === 'Goal' ? 'bg-blue-50/50 font-bold' : ''}>
                                  <td className="py-1 px-2 border-r border-slate-300 text-slate-800">{kpi.type}</td>
                                  <td className="py-1 px-2 border-r border-slate-300 text-slate-900">{kpi.name || '-'}</td>
                                  <td className="py-1 px-2 border-r border-slate-300 text-center text-slate-600">{kpi.currentLevel || '-'}</td>
                                  <td className="py-1 px-2 text-center text-blue-700 font-bold">{kpi.targetLevel || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Financial Benefit */}
                        <div className="md:col-span-5 border border-slate-300 p-2 bg-slate-50/60 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 text-[11px]">
                              예상 유형 재무성과(백만원/년)
                            </div>
                            <div className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-800">
                              {formData.financialBenefit || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Qualitative & Investment */}
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-slate-200 text-[11px]">
                        <div className="border border-slate-200 p-2 bg-slate-50/50">
                          <span className="font-bold text-slate-700 block mb-0.5">정성적 효과</span>
                          <span className="text-slate-800">{formData.qualitativeEffect || '-'}</span>
                        </div>
                        <div className="border border-slate-200 p-2 bg-slate-50/50">
                          <span className="font-bold text-slate-700 block mb-0.5">투자비용</span>
                          <span className="text-slate-800">{formData.investmentCost || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row: 추진일정 */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">
                      추진일정
                    </div>
                    <div className="col-span-10 p-2.5 bg-white overflow-x-auto">
                      <table className="w-full text-[10px] border border-slate-300 border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                            <th className="py-1 px-2 border-r border-slate-300 w-44 text-left font-bold">세부추진항목</th>
                            <th className="py-1 px-2 border-r border-slate-300 w-24 text-left font-bold">세부목표</th>
                            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                              <th key={m} className="py-1 px-1 border-r border-slate-300 last:border-r-0 text-center font-mono w-7">
                                {m}월
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {formData.schedules.map((s) => (
                            <tr key={s.id}>
                              <td className="py-1 px-2 border-r border-slate-300 font-medium text-slate-800">{s.task}</td>
                              <td className="py-1 px-2 border-r border-slate-300 text-slate-600">{s.milestone}</td>
                              {s.months.map((active, mIdx) => (
                                <td key={mIdx} className="border-r border-slate-300 last:border-r-0 text-center p-0">
                                  <div className="h-5 flex items-center justify-center">
                                    {active && <div className="w-full h-3 bg-blue-600 rounded-2xs mx-0.5"></div>}
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

                {/* Footer Legal Note */}
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                  본 문서는 영업상 주요 자산으로서 부정경쟁방지 및 영업비밀보호에 관한 법률을 포함하여 관련 법령에 따라 보호되는 중요한 정보를 포함하고 있습니다.
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Bar (요청 문구: '결재상신 하시겠습니까?') */}
            <div className="px-6 py-4 bg-white border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    결재상신 하시겠습니까?
                  </h4>
                  <p className="text-xs text-slate-500">
                    상신 시 상위 결재권자의 검토 라인으로 전송되며 과제 코드가 부여됩니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  수정하기 / 취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFinalSubmit}
                  className="px-6 py-2.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition-all active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>결재상신</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 5: SUBMITTED SUCCESS DIALOG (결재 상신 완료 안내)
          요구사항 3, 7: "과제정의서를 상신하였습니다."
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
              <div><strong>상신시각:</strong> {new Date().toLocaleTimeString()}</div>
            </div>

            <button
              type="button"
              onClick={() => setSubmittedMessage(null)}
              className="w-full py-2.5 px-4 rounded-md font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification when Supplement Report is Sent */}
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
