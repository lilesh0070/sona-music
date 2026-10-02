export function isNewerVersion(candidate, current) {
  if (
    ![candidate, current].every(
      (v) => typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v),
    )
  )
    return false;
  const a = candidate.split(".").map(Number),
    b = current.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}
