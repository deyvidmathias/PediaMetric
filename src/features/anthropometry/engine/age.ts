import type { ExactAge, Reference } from "../types.ts";

export const DAYS_PER_MONTH = 30.4375;
const MS_PER_DAY = 86_400_000;

function parseCivilDate(value: string | Date): number {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new RangeError("Data inválida.");
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError("Use datas no formato YYYY-MM-DD.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError("Data civil inexistente.");
  }
  return utc;
}

export function calculateExactAge(
  birthDate: string | Date,
  assessmentDate: string | Date
): ExactAge {
  const birthUtc = parseCivilDate(birthDate);
  const assessmentUtc = parseCivilDate(assessmentDate);
  const days = (assessmentUtc - birthUtc) / MS_PER_DAY;
  if (!Number.isInteger(days) || days < 0) {
    throw new RangeError("A avaliação não pode ocorrer antes do nascimento.");
  }
  const birth = new Date(birthUtc);
  const assessment = new Date(assessmentUtc);
  let calendarYears = assessment.getUTCFullYear() - birth.getUTCFullYear();
  let calendarMonths = assessment.getUTCMonth() - birth.getUTCMonth();
  let calendarDays = assessment.getUTCDate() - birth.getUTCDate();
  if (calendarDays < 0) {
    calendarMonths -= 1;
    calendarDays += new Date(
      Date.UTC(assessment.getUTCFullYear(), assessment.getUTCMonth(), 0)
    ).getUTCDate();
  }
  if (calendarMonths < 0) {
    calendarYears -= 1;
    calendarMonths += 12;
  }
  const months = days / DAYS_PER_MONTH;
  return {
    days,
    months,
    completedMonths: Math.floor(months),
    years: days / 365.25,
    completedYears: calendarYears,
    calendar: {
      years: calendarYears,
      months: calendarMonths,
      days: calendarDays
    }
  };
}

export function selectReference(age: ExactAge): Reference | null {
  if (age.days <= 1856) return "WHO_2006";
  if (age.months >= 61 && age.months < 229) return "WHO_2007";
  return null;
}
