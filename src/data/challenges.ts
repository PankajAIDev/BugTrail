import { Challenge } from '../types';

export const CHALLENGES: Challenge[] = [
  // ==========================================
  // C CHALLENGES (6 Verified Challenges)
  // ==========================================
  {
    id: 'c-scanf-address',
    title: 'Missing Address-of Operator in scanf',
    description: 'A student wrote a program to read a user age and check if they are eligible to vote. However, whenever any number is entered, the program immediately crashes with a Segmentation Fault.',
    language: 'c',
    difficulty: 'Beginner',
    category: 'Format Specifiers',
    xpReward: 50,
    faultyCode: `#include <stdio.h>

int main(void) {
    int age = 0;
    printf("Enter your age: ");
    
    // Read user input into age variable
    scanf("%d", age);
    
    if (age >= 18) {
        printf("Eligible to vote\\n");
    } else {
        printf("Not eligible to vote\\n");
    }
    return 0;
}`,
    bugLine: 8,
    highlightLines: [8],
    options: [
      {
        id: 'c-01-a',
        text: 'The format specifier "%d" is only for floats; it should be "%i".',
        explanation: '"%d" and "%i" are both standard format specifiers for signed integers; "%d" is not restricted to floats.'
      },
      {
        id: 'c-01-b',
        text: 'scanf requires the memory address (&age) to write into, but received the integer value of age (0).',
        explanation: 'Correct! scanf writes directly into memory, so it expects a pointer (int*). Passing "age" provides value 0 (NULL), causing a segmentation fault when scanf attempts to dereference address 0.'
      },
      {
        id: 'c-01-c',
        text: 'The variable age must be initialized to -1 before calling scanf.',
        explanation: 'Initial value does not cause a crash; scanf overwrites the destination if given a valid pointer.'
      },
      {
        id: 'c-01-d',
        text: 'printf must always be flushed using fflush(stdout) before any scanf call.',
        explanation: 'While flushing can help with prompt display, not doing so will never trigger a segmentation fault.'
      }
    ],
    correctOptionId: 'c-01-b',
    hints: [
      {
        level: 1,
        title: 'Function Signature Clue',
        content: 'Check the arguments passed to scanf. Does scanf know where the variable lives in memory, or just its current value?'
      },
      {
        level: 2,
        title: 'Pointer Requirement',
        content: 'In C, functions pass arguments by value. If scanf needs to mutate a caller variable, what operator must prefix the variable name?'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Replace `scanf("%d", age);` with `scanf("%d", &age);`. The `&` operator passes the address of `age`.'
      }
    ],
    correctedCode: `#include <stdio.h>

int main(void) {
    int age = 0;
    printf("Enter your age: ");
    
    // Pass the address of age using & operator
    if (scanf("%d", &age) == 1) {
        if (age >= 18) {
            printf("Eligible to vote\\n");
        } else {
            printf("Not eligible to vote\\n");
        }
    } else {
        printf("Invalid input\\n");
    }
    return 0;
}`,
    rootCause: 'In C, function arguments are passed by value. To write data back into the caller’s variable, scanf requires a pointer pointing to the destination memory. Passing "age" instead of "&age" supplies the integer value 0 (NULL). When scanf attempts to write the parsed input into memory address 0x0, the operating system halts execution with a SIGSEGV (Segmentation Fault).',
    expectedBehavior: 'The program successfully prompts the user, reads an integer into age, and prints whether the user is eligible to vote without crashing.'
  },
  {
    id: 'c-off-by-one-array',
    title: 'Off-By-One Buffer Overflow in Loop',
    description: 'This function calculates the sum of all elements in a 5-element integer array. However, running the program prints a strange, unpredictably large sum, or occasionally triggers a stack smashing warning.',
    language: 'c',
    difficulty: 'Beginner',
    category: 'Boundary & Indexing',
    xpReward: 50,
    faultyCode: `#include <stdio.h>

int compute_sum(const int arr[], int size) {
    int total = 0;
    // Loop through the array to add each element
    for (int i = 0; i <= size; i++) {
        total += arr[i];
    }
    return total;
}

int main(void) {
    int numbers[5] = {10, 20, 30, 40, 50};
    printf("Sum: %d\\n", compute_sum(numbers, 5));
    return 0;
}`,
    bugLine: 6,
    highlightLines: [6, 7],
    options: [
      {
        id: 'c-02-a',
        text: 'The loop condition "i <= size" accesses arr[5], which is outside the 0-indexed bounds of the 5-element array.',
        explanation: 'Correct! In a 5-element array, valid indices are 0, 1, 2, 3, 4. When i == 5, arr[5] reads arbitrary stack memory, creating undefined behavior.'
      },
      {
        id: 'c-02-b',
        text: 'The total variable must be allocated dynamically with malloc.',
        explanation: 'Local integer variables allocated on the stack are perfectly valid for holding cumulative sums.'
      },
      {
        id: 'c-02-c',
        text: 'The const qualifier prevents the array elements from being read in a loop.',
        explanation: 'const int arr[] allows reading elements freely; it only prevents modifying the array elements.'
      },
      {
        id: 'c-02-d',
        text: 'Arrays cannot be passed as arguments in C without converting them to linked lists.',
        explanation: 'Arrays decay into pointers when passed to functions in C, which is completely standard.'
      }
    ],
    correctOptionId: 'c-02-a',
    hints: [
      {
        level: 1,
        title: 'Index Range Inspection',
        content: 'For an array of length 5, what are the exact valid indices you can access?'
      },
      {
        level: 2,
        title: 'Loop Condition Clue',
        content: 'Check the comparison operator in the loop header: is it strictly less than (<) or less than or equal (<=)?'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Change `i <= size` to `i < size`. An array of size N has indices 0 through N-1.'
      }
    ],
    correctedCode: `#include <stdio.h>

int compute_sum(const int arr[], int size) {
    int total = 0;
    // Correct boundary: iterate strictly up to size - 1
    for (int i = 0; i < size; i++) {
        total += arr[i];
    }
    return total;
}

int main(void) {
    int numbers[5] = {10, 20, 30, 40, 50};
    printf("Sum: %d\\n", compute_sum(numbers, 5));
    return 0;
}`,
    rootCause: 'C arrays are 0-indexed. An array declared with size 5 has valid indices 0, 1, 2, 3, 4. Using the condition "i <= size" causes the loop to run 6 iterations, attempting to read arr[5]. Because C does not perform runtime array bounds checking, arr[5] accesses adjacent stack memory containing garbage values or stack canary guards.',
    expectedBehavior: 'The loop executes exactly 5 times (indices 0 to 4), producing the correct deterministic sum: 150.'
  },
  {
    id: 'c-assignment-in-conditional',
    title: 'Accidental Assignment in if Statement',
    description: 'This function is supposed to check if a user is an administrator and grant access. However, normal users are always granted administrator access regardless of their actual status!',
    language: 'c',
    difficulty: 'Intermediate',
    category: 'Conditional & Logic',
    xpReward: 100,
    faultyCode: `#include <stdio.h>

void check_access(int is_admin) {
    // If the user has admin role (1), grant access
    if (is_admin = 1) {
        printf("ACCESS GRANTED: Administrative privileges active.\\n");
    } else {
        printf("ACCESS DENIED: Standard user privileges.\\n");
    }
}

int main(void) {
    int guest_user = 0; // standard guest, not admin
    check_access(guest_user);
    return 0;
}`,
    bugLine: 5,
    highlightLines: [5],
    options: [
      {
        id: 'c-03-a',
        text: 'The argument is_admin was passed by value and should be a pointer.',
        explanation: 'Reading a flag value in a check function does not require pointer indirection.'
      },
      {
        id: 'c-03-b',
        text: 'Single "=" is an assignment operator, setting is_admin to 1 and evaluating to true, rather than comparing with "==".',
        explanation: 'Correct! "is_admin = 1" assigns 1 to is_admin. The entire expression evaluates to the assigned value (1), which C treats as truthy, so the if-branch always executes.'
      },
      {
        id: 'c-03-c',
        text: 'C requires boolean true/false keywords from <stdbool.h> and cannot evaluate integer conditionals.',
        explanation: 'In C, any non-zero integer is treated as true, and 0 is treated as false.'
      },
      {
        id: 'c-03-d',
        text: 'The else block is missing a return statement.',
        explanation: 'The function has void return type, so explicit return statements in each branch are optional.'
      }
    ],
    correctOptionId: 'c-03-b',
    hints: [
      {
        level: 1,
        title: 'Operator Check',
        content: 'Look closely at the expression inside `if (...)`. Is it checking equality or performing an action?'
      },
      {
        level: 2,
        title: 'Assignment vs Equality',
        content: 'In C, `=` assigns a value to a variable, while `==` compares two values for equality.'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Change `if (is_admin = 1)` to `if (is_admin == 1)`.'
      }
    ],
    correctedCode: `#include <stdio.h>

void check_access(int is_admin) {
    // Proper comparison with ==
    if (is_admin == 1) {
        printf("ACCESS GRANTED: Administrative privileges active.\\n");
    } else {
        printf("ACCESS DENIED: Standard user privileges.\\n");
    }
}

int main(void) {
    int guest_user = 0; // standard guest
    check_access(guest_user);
    return 0;
}`,
    rootCause: 'In C, the single equals operator "=" is the assignment operator, not the comparison operator. In the expression "if (is_admin = 1)", the value 1 is written into "is_admin", and the expression itself yields 1 (which evaluates to truthy in C). As a result, the conditional always branches to the admin path.',
    expectedBehavior: 'When guest_user (0) is passed, "is_admin == 1" evaluates to false (0), correctly printing "ACCESS DENIED: Standard user privileges."'
  },
  {
    id: 'c-printf-format-mismatch',
    title: 'Format Specifier Mismatch in printf',
    description: 'This code calculates an item price with tax and attempts to display the total. Instead of showing the calculated floating-point value, it prints an absurd integer like "0" or garbage values.',
    language: 'c',
    difficulty: 'Intermediate',
    category: 'Format Specifiers',
    xpReward: 100,
    faultyCode: `#include <stdio.h>

int main(void) {
    double subtotal = 49.99;
    double tax_rate = 0.08;
    double total = subtotal * (1.0 + tax_rate);
    
    // Print the calculated total
    printf("Total due: $%d\\n", total);
    return 0;
}`,
    bugLine: 9,
    highlightLines: [9],
    options: [
      {
        id: 'c-04-a',
        text: 'The variable total must be converted to a string using sprintf before printing.',
        explanation: 'printf can directly print numbers using appropriate format specifiers without manual string conversion.'
      },
      {
        id: 'c-04-b',
        text: 'The format specifier "%d" expects an integer, but total is a double (64-bit IEEE 754 float); it must use "%.2f".',
        explanation: 'Correct! "%d" tells printf to read an int (usually 4 bytes) from the stack or register according to the integer ABI, while "total" was passed as a double in a floating-point register, causing printf to read mismatched registers/memory.'
      },
      {
        id: 'c-04-c',
        text: 'Double precision arithmetic requires calling fmod() on all multiplications.',
        explanation: 'Standard arithmetic operators (*, +, -) work seamlessly with float and double types.'
      },
      {
        id: 'c-04-d',
        text: 'The $ symbol is a reserved escape character in printf and caused a parsing error.',
        explanation: '$ is a standard literal character in printf format strings, not a reserved escape code.'
      }
    ],
    correctOptionId: 'c-04-b',
    hints: [
      {
        level: 1,
        title: 'Data Type Matching',
        content: 'Check the data type of the variable `total`. What format specifier does printf use for fractional numbers?'
      },
      {
        level: 2,
        title: 'Integer vs Float Specifiers',
        content: '`%d` is for signed decimal integers (`int`). Floating point types (`float` and `double`) require `%f` or `%lf`.'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Replace `%d` with `%.2f` to format the double with two decimal places: `printf("Total due: $%.2f\\n", total);`.'
      }
    ],
    correctedCode: `#include <stdio.h>

int main(void) {
    double subtotal = 49.99;
    double tax_rate = 0.08;
    double total = subtotal * (1.0 + tax_rate);
    
    // Correct format specifier for floating point output
    printf("Total due: $%.2f\\n", total);
    return 0;
}`,
    rootCause: 'printf is a variadic function that relies strictly on the format string to determine the type and size of arguments passed. The specifier "%d" instructs printf to retrieve a 32-bit integer. Because "total" is a 64-bit IEEE-754 double passed via floating-point registers (on x86-64 System V ABI) or as 8 bytes, printf retrieves whatever arbitrary integer register happens to contain data.',
    expectedBehavior: 'With "%.2f", printf correctly reads the floating-point register and formats the output to two decimal digits: "Total due: $53.99".'
  },
  {
    id: 'c-dangling-pointer-stack',
    title: 'Returning Pointer to Local Stack Variable',
    description: 'This utility function creates a formatted greeting string and returns a pointer to it. However, the calling code prints garbage characters, an empty string, or experiences intermittent crashes.',
    language: 'c',
    difficulty: 'Advanced',
    category: 'Function Return & Stack',
    xpReward: 150,
    faultyCode: `#include <stdio.h>
#include <string.h>

char* create_greeting(const char* name) {
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "Hello, %s!", name);
    // Return pointer to greeting buffer
    return buffer;
}

int main(void) {
    char* greeting = create_greeting("Alice");
    printf("%s\\n", greeting);
    return 0;
}`,
    bugLine: 8,
    highlightLines: [5, 8],
    options: [
      {
        id: 'c-05-a',
        text: 'snprintf requires the string to end with a newline character.',
        explanation: 'snprintf does not require a newline; it automatically null-terminates the string.'
      },
      {
        id: 'c-05-b',
        text: 'The buffer array is allocated on the stack frame of create_greeting, which is deallocated when the function returns, leaving a dangling pointer.',
        explanation: 'Correct! Local variables exist only for the lifetime of their function stack frame. Once create_greeting returns, its stack frame is reclaimed, and any pointer to buffer points to invalidated stack memory.'
      },
      {
        id: 'c-05-c',
        text: 'Pointers to char cannot be printed with %s without typecasting to (void*).',
        explanation: '%s specifically expects a char* pointer pointing to a null-terminated string.'
      },
      {
        id: 'c-05-d',
        text: 'The name parameter is declared const, so it cannot be formatted.',
        explanation: 'const char* guarantees read-only access to name, which is ideal for formatting.'
      }
    ],
    correctOptionId: 'c-05-b',
    hints: [
      {
        level: 1,
        title: 'Memory Lifetime Clue',
        content: 'Where is `char buffer[64]` stored in memory (stack, heap, or data segment), and what happens to it when the function finishes?'
      },
      {
        level: 2,
        title: 'Stack Frame Destruction',
        content: 'When a function returns, its activation record on the stack is popped. The memory address of `buffer` is no longer valid.'
      },
      {
        level: 3,
        title: 'Solution Approaches',
        content: 'To return a string from a function, either allocate memory on the heap with `malloc()`, declare it as `static`, or have the caller pass their own buffer.'
      }
    ],
    correctedCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* create_greeting(const char* name) {
    // Allocate buffer on heap so it persists after function returns
    char* buffer = (char*)malloc(64 * sizeof(char));
    if (buffer == NULL) return NULL;
    
    snprintf(buffer, 64, "Hello, %s!", name);
    return buffer;
}

int main(void) {
    char* greeting = create_greeting("Alice");
    if (greeting != NULL) {
        printf("%s\\n", greeting);
        free(greeting); // Clean up dynamically allocated memory
    }
    return 0;
}`,
    rootCause: 'Automatic local variables in C are allocated on the call stack. When "create_greeting" completes execution, its stack frame is marked available for reuse. Returning the address of "buffer" creates a dangling pointer. Subsequent function calls (like printf) overwrite the stack frame, corrupting the string content.',
    expectedBehavior: 'Using heap allocation with malloc ensures the string memory remains allocated until explicitly freed, allowing main to print "Hello, Alice!" reliably.'
  },
  {
    id: 'c-operator-precedence-pointer',
    title: 'Pointer Dereference and Postfix Precedence',
    description: 'A programmer wants to increment the integer value pointed to by a pointer ptr. Instead of incrementing the value from 5 to 6, the value remains 5 and the pointer itself is advanced to an illegal memory address!',
    language: 'c',
    difficulty: 'Advanced',
    category: 'Operator Precedence',
    xpReward: 150,
    faultyCode: `#include <stdio.h>

void increment_counter(int* ptr) {
    // Increment the integer value stored at ptr
    *ptr++;
}

int main(void) {
    int count = 5;
    increment_counter(&count);
    printf("Count after increment: %d\\n", count);
    return 0;
}`,
    bugLine: 5,
    highlightLines: [5],
    options: [
      {
        id: 'c-06-a',
        text: 'Postfix "++" has higher precedence than dereference "*", so it increments the pointer address rather than the integer value (*ptr).',
        explanation: 'Correct! Postfix ++ binds tighter than prefix *. Thus "*ptr++" evaluates as "*(ptr++)", advancing the pointer address and discarding the dereferenced result.'
      },
      {
        id: 'c-06-b',
        text: 'Pointers in C cannot be modified inside void functions.',
        explanation: 'Functions in C can modify the value at a pointer regardless of return type.'
      },
      {
        id: 'c-06-c',
        text: 'The address-of operator & cannot be used on local variables.',
        explanation: '&count is the standard way to retrieve the memory address of a local variable.'
      },
      {
        id: 'c-06-d',
        text: 'The ++ operator is only supported in C++ and not in C.',
        explanation: 'The ++ operator is a fundamental operator in C since its inception.'
      }
    ],
    correctOptionId: 'c-06-a',
    hints: [
      {
        level: 1,
        title: 'Operator Precedence Rule',
        content: 'Between the postfix `++` operator and the unary dereference `*` operator, which one has higher binding priority?'
      },
      {
        level: 2,
        title: 'Grouping with Parentheses',
        content: 'Because postfix `++` evaluates first, `*ptr++` increments the memory address of `ptr`. How do you force C to dereference before incrementing?'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Use parentheses to enforce dereference before increment: `(*ptr)++;` or write `*ptr += 1;`.'
      }
    ],
    correctedCode: `#include <stdio.h>

void increment_counter(int* ptr) {
    // Parentheses force dereference before incrementing the value
    (*ptr)++;
}

int main(void) {
    int count = 5;
    increment_counter(&count);
    printf("Count after increment: %d\\n", count);
    return 0;
}`,
    rootCause: 'In the C operator precedence table, postfix increment (++) has higher precedence (Level 1) than the unary prefix dereference operator (*) (Level 2). Consequently, "*ptr++" is parsed as "*(ptr++)". This increments the pointer variable itself (pointing it to the next int in memory) and then dereferences the old address without modifying the value. To increment the target value, parentheses are required: "(*ptr)++".',
    expectedBehavior: 'With "(*ptr)++", the value located at the address is incremented from 5 to 6, and the output prints "Count after increment: 6".'
  },

  // ==========================================
  // PYTHON CHALLENGES (6 Verified Challenges)
  // ==========================================
  {
    id: 'py-indentation-accumulator',
    title: 'Premature Return Due to Indentation',
    description: 'This function should sum all positive numbers in a list and return the final total. When tested with [5, 10, -2, 8], it outputs 5 instead of 23.',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Indentation & Scope',
    xpReward: 50,
    faultyCode: `def sum_positive_numbers(numbers):
    total = 0
    for num in numbers:
        if num > 0:
            total += num
        # Return the accumulated total
        return total

data = [5, 10, -2, 8]
result = sum_positive_numbers(data)
print(f"Result: {result}")
`,
    bugLine: 7,
    highlightLines: [4, 5, 6, 7],
    options: [
      {
        id: 'py-01-a',
        text: 'The "return total" statement is indented inside the for loop, terminating the function on the very first iteration.',
        explanation: 'Correct! In Python, indentation defines block scope. Placing "return" at the loop level causes the function to exit immediately after processing the first item (5).'
      },
      {
        id: 'py-01-b',
        text: 'Python lists cannot contain negative numbers when using comparison operators.',
        explanation: 'Comparison operators like ">" work across all real numbers in Python.'
      },
      {
        id: 'py-01-c',
        text: 'The total variable must be declared with the global keyword.',
        explanation: '"total" is a local variable inside the function and should remain local.'
      },
      {
        id: 'py-01-d',
        text: 'The "+=" operator is only valid for strings and floats, not integers.',
        explanation: 'The "+=" operator is universally supported for numeric addition in Python.'
      }
    ],
    correctOptionId: 'py-01-a',
    hints: [
      {
        level: 1,
        title: 'Loop Lifespan Check',
        content: 'Count how many times the `for` loop actually executes before `return` is reached.'
      },
      {
        level: 2,
        title: 'Indentation Alignment',
        content: 'Notice the column alignment of `return total`. Which statement does it align with: `for` or `total += num`?'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Dedents `return total` by 4 spaces so that it aligns with the `for` statement, executing only after the loop completes.'
      }
    ],
    correctedCode: `def sum_positive_numbers(numbers):
    total = 0
    for num in numbers:
        if num > 0:
            total += num
    # Return total only after the loop finishes
    return total

data = [5, 10, -2, 8]
result = sum_positive_numbers(data)
print(f"Result: {result}") # Prints: 23
`,
    rootCause: 'Python uses indentation to delimit code blocks. Because "return total" is indented at the same level as the for loop body, the function returns on the first loop iteration after adding the first element (5). The remaining elements (10, -2, 8) are never inspected.',
    expectedBehavior: 'Dedentation ensures the loop iterates over every item in the list, correctly returning the accumulated sum: 23.'
  },
  {
    id: 'py-range-boundary-off-by-one',
    title: 'Range Boundary Off-by-One Error',
    description: 'This function attempts to print each element with its 1-based rank (e.g. "Rank 1: Alice"). However, running the code skips the last person in the list or raises an IndexError when adjusting indices.',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Sequence Indexing',
    xpReward: 50,
    faultyCode: `def display_leaderboard(contestants):
    # Print rankings from 1 to total contestants
    for i in range(len(contestants) - 1):
        rank = i + 1
        name = contestants[i]
        print(f"Rank {rank}: {name}")

players = ["Alice", "Bob", "Charlie", "Diana"]
display_leaderboard(players)
`,
    bugLine: 3,
    highlightLines: [3, 4, 5],
    options: [
      {
        id: 'py-02-a',
        text: 'range(len(contestants) - 1) stops before the last item because range(n) is already exclusive of the upper limit.',
        explanation: 'Correct! range(stop) stops at stop-1. When you pass len(contestants)-1 (i.e. 3), the loop yields 0, 1, 2, skipping index 3 ("Diana").'
      },
      {
        id: 'py-02-b',
        text: 'Python lists cannot be indexed with variable names like contestants[i].',
        explanation: 'Indexing lists with integer variables is the standard idiom in Python.'
      },
      {
        id: 'py-02-c',
        text: 'The f-string syntax requires double parentheses to interpolate variables.',
        explanation: 'F-strings use single curly braces {variable} for interpolation.'
      },
      {
        id: 'py-02-d',
        text: 'range() only accepts floating point numbers in Python 3.',
        explanation: 'range() strictly requires integer arguments.'
      }
    ],
    correctOptionId: 'py-02-a',
    hints: [
      {
        level: 1,
        title: 'Range Endpoint Behavior',
        content: 'Remember that `range(k)` generates numbers starting at 0 and ending at `k - 1`.'
      },
      {
        level: 2,
        title: 'Exclusive Upper Bound',
        content: 'If `len(contestants)` is 4, what numbers does `range(len(contestants) - 1)` (which is `range(3)`) yield? It produces 0, 1, 2.'
      },
      {
        level: 3,
        title: 'Idiomatic Fix',
        content: 'Use `range(len(contestants))` or even better, Python’s built-in `enumerate(contestants, start=1)`.'
      }
    ],
    correctedCode: `def display_leaderboard(contestants):
    # Using enumerate is idiomatic and avoids manual index calculations
    for rank, name in enumerate(contestants, start=1):
        print(f"Rank {rank}: {name}")

players = ["Alice", "Bob", "Charlie", "Diana"]
display_leaderboard(players)
`,
    rootCause: 'Python\'s range(stop) is half-open: it includes the start (default 0) and excludes the stop value. Passing "len(contestants) - 1" stops the iteration at len - 2. For a 4-item list, indices 0, 1, and 2 are visited, completely omitting the final item at index 3 ("Diana").',
    expectedBehavior: 'All 4 contestants are displayed with their correct 1-based ranks (Rank 1 through Rank 4).'
  },
  {
    id: 'py-mutable-default-argument',
    title: 'Mutable Default Argument State Leak',
    description: 'A student built an inventory tracker function that appends a tag to a target item list. When calling append_tag("electronics") followed by append_tag("books"), the second call unexpectedly contains ["electronics", "books"]!',
    language: 'python',
    difficulty: 'Intermediate',
    category: 'Mutable Defaults',
    xpReward: 100,
    faultyCode: `def append_tag(tag, tag_list=[]):
    tag_list.append(tag)
    return tag_list

# Test calls
item1_tags = append_tag("electronics")
print(f"Item 1 tags: {item1_tags}")

item2_tags = append_tag("books")
print(f"Item 2 tags: {item2_tags}") # Unexpectedly prints ['electronics', 'books']!
`,
    bugLine: 1,
    highlightLines: [1, 2],
    options: [
      {
        id: 'py-03-a',
        text: 'Python creates default argument objects once when the function is defined, sharing the same mutable list across every call.',
        explanation: 'Correct! Default parameter expressions are evaluated at definition time. The empty list [] is created once and reused for all subsequent calls that omit the argument.'
      },
      {
        id: 'py-03-b',
        text: 'The append() method creates a copy of the list instead of modifying it in place.',
        explanation: 'append() mutates lists in-place and returns None.'
      },
      {
        id: 'py-03-c',
        text: 'Function arguments in Python are strictly immutable by default.',
        explanation: 'Arguments in Python are passed by object reference; mutable objects can be modified.'
      },
      {
        id: 'py-03-d',
        text: 'Strings in Python cannot be added to lists without calling str.copy().',
        explanation: 'Strings are immutable and can be added directly to lists without copying.'
      }
    ],
    correctOptionId: 'py-03-a',
    hints: [
      {
        level: 1,
        title: 'Evaluation Time Clue',
        content: 'When does Python evaluate default argument expressions: when the file is parsed/defined, or each time the function is called?'
      },
      {
        level: 2,
        title: 'Shared Object Identity',
        content: 'Check `id(tag_list)` across multiple calls. Notice that it refers to the exact same memory address across calls.'
      },
      {
        level: 3,
        title: 'Standard Python Pattern',
        content: 'Use `tag_list=None` as the default argument, then inside the function check `if tag_list is None: tag_list = []`.'
      }
    ],
    correctedCode: `def append_tag(tag, tag_list=None):
    # Create a fresh new list if no list was provided by caller
    if tag_list is None:
        tag_list = []
    tag_list.append(tag)
    return tag_list

item1_tags = append_tag("electronics")
print(f"Item 1 tags: {item1_tags}") # ['electronics']

item2_tags = append_tag("books")
print(f"Item 2 tags: {item2_tags}") # ['books']
`,
    rootCause: 'In Python, default arguments are evaluated only once at the moment the function definition statement is executed, not at runtime call time. When a mutable object like a list or dictionary is used as a default, mutations are preserved across subsequent function invocations. To avoid this, use "None" as a sentinel value and initialize a fresh list inside the function body.',
    expectedBehavior: 'Each independent function invocation without an explicit list receives a fresh, isolated list, printing ["electronics"] and ["books"] separately.'
  },
  {
    id: 'py-list-mutation-during-iteration',
    title: 'Mutating a List While Iterating Over It',
    description: 'This function is designed to strip all odd numbers from a list of integers. When tested on [1, 3, 4, 6, 7, 9], the output is [3, 4, 6, 9], leaving several odd numbers behind!',
    language: 'python',
    difficulty: 'Intermediate',
    category: 'Collection Mutation',
    xpReward: 100,
    faultyCode: `def remove_odds(numbers):
    # Remove every odd number from the list
    for num in numbers:
        if num % 2 != 0:
            numbers.remove(num)
    return numbers

values = [1, 3, 4, 6, 7, 9]
filtered = remove_odds(values)
print(f"Filtered list: {filtered}")
`,
    bugLine: 4,
    highlightLines: [3, 4, 5],
    options: [
      {
        id: 'py-04-a',
        text: 'The modulo operator % is undefined for positive integers in Python.',
        explanation: '% is the standard modulo operator in Python.'
      },
      {
        id: 'py-04-b',
        text: 'Removing elements shifts remaining items left, causing the iterator’s internal index counter to skip the immediate next element.',
        explanation: 'Correct! When index 0 (value 1) is removed, value 3 shifts to index 0. The loop advances its internal index to 1, inspecting value 4 and completely skipping 3!'
      },
      {
        id: 'py-04-c',
        text: 'The numbers.remove() function only removes items if the list is sorted in descending order.',
        explanation: 'remove(x) searches sequentially from the beginning regardless of sorting.'
      },
      {
        id: 'py-04-d',
        text: 'Python prohibits using for loops on lists with fewer than 10 elements.',
        explanation: 'For loops iterate over collections of any length.'
      }
    ],
    correctOptionId: 'py-04-b',
    hints: [
      {
        level: 1,
        title: 'Iterator Position Tracking',
        content: 'Python maintains an internal integer index during `for x in numbers:`. What happens to element positions when an item is deleted?'
      },
      {
        level: 2,
        title: 'Element Shifting',
        content: 'When `1` is removed, `3` slides into index 0. Then the loop advances to index 1, where `4` is located. What happened to `3`?'
      },
      {
        level: 3,
        title: 'Idiomatic Fix',
        content: 'Never mutate a list while iterating over it. Use a list comprehension `[x for x in numbers if x % 2 == 0]` or iterate over a shallow copy `numbers[:]`.'
      }
    ],
    correctedCode: `def remove_odds(numbers):
    # Use a list comprehension to construct a clean new filtered list
    return [num for num in numbers if num % 2 == 0]

values = [1, 3, 4, 6, 7, 9]
filtered = remove_odds(values)
print(f"Filtered list: {filtered}") # Prints: [4, 6]
`,
    rootCause: 'The for-in loop uses an internal sequence index that increments by 1 on each step. When an element is removed with "numbers.remove()", all subsequent elements shift one position to the left. As the iterator advances to the next index, the element that shifted into the vacated index is silently bypassed without being tested.',
    expectedBehavior: 'Using list comprehension returns a new list containing only even numbers [4, 6], without any skipped items.'
  },
  {
    id: 'py-identity-vs-equality',
    title: 'Confusing Identity (is) with Equality (==)',
    description: 'This function validates a security authorization token against an expected string. When testing with dynamically constructed tokens, the check fails even when the string values are completely identical.',
    language: 'python',
    difficulty: 'Advanced',
    category: 'Identity vs Equality',
    xpReward: 150,
    faultyCode: `def verify_auth_token(user_token):
    expected_token = "secure_auth_token_2026"
    
    # Check if the provided token matches the expected token
    if user_token is expected_token:
        return True
    return False

# Token generated dynamically at runtime (e.g. from network or concat)
part1 = "secure_auth"
part2 = "_token_2026"
received_token = part1 + part2

is_valid = verify_auth_token(received_token)
print(f"Token verified: {is_valid}") # Prints False!
`,
    bugLine: 5,
    highlightLines: [5],
    options: [
      {
        id: 'py-05-a',
        text: 'The "is" keyword checks memory identity (same object in RAM), while "==" checks value equivalence.',
        explanation: 'Correct! "is" tests whether two variables point to the exact same object in memory (id(a) == id(b)). Dynamically constructed strings often reside at different memory addresses, so "is" evaluates to False even though their text contents are identical.'
      },
      {
        id: 'py-05-b',
        text: 'Strings in Python cannot be concatenated with the + operator.',
        explanation: 'String concatenation with + is standard Python.'
      },
      {
        id: 'py-05-c',
        text: 'The expected_token variable was not declared in the global scope.',
        explanation: 'Local variables inside functions have normal local scope.'
      },
      {
        id: 'py-05-d',
        text: 'verify_auth_token does not handle None inputs.',
        explanation: 'While handling None is good practice, "received_token is expected_token" is the root cause of the equality failure.'
      }
    ],
    correctOptionId: 'py-05-a',
    hints: [
      {
        level: 1,
        title: 'Identity vs Equivalence',
        content: 'What is the fundamental difference in Python between `a is b` and `a == b`?'
      },
      {
        level: 2,
        title: 'String Interning Nuance',
        content: 'While Python interns small literals, dynamically created strings often create distinct objects with different memory addresses (`id()`).'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Change `user_token is expected_token` to `user_token == expected_token`. Reserve `is` for singleton checks like `x is None`.'
      }
    ],
    correctedCode: `def verify_auth_token(user_token):
    expected_token = "secure_auth_token_2026"
    
    # Use == to compare string values
    return user_token == expected_token

part1 = "secure_auth"
part2 = "_token_2026"
received_token = part1 + part2

is_valid = verify_auth_token(received_token)
print(f"Token verified: {is_valid}") # Prints True
`,
    rootCause: 'The "is" operator performs identity comparison, checking if two variables reference the identical object in memory (id(a) == id(b)). In contrast, "==" performs equality comparison, verifying if the objects have the same value. Because received_token is dynamically built, Python allocates a new string object in memory, failing the identity check despite having matching characters.',
    expectedBehavior: 'Using "==" compares the string contents character by character, returning True.'
  },
  {
    id: 'py-bare-except-handling',
    title: 'Bare except Swallowing Critical Errors',
    description: 'This configuration loader parses an integer port number from a dictionary. When the key is missing or the user presses Ctrl+C to terminate the program, the script swallows the keyboard interrupt and prints a misleading error.',
    language: 'python',
    difficulty: 'Advanced',
    category: 'Exception Handling',
    xpReward: 150,
    faultyCode: `def parse_server_port(config):
    try:
        raw_port = config['server']['port']
        port_num = int(raw_port)
        return port_num
    except:
        # Fallback when parsing fails
        print("Error reading port number! Using default 8080.")
        return 8080

# Bug: Catches KeyboardInterrupt, SystemExit, and typos like config['server_misspelled']
sample_config = {"server": {"port": "9000"}}
print(f"Port: {parse_server_port(sample_config)}")
`,
    bugLine: 6,
    highlightLines: [6, 7],
    options: [
      {
        id: 'py-06-a',
        text: 'A bare "except:" catches BaseException, swallowing KeyboardInterrupt, SystemExit, and unhandled syntax errors; it should catch specific exceptions like (KeyError, ValueError).',
        explanation: 'Correct! A bare except clause catches BaseException, including system exit signals like KeyboardInterrupt. It also masks unexpected programming bugs and makes debugging impossible.'
      },
      {
        id: 'py-06-b',
        text: 'Dictionary lookups in Python cannot be chained with multiple bracket keys.',
        explanation: 'Chained indexing config["server"]["port"] is completely valid for nested dictionaries.'
      },
      {
        id: 'py-06-c',
        text: 'The int() function cannot convert strings representing numbers into integers.',
        explanation: 'int("9000") is the standard way to convert numeric strings into integers.'
      },
      {
        id: 'py-06-d',
        text: 'try-except blocks in Python require a finally block to compile.',
        explanation: 'finally blocks are completely optional in Python try statements.'
      }
    ],
    correctOptionId: 'py-06-a',
    hints: [
      {
        level: 1,
        title: 'Exception Hierarchy',
        content: 'What does a bare `except:` catch in Python? Does it catch only `Exception` or `BaseException`?'
      },
      {
        level: 2,
        title: 'System Signals',
        content: '`KeyboardInterrupt` (Ctrl+C) and `SystemExit` inherit from `BaseException`. A bare `except:` catches them, preventing the user from killing the process.'
      },
      {
        level: 3,
        title: 'Exact Fix',
        content: 'Catch only the expected error types: `except (KeyError, ValueError) as e:` so unexpected errors and system signals propagate normally.'
      }
    ],
    correctedCode: `def parse_server_port(config):
    try:
        raw_port = config['server']['port']
        return int(raw_port)
    except (KeyError, ValueError) as err:
        # Catch only specific expected failure modes
        print(f"Port configuration invalid ({err}). Falling back to 8080.")
        return 8080

sample_config = {"server": {"port": "9000"}}
print(f"Port: {parse_server_port(sample_config)}")
`,
    rootCause: 'In Python, a bare "except:" statement intercepts all subclasses of BaseException. This includes critical system interrupts such as KeyboardInterrupt and SystemExit, as well as programming errors like typos or MemoryError. Swallowing all exceptions indiscriminately masks true root causes and breaks clean process termination.',
    expectedBehavior: 'Explicitly catching "(KeyError, ValueError)" handles missing keys and invalid numeric formats cleanly, while allowing system interrupt signals to function as expected.'
  }
];

// Helper functions for dataset querying
export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function getChallengesByLanguage(lang: 'c' | 'python'): Challenge[] {
  return CHALLENGES.filter((c) => c.language === lang);
}

export const ALL_CATEGORIES = Array.from(new Set(CHALLENGES.map((c) => c.category)));
