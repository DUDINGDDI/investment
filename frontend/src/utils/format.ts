/**
 * 숫자를 한국어 금액 표기로 변환 (원 단위 미포함)
 * 예: 110,000,000 → "1억 1,000만"
 *     90,000,000 → "9,000만"
 *     50,000,000 → "5,000만"
 *     1,000,000 → "100만"
 *     0 → "0"
 */
export function formatKorean(n: number): string {
  if (n === 0) return '0'

  const eok = Math.floor(n / 100_000_000)
  const remain = n % 100_000_000
  const man = Math.floor(remain / 10_000)

  const parts: string[] = []
  if (eok > 0) parts.push(`${eok}억`)
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`)

  return parts.join(' ') || '0'
}
