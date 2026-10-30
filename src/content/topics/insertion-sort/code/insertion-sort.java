// Sorts a in place, smallest first.
class InsertionSort {
    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i]; // @line take
            int j = i - 1;
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j]; // @line shift
                j--;
            }
            a[j + 1] = key; // @line insert
        }
    }
}
