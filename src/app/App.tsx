import {
  Activity,
  ArrowRight,
  Baby,
  BarChart3,
  Check,
  ChevronDown,
  CircleAlert,
  HeartPulse,
  Info,
  LockKeyhole,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Weight
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes
} from "react";
import type {
  AnthropometricResult,
  AnthropometryAssessment,
  AnthropometryInput,
  GrowthChartModel,
  Indicator,
  Sex
} from "../features/anthropometry/index.ts";
import { GrowthCharts } from "../features/charts/GrowthCharts.tsx";

type FormState = {
  sex: Sex | "";
  birthDate: string;
  assessmentDate: string;
  weightKg: string;
  statureCm: string;
  measurementPosition: "length" | "height";
  headCircumferenceCm: string;
  armCircumferenceCm: string;
  tricepsSkinfoldMm: string;
  subscapularSkinfoldMm: string;
  oedema: boolean;
};

const INDICATOR_LABELS: Record<Indicator, string> = {
  WEIGHT_FOR_AGE: "Peso para idade",
  HEIGHT_FOR_AGE: "Estatura para idade",
  WEIGHT_FOR_LENGTH: "Peso para comprimento",
  WEIGHT_FOR_HEIGHT: "Peso para altura",
  BMI_FOR_AGE: "IMC para idade",
  HEAD_CIRCUMFERENCE_FOR_AGE: "Perímetro cefálico",
  ARM_CIRCUMFERENCE_FOR_AGE: "Circunferência braquial",
  TRICEPS_SKINFOLD_FOR_AGE: "Prega cutânea tricipital",
  SUBSCAPULAR_SKINFOLD_FOR_AGE: "Prega cutânea subescapular"
};

const CLASSIFICATION_LABELS_PT_BR: Readonly<Record<string, string>> = {
  SEVERE_STUNTING: "Muito baixa estatura para a idade",
  STUNTING: "Baixa estatura para a idade",
  TALL: "Estatura elevada para a idade",
  EXPECTED_HEIGHT: "Estatura adequada para a idade",
  SEVERE_UNDERWEIGHT: "Muito baixo peso para a idade",
  UNDERWEIGHT: "Baixo peso para a idade",
  HIGH_WEIGHT_FOR_AGE: "Peso/idade acima de +2 Z; interpretar com IMC/idade ou peso/estatura",
  EXPECTED_WEIGHT: "Peso adequado para a idade",
  SEVERE_WASTING: "Magreza acentuada",
  WASTING: "Magreza",
  EUTROPHY: "Eutrofia",
  RISK_OF_OVERWEIGHT: "Risco de sobrepeso",
  OVERWEIGHT: "Sobrepeso",
  OBESITY: "Obesidade",
  SEVERE_THINNESS: "Magreza acentuada",
  THINNESS: "Magreza",
  VERY_LOW_Z: "Abaixo de -3 Z",
  LOW_Z: "Entre -3 e -2 Z",
  REFERENCE_Z_BAND: "Entre -2 e +2 Z",
  HIGH_Z: "Entre +2 e +3 Z",
  VERY_HIGH_Z: "Acima de +3 Z"
};

const EMPTY_FORM: FormState = {
  sex: "",
  birthDate: "",
  assessmentDate: new Date().toISOString().slice(0, 10),
  weightKg: "",
  statureCm: "",
  measurementPosition: "length",
  headCircumferenceCm: "",
  armCircumferenceCm: "",
  tricepsSkinfoldMm: "",
  subscapularSkinfoldMm: "",
  oedema: false
};

const asNumber = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumber = (value: number | null, digits = 2): string => {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: value === 0 ? "never" : "auto"
  }).format(value);
};

const formatUnit = (unit: AnthropometricResult["measurementUnit"]): string =>
  unit === "kg/m2" ? "kg/m²" : unit;

