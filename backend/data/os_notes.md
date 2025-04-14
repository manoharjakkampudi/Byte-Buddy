# Operating Systems Notes

## What is a Semaphore?

A semaphore is a synchronization primitive used in operating systems to control access to shared resources. It is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: wait (P) and signal (V).

### Types of Semaphores
- **Binary Semaphore**: Takes only 0 or 1, also called mutex.
- **Counting Semaphore**: Takes non-negative integer values and is useful when multiple instances of a resource are available.

### Real-world Example
Semaphores are used in producer-consumer problems to signal when a buffer is full or empty.

---

## What is a Deadlock?

A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another.

### Necessary Conditions
1. Mutual Exclusion
2. Hold and Wait
3. No Preemption
4. Circular Wait

### Deadlock Prevention Techniques
- Avoid hold and wait by requesting all resources at once.
- Use resource hierarchy or numbering.

---

## Page Replacement Algorithms

When a page fault occurs, the OS must decide which memory page to replace.

### Common Algorithms
- **FIFO**: Replace the oldest page in memory.
- **LRU**: Replace the page that hasn't been used for the longest time.
- **Optimal**: Replace the page that will not be used for the longest time (ideal but theoretical).
