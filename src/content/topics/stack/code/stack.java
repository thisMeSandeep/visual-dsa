import java.util.ArrayList;
import java.util.Map;

class Stack {
    private final ArrayList<Integer> items = new ArrayList<>();
    private final int capacity;

    Stack(int capacity) {
        this.capacity = capacity;
    }

    void push(int value) {
        if (items.size() == capacity) { // @line check-full
            throw new IllegalStateException("Stack overflow"); // @line overflow
        }
        items.add(value); // @line push
    }

    int pop() {
        if (items.isEmpty()) { // @line check-empty
            throw new IllegalStateException("Stack underflow"); // @line underflow
        }
        int top = items.get(items.size() - 1); // @line read-top
        items.remove(items.size() - 1); // @line pop
        return top; // @line pop
    }

    int peek() {
        if (items.isEmpty()) {
            throw new IllegalStateException("Stack is empty"); // @line peek-empty
        }
        return items.get(items.size() - 1); // @line peek
    }

    void clear() {
        items.clear(); // @line clear
    }

    boolean isEmpty() {
        return items.isEmpty();
    }
}

class Brackets {
    static boolean isBalanced(String text) {
        Map<Character, Character> partners = Map.of(')', '(', ']', '[', '}', '{');
        Stack stack = new Stack(text.length());
        for (char ch : text.toCharArray()) { // @line scan
            if ("([{".indexOf(ch) >= 0) {
                stack.push(ch); // @line push-open
            } else if (partners.containsKey(ch)) {
                if (stack.isEmpty()) {
                    return false; // @line close-empty
                }
                if (stack.peek() != partners.get(ch)) { // @line close-match
                    return false; // @line mismatch
                }
                stack.pop(); // @line pop-open
            }
        }
        if (!stack.isEmpty()) {
            return false; // @line unclosed
        }
        return true; // @line balanced
    }
}