function buildInput(form: FormState): AnthropometryInput {
  const weightKg = asNumber(form.weightKg);
  const statureCm = asNumber(form.statureCm);
  const headCircumferenceCm = asNumber(form.headCircumferenceCm);
  const armCircumferenceCm = asNumber(form.armCircumferenceCm);
  const tricepsSkinfoldMm = asNumber(form.tricepsSkinfoldMm);
  const subscapularSkinfoldMm = asNumber(form.subscapularSkinfoldMm);

  return {
    sex: form.sex as Sex,
    birthDate: form.birthDate,
    assessmentDate: form.assessmentDate,
    measurementPosition: form.measurementPosition,
    oedema: form.oedema,
    ...(weightKg === null ? {} : { weightKg }),
    ...(statureCm === null ? {} : { statureCm }),
    ...(headCircumferenceCm === null ? {} : { headCircumferenceCm }),
    ...(armCircumferenceCm === null ? {} : { armCircumferenceCm }),
    ...(tricepsSkinfoldMm === null ? {} : { tricepsSkinfoldMm }),
    ...(subscapularSkinfoldMm === null ? {} : { subscapularSkinfoldMm })
  };
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  unit?: string;
};

function Field({ label, hint, unit, id, ...inputProps }: FieldProps) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="input-shell">
        <input id={id} {...inputProps} />
        {unit ? <span className="input-unit">{unit}</span> : null}
      </span>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "logo-crop logo-crop-compact" : "logo-crop"}>
      <img src="/pediametric-logo.png" alt="PediaMetric" />
    </span>
  );
}

