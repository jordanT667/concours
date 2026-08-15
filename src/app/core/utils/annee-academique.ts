export function getAnneeAcademique(): string {
  const y = new Date().getFullYear();
  const m = new Date().getMonth();
  const start = m >= 7 ? y : y - 1;
  return `${start}/${start + 1}`;
}
