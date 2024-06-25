export function randomRange(min: number, max: number, floor: boolean = true) {
  const value = Math.random() * (max - min) + min;
  if (floor) {
    return Math.floor(value);
  }
  return parseFloat(value.toFixed(3));
}

export function randomPick<T>(arr: T[], count: number) {
  const result = [];
  for (let i = 0; i < count; i++) {
    if (arr.length === 0) {
      break;
    }
    const index = Math.floor(Math.random() * arr.length);
    const [item] = arr.splice(index, 1);
    result.push(item);
  }
  return result;
}
