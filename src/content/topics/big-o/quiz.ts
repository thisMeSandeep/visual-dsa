import type { Quiz } from '../../schema';

/** Big O quiz (ALGORITHM-CATALOG F1 "Practice ideas"). Each question links to its chapter. */
export const quiz = {
  topicId: 'big-o',
  questions: [
    {
      id: 'why-steps',
      kind: 'multiple-choice',
      prompt: 'Why does Big O count steps rather than seconds?',
      options: [
        { id: 'machine', text: 'Seconds depend on the machine; steps show how the work grows' },
        { id: 'precise', text: 'Steps are more precise than seconds' },
        { id: 'faster', text: 'Counting steps makes code faster' },
        { id: 'small', text: 'Seconds are too small to measure' },
      ],
      answer: 'machine',
      explanation:
        'The same code runs faster on a better phone, but its growth with n stays the same.',
      chapterId: 'why-growth',
    },
    {
      id: 'nested',
      kind: 'complexity',
      prompt: 'A loop over n items contains another loop over the same n items. What is it?',
      options: [
        { id: 'linear', text: 'O(n)' },
        { id: 'linearithmic', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
        { id: 'exponential', text: 'O(2ⁿ)' },
      ],
      answer: 'quadratic',
      explanation: 'The inner loop runs n times for each of the n outer passes: n × n steps.',
      chapterId: 'counting-steps',
    },
    {
      id: 'halving',
      kind: 'complexity',
      prompt: 'This loop halves n each time until it reaches 1. Which class is it?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'half', text: 'O(n/2)' },
      ],
      answer: 'log',
      explanation: 'Halving reaches 1 after about log₂ n steps: 10 steps for n = 1,000.',
      chapterId: 'common-classes',
    },
    {
      id: 'lowest',
      kind: 'multiple-choice',
      prompt: 'Which of these curves is lowest at n = 1,000?',
      options: [
        { id: 'linear', text: 'O(n)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linearithmic', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'log',
      explanation: 'log₂ 1,000 is about 10, against 1,000 for n and a million for n².',
      chapterId: 'common-classes',
    },
    {
      id: 'drop-terms',
      kind: 'complexity',
      prompt: 'An algorithm takes 3n² + 5n + 100 steps. What is it in Big O?',
      options: [
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
        { id: 'three', text: 'O(3n²)' },
        { id: 'all', text: 'O(3n² + 5n + 100)' },
      ],
      answer: 'quadratic',
      explanation: 'Drop the constant factor and the smaller terms: n² dominates as n grows.',
      chapterId: 'dropping-constants',
    },
    {
      id: 'always-faster',
      kind: 'true-false',
      prompt: 'An O(n) algorithm is faster than an O(n²) one for every input size.',
      answer: false,
      explanation:
        'For small n a big constant can make the O(n) one slower. Big O says which wins as n grows.',
      chapterId: 'dropping-constants',
    },
    {
      id: 'best-case',
      kind: 'multiple-choice',
      prompt: 'Linear search finds its value at the very first position. Which case is that?',
      options: [
        { id: 'best', text: 'Best case' },
        { id: 'average', text: 'Average case' },
        { id: 'worst', text: 'Worst case' },
      ],
      answer: 'best',
      explanation: 'One step is as good as it gets. The worst case is the value missing: n steps.',
      chapterId: 'best-average-worst',
    },
    {
      id: 'space',
      kind: 'complexity',
      prompt: 'A function makes a full copy of its input array. What is its space complexity?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'The copy needs one slot per item: memory grows with n.',
      chapterId: 'space',
    },
    {
      id: 'amortised',
      kind: 'complexity',
      prompt:
        'Pushing onto a dynamic array is usually quick, but sometimes copies everything. Averaged over many pushes, each one costs…',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'Doubling makes the copies rare enough that they average out: amortised O(1).',
      chapterId: 'amortised',
    },
  ],
} satisfies Quiz;
