# Chapter 2: Talking to the Processor: ARM64 and RISC-V Assembly

Most of the time, you should be writing your Cyber-Physical System (CPS) firmware in a high-level language (HLL) like C, C++, or Rust. Modern optimizing compilers are exceptionally good at crunching math and logic, and they usually generate more efficient code than a human writing assembly by hand. 

But occasionally, the compiler gets in your way. 

## 2.1 Why Assembly Still Matters

If compilers are so smart, why are we dedicating a chapter of this book to raw assembly language? 

In desktop and cloud software, you can go your entire career without looking at a single machine instruction. But in the embedded and CPS world, there are specific, critical tasks where high-level languages are fundamentally blind. You must drop down to assembly language for three crucial reasons:

1.  **RTOS Context Switching:** A Real-Time Operating System (RTOS) scheduler works by pausing "Task A," saving its exact CPU state, and restoring the exact CPU state of "Task B". The C language has no concept of raw CPU registers or forcibly swapping the stack pointer. To write a context switch, you *must* manually push and pop CPU registers to the stack using assembly language.
2.  **Hardware Bootstrapping:** When power is first applied to a microcontroller, there is no C runtime environment. There is no stack. The `.bss` section (uninitialized variables) is full of random garbage instead of zeros. The startup code (`crt0`) must be written in assembly to configure the memory controller, initialize the Stack Pointer (SP), and set up the C environment before branching to your `main()` function.
3.  **Custom Hardware Extensions:** If you are building a custom RISC-V processor and you added a proprietary neural network matrix-multiply instruction directly into the silicon, the standard GCC compiler doesn't know it exists. You have to invoke it manually using inline assembly.

> **TIP: Use it Like a Scalpel, Not a Sledgehammer**
> Don't write your entire drone flight controller in assembly language. Write 99% of your app in C or Rust, and use inline assembly or tiny `.S` files purely to bridge the hardware-software gap. 

## 2.2 AArch64 & RISC-V Basics

In this book, our SOTA targets are 64-bit ARM (AArch64) and 64-bit RISC-V (RV64). While they are created by different organizations, both architectures share a deeply rooted philosophy: they are **Reduced Instruction Set Computers (RISC)**.

### The Load/Store Architecture

If you have ever hacked around on an Intel or AMD x86 processor (a Complex Instruction Set Computer, or CISC), you might be used to instructions that perform arithmetic directly on memory. For instance, x86 allows an instruction like `ADD [EAX], 5`, which reaches out to RAM, modifies the value, and writes it back.

ARM64 and RISC-V strictly forbid this. They employ a **load-store architecture**. 

In a load-store architecture, the CPU cannot perform arithmetic directly on variables sitting in RAM. All computational activity strictly takes place within the processor's internal registers. The only instructions permitted to interact with memory are explicitly those that *load* a value from memory into a register, or *store* a value from a register into memory.

If you want to increment a sensor value in memory, you must:
1. **Load** the value from RAM into a CPU register.
2. **Add** 1 to the register inside the CPU.
3. **Store** the updated register back to RAM.

While this might seem like it takes more instructions, it drastically simplifies the silicon hardware, allowing the processor pipeline to be clocked at much higher frequencies.

### General-Purpose Registers

To compensate for the fact that you have to load everything from memory to operate on it, both ARM64 and RISC-V provide a massive playground of **32 general-purpose registers**. You can think of registers as ultra-fast, temporary scratchpads located directly inside the CPU core.

**In AArch64:**
The 32 registers are named **X0 through X31**. Each `X` register is 64 bits wide. If you are operating on 32-bit data (like a standard C `int`), you simply refer to the exact same physical registers as **W0 through W31**. Writing to a `W` register automatically zeros out the upper 32 bits of the corresponding `X` register. 

**In RISC-V:**
The 32 registers are named **x0 through x31**. 

However, in both architectures, a couple of these registers have very special hardware behaviors:

