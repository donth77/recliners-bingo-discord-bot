export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setsAreEqual(a: Set<any>, b: Set<any>) {
  if (a.size !== b.size) {
    return false;
  }

  return Array.from(a).every((element) => {
    return b.has(element);
  });
}
