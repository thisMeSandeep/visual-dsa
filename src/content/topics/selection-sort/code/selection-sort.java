// Sorts a in place, smallest first.
class SelectionSort {
    static void selectionSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            int min = i; // @line scan
            for (int j = i + 1; j < n; j++) {
                if (a[j] < a[min]) { // @line compare
                    min = j; // @line new-min
                }
            }
            if (min != i) { // @line place
                int t = a[i]; a[i] = a[min]; a[min] = t; // @line swap
            }
        }
    }
}