*   **The Zero Register:** In RISC-V, `x0` is hardwired to the constant value `0`. If you read from it, you get 0. If you write to it, the data is instantly discarded. ARM64 handles this using a pseudo-register named `XZR` (or `WZR` for 32-bit), which provides a convenient way to get a zero or discard a result.
*   **The Stack Pointer (SP):** Used to maintain the call stack in memory for local variables and context saving. In ARM64, this is technically register `X31`, but you refer to it in code as `SP`. In RISC-V, the stack pointer is conventionally mapped to `x2`. 
*   **The Link Register (LR / ra):** This is one of the most critical departures from x86 architecture. When you call a function in x86, the hardware pushes the return address onto the stack in memory. Memory is slow. In ARM64 and RISC-V, when you execute a function call instruction (like `bl` in ARM or `jal` in RISC-V), the CPU saves the return address directly into a high-speed register. ARM calls this the Link Register (`LR`, technically `X30`). RISC-V calls this the return address register (`ra`, mapped to `x1`).

### The Application Binary Interface (ABI)

While the CPU hardware treats most of these 32 registers identically, you cannot just throw data into whatever register you feel like using. 

If your assembly code calls a C function like `printf()`, or if a C program calls your assembly routine, both sides must agree exactly on where the parameters are located and where the result will be returned. This contract is called the **Application Binary Interface (ABI)**.

The ABI dictates **Parameter Passing**. Instead of pushing arguments onto the slow memory stack, both the ARM64 and RISC-V ABIs demand that you pass the first eight arguments directly in registers.

*   **ARM64 ABI:** Parameters 1 through 8 are placed in registers **X0 through X7**. 
*   **RISC-V ABI:** Parameters 1 through 8 are placed in registers **a0 through a7** (which map physically to `x10` through `x17`).

If your function computes a return value, it must be placed in **X0** (ARM64) or **a0** (RISC-V) before returning to the caller.

Let's look at a practical example. Suppose you write the following C function prototype:

```c
// C Code
int update_motor_speed(int base_pwm, int trim, int max_limit);
```

If you implement `update_motor_speed` in ARM64 assembly, the C compiler guarantees that when your assembly code starts executing, `base_pwm` will be sitting in `W0`, `trim` will be in `W1`, and `max_limit` will be in `W2`. You don't have to fetch them from memory.

```assembly
// ARM64 Assembly Implementation
.global update_motor_speed
update_motor_speed:
    // W0 = base_pwm
    // W1 = trim
    // W2 = max_limit
    
    add w0, w0, w1      // Add trim to base_pwm (W0 = W0 + W1)
    cmp w0, w2          // Compare the new speed against max_limit
    csel w0, w2, w0, gt // If new speed > max_limit, cap it at max_limit
    
    // The ABI says we must return the result in W0. 
    // It's already there, so we just return!
    ret
```

