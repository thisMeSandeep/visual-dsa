// The biggest sum of k neighbours.
function maxSum(a, k) {
  let sum = a.slice(0, k).reduce((s, x) => s + x, 0); // @line sum-start
  let best = sum; // @line sum-start
  for (let right = k; right < a.length; right++) {
    sum += a[right] - a[right - k]; // @line sum-slide
    best = Math.max(best, sum); // @line sum-slide
  }
  return best; // @line sum-done
}

// The longest run with no repeated value.
function longestUnique(a) {
  const seen = new Set();
  let left = 0, best = 0; // @line unique-start
  for (let right = 0; right < a.length; right++) {
    while (seen.has(a[right])) {
      seen.delete(a[left++]); // @line unique-shrink
    }
    seen.add(a[right]); // @line unique-grow
    best = Math.max(best, right - left + 1); // @line unique-grow
  }
  return best; // @line unique-done
}

// The biggest item in each window of k. The deque holds
// indices whose values go down from front to back.
function windowMax(a, k) {
  const deque = [], maxima = []; // @line max-start
  for (let right = 0; right < a.length; right++) {
    if (deque[0] < right - k + 1) deque.shift(); // @line max-expire
    while (deque.length && a[deque.at(-1)] <= a[right]) {
      deque.pop(); // @line max-pop
    }
    deque.push(right); // @line max-push
    if (right >= k - 1) maxima.push(a[deque[0]]); // @line max-record
  }
  return maxima;
}
