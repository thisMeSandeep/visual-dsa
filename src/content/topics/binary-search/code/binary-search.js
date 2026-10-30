// a is sorted, smallest first. low and high mark the part
// still worth searching; everything outside it is ruled out.

function binarySearch(a, target) {
  let low = 0; // @line init
  let high = a.length - 1; // @line init
  while (low <= high) {
    const mid = Math.floor((low + high) / 2); // @line mid
    if (a[mid] === target) {
      return mid; // @line found
    } else if (a[mid] < target) {
      low = mid + 1; // @line go-right
    } else {
      high = mid - 1; // @line go-left
    }
  }
  return -1; // @line not-found
}

// With duplicates: remember a match, keep searching left.
function findFirst(a, target) {
  let low = 0; // @line first-init
  let high = a.length - 1; // @line first-init
  let result = -1; // @line first-init
  while (low <= high) {
    const mid = Math.floor((low + high) / 2); // @line first-mid
    if (a[mid] === target) {
      result = mid; // @line first-match
      high = mid - 1; // @line first-match
    } else if (a[mid] < target) {
      low = mid + 1; // @line first-go-right
    } else {
      high = mid - 1; // @line first-go-left
    }
  }
  return result; // @line first-done
}

// The same, but keep searching right after a match.
function findLast(a, target) {
  let low = 0; // @line last-init
  let high = a.length - 1; // @line last-init
  let result = -1; // @line last-init
  while (low <= high) {
    const mid = Math.floor((low + high) / 2); // @line last-mid
    if (a[mid] === target) {
      result = mid; // @line last-match
      low = mid + 1; // @line last-match
    } else if (a[mid] < target) {
      low = mid + 1; // @line last-go-right
    } else {
      high = mid - 1; // @line last-go-left
    }
  }
  return result; // @line last-done
}