> **WARNING: The Link Register Trap**
> Notice that the `update_motor_speed` assembly code above is a "leaf function" (it doesn't call any other functions). If your assembly function *does* call another function (say, `printf()`), the `bl printf` instruction will overwrite the `LR` register with the new return address. Your original return address back to `main()` will be obliterated, and when your function hits `ret`, your program will fly off into random memory and crash. If your assembly function calls other functions, you **must** push your `LR` onto the stack at the very beginning of your code, and pop it back right before returning.

## 2.3 Inline Assembly: Breaking the Glass

Most of the time, you want to keep your C/C++ code and your assembly code separated by a clean, well-defined boundary. You write your high-level logic in `.c` files, and you put your gritty, low-level hardware manipulations into standalone `.S` files, linking them together at the end. 

But sometimes, creating a completely separate assembly file is overkill. If you just need to execute a single, highly specific machine instruction—one that the C compiler doesn't know how to generate natively—the overhead of a full function call (saving the return address, branching, executing one instruction, and branching back) is painfully inefficient. 

For these moments, modern compilers like GCC and Clang provide a backdoor: **Inline Assembly**. Inline assembly allows you to inject raw ARM machine instructions directly into the middle of your C or C++ functions.

> **TIP: Use Assembly Like a Scalpel, Not a Sledgehammer**
> Do not write entire algorithms in inline assembly. It makes your code incredibly hard to read, breaks cross-platform portability, and usually defeats the compiler's own highly advanced optimization passes. Write 99% of your application in C, C++, or Rust. Reach for inline assembly only as a precision scalpel—when you need to touch a specific CPU control register or execute a custom coprocessor instruction that the compiler literally cannot generate on its own.

### 2.3.1 Putting the CPU to Sleep with `wfi`

Let's look at a practical, real-world example where inline assembly is absolutely mandatory. 

In a battery-powered Cyber-Physical System, energy efficiency is paramount. If your operating system or super-loop has finished all its current tasks and is just waiting for the next sensor reading, you should never leave the CPU spinning in an empty `while(1)` loop. A spinning CPU pipeline draws maximum dynamic power and will drain your battery in hours. 

Instead, you want to put the processor into a deep sleep. The ARM architecture provides a specific instruction for this: `wfi` (Wait For Interrupt). When the CPU hits a `wfi` instruction, it immediately suspends execution, halts the instruction pipeline, and drops into a low-power sleep state. It remains frozen there until a physical hardware interrupt (like a timer ticking or a network packet arriving) wakes it back up.

Because `wfi` is a hardware-level pipeline control instruction, standard C has no concept of it. We must inject it using inline assembly.

Here is how you wrap it in C:

```c
void enter_low_power_mode(void) {
    // Tell the CPU pipeline to halt and wait for a hardware interrupt
    __asm__ volatile ("wfi"); 
}
```

Let's break down this syntax:
*   `__asm__`: This is the compiler directive that says, "Stop parsing C code; the following string contains raw assembly instructions."
*   `volatile`: In embedded systems, this keyword is your best friend. It tells the compiler's optimizer, "Do not attempt to delete, move, or optimize this instruction." Without `volatile`, the compiler might look at the `wfi` instruction, realize it doesn't modify any C variables, decide it is "useless," and completely delete it from your final program to save space.

### 2.3.2 The Extended Syntax and the Clobber List

The `wfi` example is trivial because it takes no arguments and returns no values. But what if you want to write inline assembly that actually manipulates your C variables? 

To do this, GCC uses an "Extended Assembly" syntax, which looks like a bizarre hybrid of C and assembly. It is divided into four sections, separated by colons:

```c
__asm__ volatile (
    "assembly_instructions" 
    : output_operands       
    : input_operands        
    : clobber_list          
);
```

To bridge the gap between the C variables and the hardware registers, the compiler uses placeholders like `%0`, `%1`, and `%2` inside the assembly string. The compiler automatically maps these placeholders to the variables you specify in the input and output operand lists.

Here is a practical example. Let's say you want to use an ARM `add` instruction to sum two C variables. 

```c
int a = 10, b = 20, result;

__asm__ volatile (
    "add %w0, %w1, %w2 \n\t"  // The assembly instruction
    : "=r" (result)           // Output operand (mapped to %0)
    : "r" (a), "r" (b)        // Input operands (mapped to %1 and %2)
    : /* No clobbers here */
);
```
*(Note: The `"r"` constraint tells the compiler to put the variable into any available general-purpose register. The `=` means it is an output that will be written to. The `w` in `%w0` forces the compiler to use the 32-bit `W` register name instead of the 64-bit `X` register name.)*

This brings us to the fourth, and most dangerous, part of the syntax: **The Clobber List**.

When the C compiler generates machine code, it is essentially playing a massive game of chess with the CPU's registers. It knows exactly which variable lives in `X19`, which memory address is temporarily cached in `X20`, and what the current state of the condition code flags (Zero, Carry, Negative, Overflow) are. 

When you inject inline assembly, you are making a move on the compiler's chessboard without telling it. If your assembly instruction secretly uses `X5` as a temporary scratchpad, but the compiler was keeping an important C pointer in `X5`, your inline assembly will overwrite that pointer. A few microseconds later, the C code will try to use that pointer, crash into unmapped memory, and trigger a segmentation fault.

The **clobber list** is your way of being honest with the compiler. It is a comma-separated list of strings where you confess to the compiler exactly which hardware resources you trashed during your inline assembly block. 

If your assembly modifies `X5` and `X6`, your clobber list must look like this:
`: "x5", "x6"`

If you execute an instruction with an `s` suffix (like `adds` or `subs`) which modifies the CPU's condition code flags, you must warn the compiler that the flags have been altered so it doesn't rely on them for a subsequent C `if` statement:
`: "cc"` (Condition Codes)

If your assembly instruction writes directly to a memory address (rather than just modifying registers), you must tell the compiler that cached memory values might now be stale:
`: "memory"`

If you fail to accurately declare your clobbers, your program will suffer from "Heisenbugs"—catastrophic, unpredictable failures that only appear when the compiler's optimizer is turned on. When using inline assembly as your scalpel, honesty with the compiler is the only way to keep the patient alive.