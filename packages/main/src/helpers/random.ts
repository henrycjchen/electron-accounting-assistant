export function randomRange(min: number, max: number, floor: boolean = true) {
  const value = Math.random() * (max - min) + min;
  if (floor) {
    return Math.floor(value);
  }
  return value;
}