function ZScoreMap({ results }: { results: AnthropometricResult[] }) {
  const valid = results.filter((result) => result.zScore !== null);
  if (valid.length === 0) return null;

  return (
    <div className="zmap" aria-label="Posição dos escores Z entre menos quatro e mais quatro">
      <div className="zmap-head">
        <div>
          <span className="eyebrow">VISÃO COMPARATIVA</span>
          <h3>Mapa de escores Z</h3>
        </div>
        <span className="zmap-legend"><i /> faixa central</span>
      </div>
      <div className="zmap-axis" aria-hidden="true">
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((tick) => (
          <span key={tick}>{tick > 0 ? `+${tick}` : tick}</span>
        ))}
      </div>
      <div className="zmap-tracks">
        {valid.map((result) => {
          const z = result.zScore ?? 0;
          const position = ((Math.max(-4, Math.min(4, z)) + 4) / 8) * 100;
          return (
            <div className="zmap-row" key={result.indicator}>
              <span>{INDICATOR_LABELS[result.indicator]}</span>
              <div className="zmap-line">
                <div className="zmap-safe" />
                <motion.i
                  initial={{ left: "50%", scale: 0 }}
                  animate={{ left: `${position}%`, scale: 1 }}
                  transition={{ type: "spring", stiffness: 190, damping: 18 }}
                  title={`Z ${formatNumber(z)}`}
                >
                  <b>{formatNumber(z, 1)}</b>
                </motion.i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ result, index }: { result: AnthropometricResult; index: number }) {
  const classification = result.classification
    ? CLASSIFICATION_LABELS_PT_BR[result.classification.code] ?? result.classification.code
    : "Sem classificação aplicável";
  return (
    <motion.article
      className="result-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="result-card-top">
        <span className="result-icon"><Activity size={17} /></span>
        <span className={result.validity.valid ? "status-dot status-ok" : "status-dot status-alert"}>
          {result.validity.valid ? "válido" : "revisar"}
        </span>
      </div>
      <h3>{INDICATOR_LABELS[result.indicator]}</h3>
      <p className="result-classification">{classification}</p>
      <div className="result-numbers">
        <div>
          <span>Escore Z</span>
          <strong>{formatNumber(result.zScore)}</strong>
        </div>
        <div>
          <span>Percentil</span>
          <strong>{result.percentile === null ? "—" : formatNumber(result.percentile, 1)}</strong>
        </div>
        <div>
          <span>Medida</span>
          <strong>{formatNumber(result.measurement, 1)} <small>{formatUnit(result.measurementUnit)}</small></strong>
        </div>
      </div>
      {result.validity.warnings.length > 0 ? (
        <div className="result-warning">
          <CircleAlert size={15} />
          <span>{result.validity.warnings[0]}</span>
        </div>
      ) : null}
    </motion.article>
  );
}

function ResultsPanel({
  assessment,
  chartModels,
  onReset
}: {
  assessment: AnthropometryAssessment | null;
  chartModels: readonly GrowthChartModel[];
  onReset: () => void;
}) {
  if (!assessment) {
    return (
      <aside className="results-panel results-empty" aria-live="polite">
        <div className="empty-orbit">
          <div className="empty-core"><BarChart3 size={32} /></div>
          <span className="orbit-dot orbit-dot-one" />
          <span className="orbit-dot orbit-dot-two" />
        </div>
        <span className="eyebrow">RESULTADO EM TEMPO REAL</span>
        <h2>Os dados ganham clareza aqui.</h2>
        <p>Preencha a avaliação para visualizar indicadores, classificações e a posição de cada escore Z.</p>
        <div className="empty-features">
          <span><Check size={14} /> WHO 2006 e 2007</span>
          <span><Check size={14} /> Cálculo local</span>
          <span><Check size={14} /> Sem cadastro</span>
        </div>
      </aside>
    );
  }

  const age = assessment.age;
  const validResults = assessment.results.filter((result) => result.zScore !== null);

  return (
    <aside className="results-panel results-ready" aria-live="polite">
      <div className="results-summary">
        <div>
          <span className="eyebrow">AVALIAÇÃO CONCLUÍDA</span>
          <h2>Panorama antropométrico</h2>
        </div>
        <button className="icon-button" type="button" onClick={onReset} aria-label="Limpar avaliação">
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="patient-summary">
        <div>
          <Baby size={18} />
          <span>Idade exata</span>
          <strong>{age ? `${age.calendar.years}a ${age.calendar.months}m ${age.calendar.days}d` : "—"}</strong>
        </div>
        <div>
          <ShieldCheck size={18} />
          <span>Referência</span>
          <strong>{assessment.reference?.replace("_", " ") ?? "—"}</strong>
        </div>
        <div>
          <BarChart3 size={18} />
          <span>Indicadores</span>
          <strong>{validResults.length}</strong>
        </div>
      </div>

      {assessment.validity.errors.length > 0 ? (
        <div className="assessment-message assessment-error">
          <CircleAlert size={18} />
          <div>
            <strong>Revise os dados informados</strong>
            <p>{assessment.validity.errors.join(" ")}</p>
          </div>
        </div>
      ) : null}

      {assessment.validity.warnings.length > 0 ? (
        <div className="assessment-message">
          <Info size={18} />
          <div>
            <strong>Atenção à interpretação</strong>
            <p>{assessment.validity.warnings.join(" ")}</p>
          </div>
        </div>
      ) : null}

      <div className="result-grid">
        {assessment.results.map((result, index) => (
          <ResultCard key={result.indicator} result={result} index={index} />
        ))}
      </div>

      <GrowthCharts models={chartModels} />

      <ZScoreMap results={assessment.results} />

      <p className="clinical-note">
        <Stethoscope size={16} />
        Resultados de apoio à avaliação. A interpretação final deve considerar história clínica e exame físico.
      </p>
    </aside>
  );
}

export function App() {
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [step, setStep] = useState<1 | 2>(1);
  const [showOptional, setShowOptional] = useState(false);
  const [assessment, setAssessment] = useState<AnthropometryAssessment | null>(null);
  const [chartModels, setChartModels] = useState<GrowthChartModel[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formError, setFormError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const filledMeasurements = useMemo(
    () => [
      form.weightKg,
      form.statureCm,
      form.headCircumferenceCm,
      form.armCircumferenceCm,
      form.tricepsSkinfoldMm,
      form.subscapularSkinfoldMm
    ].filter((value) => value.trim()).length,
    [form]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
  };

  const nextStep = () => {
    if (!form.sex || !form.birthDate || !form.assessmentDate) {
      setFormError("Informe sexo, data de nascimento e data da avaliação.");
      return;
    }
    if (form.assessmentDate < form.birthDate) {
      setFormError("A data da avaliação não pode ser anterior ao nascimento.");
      return;
    }
    setFormError("");
    setStep(2);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (filledMeasurements === 0) {
      setFormError("Informe pelo menos uma medida antropométrica.");
      return;
    }
    try {
      setIsCalculating(true);
      const { assessAnthropometry, createGrowthChartModel } = await import("../features/anthropometry/index.ts");
      const nextAssessment = assessAnthropometry(buildInput(form));
      const chartOrder: Readonly<Record<string, number>> = {
        WEIGHT_FOR_AGE: 0,
        HEIGHT_FOR_AGE: 1,
        HEAD_CIRCUMFERENCE_FOR_AGE: 2,
        BMI_FOR_AGE: 3
      };
      const nextChartModels = nextAssessment.results
        .map(createGrowthChartModel)
        .filter((model): model is GrowthChartModel => model !== null)
        .sort((first, second) =>
          (chartOrder[first.indicator] ?? 99) - (chartOrder[second.indicator] ?? 99)
        );
      setAssessment(nextAssessment);
      setChartModels(nextChartModels);
      setFormError("");
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível processar a avaliação.");
    } finally {
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setForm({ ...EMPTY_FORM, assessmentDate: new Date().toISOString().slice(0, 10) });
    setAssessment(null);
    setChartModels([]);
    setStep(1);
    setFormError("");
    document.getElementById("avaliacao")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAssessment = () => {
    document.getElementById("avaliacao")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="PediaMetric — início">
          <Logo />
        </a>
        <nav aria-label="Navegação principal">
          <a href="#avaliacao">Avaliação</a>
          <a href="#metodologia">Metodologia</a>
          <a href="#privacidade">Privacidade</a>
        </nav>
        <button className="header-cta" type="button" onClick={scrollToAssessment}>
          Nova avaliação <ArrowRight size={16} />
        </button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-grid" aria-hidden="true" />
          <motion.div
            className="hero-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="hero-badge"><Sparkles size={15} /> Tecnologia clínica, cuidado humano</span>
            <h1>Crescimento em foco.<br /><em>Decisões com mais clareza.</em></h1>
            <p>
              Avaliação antropométrica pediátrica precisa, visual e segura, baseada nas referências oficiais WHO 2006 e 2007.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={scrollToAssessment}>
                Iniciar avaliação <ArrowRight size={18} />
              </button>
              <a className="text-link" href="#metodologia">Conhecer a metodologia</a>
            </div>
            <div className="trust-row">
              <span><ShieldCheck size={17} /> Processamento local</span>
              <span><LockKeyhole size={17} /> Nenhum dado armazenado</span>
              <span><HeartPulse size={17} /> Referências WHO</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            aria-label="Visualização tecnológica de crescimento pediátrico"
          >
            <div className="tech-sphere">
              <div className="sphere-ring sphere-ring-one" />
              <div className="sphere-ring sphere-ring-two" />
              <div className="sphere-center">
                <span className="sphere-logo" aria-hidden="true">
                  <img src="/pediametric-logo.png" alt="" />
                </span>
              </div>
              <span className="sphere-node node-one" />
              <span className="sphere-node node-two" />
              <span className="sphere-node node-three" />
            </div>
            <motion.div className="float-card float-card-one" animate={reduceMotion ? {} : { y: [0, -9, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <span><Activity size={16} /></span>
              <div><small>Escore Z</small><strong>Precisão contínua</strong></div>
            </motion.div>
            <motion.div className="float-card float-card-two" animate={reduceMotion ? {} : { y: [0, 8, 0] }} transition={{ duration: 4.8, repeat: Infinity }}>
              <span><Baby size={16} /></span>
              <div><small>Faixa etária</small><strong>0 a 19 anos</strong></div>
            </motion.div>
            <div className="mini-bars" aria-hidden="true">
              {[28, 45, 61, 52, 76, 91, 84].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
            </div>
          </motion.div>
        </section>

        <section className="assessment-section" id="avaliacao">
          <div className="section-heading">
            <span className="section-kicker"><i /> AVALIAÇÃO ANTROPOMÉTRICA</span>
            <h2>Dados essenciais. Resultado completo.</h2>
            <p>Um fluxo simples em duas etapas, com cálculos realizados inteiramente no seu dispositivo.</p>
          </div>

          <div className="privacy-ribbon">
            <LockKeyhole size={17} />
            <span><strong>Privacidade por padrão:</strong> os dados desta avaliação não saem do navegador.</span>
            <span className="privacy-live"><i /> local</span>
          </div>

          <div className="assessment-layout">
            <div className="form-panel">
              <div className="form-progress">
                <button className={step === 1 ? "progress-step active" : "progress-step done"} type="button" onClick={() => setStep(1)}>
                  <span>{step === 2 ? <Check size={15} /> : "1"}</span>
                  <div><strong>Dados</strong><small>Identificação clínica</small></div>
                </button>
                <i />
                <button className={step === 2 ? "progress-step active" : "progress-step"} type="button" onClick={() => step === 2 && setStep(2)}>
                  <span>2</span>
                  <div><strong>Medidas</strong><small>Antropometria</small></div>
                </button>
                <i />
                <div className={assessment ? "progress-step done" : "progress-step"}>
                  <span>{assessment ? <Check size={15} /> : "3"}</span>
                  <div><strong>Resultados</strong><small>Análise visual</small></div>
                </div>
              </div>

              <form onSubmit={submit} noValidate>
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      className="form-step"
                      key="step-one"
                      initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? {} : { opacity: 0, x: 12 }}
                    >
                      <div className="form-title">
                        <span><Baby size={20} /></span>
                        <div><h3>Dados da criança</h3><p>Informações usadas para selecionar a referência adequada.</p></div>
                      </div>

                      <fieldset className="field-group">
                        <legend>Sexo de referência</legend>
                        <div className="segmented">
                          <button className={form.sex === "female" ? "selected" : ""} type="button" onClick={() => update("sex", "female")} aria-pressed={form.sex === "female"}>Feminino</button>
                          <button className={form.sex === "male" ? "selected" : ""} type="button" onClick={() => update("sex", "male")} aria-pressed={form.sex === "male"}>Masculino</button>
                        </div>
                      </fieldset>

                      <div className="two-columns">
                        <Field label="Data de nascimento" id="birth-date" type="date" value={form.birthDate} max={form.assessmentDate} onChange={(event) => update("birthDate", event.target.value)} required />
                        <Field label="Data da avaliação" id="assessment-date" type="date" value={form.assessmentDate} min={form.birthDate || undefined} onChange={(event) => update("assessmentDate", event.target.value)} required />
                      </div>

                      <label className="check-row">
                        <input type="checkbox" checked={form.oedema} onChange={(event) => update("oedema", event.target.checked)} />
                        <span className="custom-check"><Check size={13} /></span>
                        <span><strong>Presença de edema bilateral</strong><small>Indicadores dependentes de peso serão sinalizados.</small></span>
                      </label>

                      <button className="primary-button form-next" type="button" onClick={nextStep}>
                        Continuar para medidas <ArrowRight size={17} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="form-step"
                      key="step-two"
                      initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? {} : { opacity: 0, x: -12 }}
                    >
                      <div className="form-title">
                        <span><Ruler size={20} /></span>
                        <div><h3>Medidas atuais</h3><p>Use as medidas obtidas na data desta avaliação.</p></div>
                      </div>

                      <div className="primary-measures">
                        <Field label="Peso" id="weight" type="number" inputMode="decimal" min="0" step="0.01" placeholder="Ex.: 12,45" value={form.weightKg} onChange={(event) => update("weightKg", event.target.value)} unit="kg" />
                        <Field label="Comprimento / altura" id="stature" type="number" inputMode="decimal" min="0" step="0.1" placeholder="Ex.: 89,3" value={form.statureCm} onChange={(event) => update("statureCm", event.target.value)} unit="cm" />
                        <Field label="Perímetro cefálico" id="head" type="number" inputMode="decimal" min="0" step="0.1" placeholder="Ex.: 47,5" value={form.headCircumferenceCm} onChange={(event) => update("headCircumferenceCm", event.target.value)} unit="cm" />
                      </div>

                      <fieldset className="field-group">
                        <legend>Como a estatura foi medida?</legend>
                        <div className="segmented segmented-icons">
                          <button className={form.measurementPosition === "length" ? "selected" : ""} type="button" onClick={() => update("measurementPosition", "length")} aria-pressed={form.measurementPosition === "length"}><Baby size={16} /> Deitado</button>
                          <button className={form.measurementPosition === "height" ? "selected" : ""} type="button" onClick={() => update("measurementPosition", "height")} aria-pressed={form.measurementPosition === "height"}><Ruler size={16} /> Em pé</button>
                        </div>
                      </fieldset>

                      <button className="optional-toggle" type="button" onClick={() => setShowOptional((current) => !current)} aria-expanded={showOptional}>
                        <span><Sparkles size={16} /> Medidas complementares <small>opcional</small></span>
                        <ChevronDown className={showOptional ? "rotated" : ""} size={18} />
                      </button>

                      <AnimatePresence initial={false}>
                        {showOptional ? (
                          <motion.div className="optional-fields" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <div className="two-columns">
                              <Field label="Circunferência braquial" id="arm" type="number" inputMode="decimal" min="0" step="0.1" value={form.armCircumferenceCm} onChange={(event) => update("armCircumferenceCm", event.target.value)} unit="cm" />
                              <Field label="Prega tricipital" id="triceps" type="number" inputMode="decimal" min="0" step="0.1" value={form.tricepsSkinfoldMm} onChange={(event) => update("tricepsSkinfoldMm", event.target.value)} unit="mm" />
                              <Field label="Prega subescapular" id="subscapular" type="number" inputMode="decimal" min="0" step="0.1" value={form.subscapularSkinfoldMm} onChange={(event) => update("subscapularSkinfoldMm", event.target.value)} unit="mm" />
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>

                      <div className="form-actions">
                        <button className="secondary-button" type="button" onClick={() => setStep(1)}>Voltar</button>
                        <button className="primary-button" type="submit" disabled={isCalculating}>
                          {isCalculating ? "Processando…" : "Calcular avaliação"} <BarChart3 size={17} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {formError ? <p className="form-error" role="alert"><CircleAlert size={16} /> {formError}</p> : null}
              </form>
            </div>

            <div ref={resultsRef} className="results-anchor">
              <ResultsPanel assessment={assessment} chartModels={chartModels} onReset={reset} />
            </div>
          </div>
        </section>

        <section className="method-section" id="metodologia">
          <div className="method-copy">
            <span className="section-kicker"><i /> CIÊNCIA E TRANSPARÊNCIA</span>
            <h2>Um motor independente.<br />Uma experiência simples.</h2>
            <p>O PediaMetric separa cálculo clínico, dados WHO e interface. Assim, cada resultado apresentado na tela vem do mesmo núcleo validado por testes automatizados.</p>
            <div className="method-tags">
              <span>WHO 2006</span><span>WHO 2007</span><span>LMS</span><span>TypeScript</span>
            </div>
          </div>
          <div className="architecture-cards">
            <article><span>01</span><div><strong>PediaMetric Core</strong><p>Z-scores, percentis e classificações sem dependência da interface.</p></div></article>
            <article><span>02</span><div><strong>WHO Data</strong><p>Tabelas versionadas, procedência registrada e hashes verificáveis.</p></div></article>
            <article><span>03</span><div><strong>PediaMetric Web</strong><p>Formulários e visualização que apenas consomem a API pública.</p></div></article>
          </div>
        </section>

        <section className="privacy-section" id="privacidade">
          <div className="privacy-icon"><ShieldCheck size={34} /></div>
          <div><span className="eyebrow">PRIVACIDADE DESDE A BASE</span><h2>Seus dados clínicos permanecem seus.</h2></div>
          <p>Não há conta, banco de dados, telemetria clínica ou envio das medidas. Ao limpar ou fechar a página, a avaliação deixa de existir.</p>
        </section>
      </main>

      <footer>
        <Logo compact />
        <p>Antropometria pediátrica com tecnologia, clareza e responsabilidade.</p>
        <span>Referências WHO 2006 · WHO 2007</span>
      </footer>
    </div>
  );
}
