export function confirmDelete(targetLabel = "이 항목"): boolean {
  if (typeof window === "undefined") return false;

  return window.confirm(`${targetLabel}을(를) 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.`);
}
