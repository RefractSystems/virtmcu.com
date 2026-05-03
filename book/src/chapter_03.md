Here is Chapter 3 of the textbook. I have meticulously expanded the explanations, provided concrete assembly language examples, and thoroughly explored the ARM64 Application Binary Interface (ABI) and call stack to ensure the text provides the necessary academic depth for your graduate students while strictly meeting your length constraints.

***

# Chapter 3: Instruction Set Architecture (ISA) and ARM AArch64

## 3.1 Introduction to the Instruction Set Architecture
In the preceding chapters, we explored how continuous voltages are abstracted into discrete digital logic and how those digital states are grouped into bytes and words to represent meaningful data. However, data without manipulation is inert. To perform computation, a computer must be commanded by a sequence of instructions. The vocabulary of commands understood by a specific microprocessor is known as its **Instruction Set Architecture (ISA)**.

The ISA serves as the critical contract between the hardware engineers who design the silicon and the software engineers who write the compilers and applications. From the programmer’s perspective, the ISA defines the architectural state of the processor: the memory model, the available registers, the data types supported, and the specific binary encodings required to force the hardware to perform operations such as addition, branching, and data movement. Because the ISA abstracts away the underlying microarchitecture—the physical arrangement of logic gates, pipelines, and caches—software written for a specific ISA can run unmodified on entirely different hardware implementations, provided both adhere to the same ISA standard.

Historically, ISAs fall into two primary design philosophies: **Complex Instruction Set Computer (CISC)** and **Reduced Instruction Set Computer (RISC)**. CISC architectures, most notably the x86 and x64 families that dominate personal computers, provide a vast, complex vocabulary of variable-length instructions. A single CISC instruction might fetch data from memory, perform a mathematical operation, and write the result back to memory. While this approach produces compact program code, the variable-length nature of the instructions requires highly complex silicon to decode and execute. 

In contrast, **RISC** architectures, such as ARM and RISC-V, were designed from a clean slate to execute instructions as rapidly and simply as possible. RISC architectures follow a strict **load/store model**. Computational instructions operate strictly on data already held within the processor's internal registers. Accessing system memory is isolated entirely to explicit load and store instructions. Although a RISC processor requires more total instructions to perform a memory-to-memory calculation, the instructions themselves are of a fixed length (typically 32 bits), allowing the hardware decoder to be significantly simpler, the clock frequencies to be higher, and the execution pipelines to be deeper and more efficient.

## 3.2 The Evolution of ARM and AArch64
The ARM architecture, originally standing for Acorn RISC Machine, was first developed in 1983. Over the subsequent decades, ARM processors became the dominant architecture in embedded systems, mobile phones, and tablets due to their exceptional balance of high performance, low power consumption, and small physical footprint. 

For most of its history, ARM was a 32-bit architecture. However, as mobile and computing workloads evolved to require processing massive datasets and accessing more than 4 Gigabytes of memory, the 32-bit address space became a critical bottleneck. In 2011, ARM announced the ARMv8-A architecture, introducing a full 64-bit architecture known as **AArch64**. 

The AArch64 execution state provides a 64-bit virtual address space and introduces a completely new instruction set named **A64**. Unlike previous transitions in other architectures (such as x86 to x64) where the new architecture was merely an extension of the old, the A64 instruction set was designed as a distinct, modern 64-bit ISA. While modern ARMv8-A and later processors maintain backward compatibility by supporting an AArch32 execution state for legacy 32-bit code, the two instruction sets are fundamentally incompatible; you cannot mix A64 and 32-bit ARM instructions in the same execution stream. Because modern high-performance computing, deep learning, and advanced Cyber-Physical Systems require the vast memory and throughput capabilities of 64-bit systems, this book focuses exclusively on the AArch64 state and the A64 instruction set.

## 3.3 The AArch64 Programmer's Model
Software engineers accustomed to high-level languages like C or Python are used to declaring an arbitrary number of variables. At the ISA level, however, the processor provides only a small, fixed number of ultra-fast memory locations directly on the silicon core. These are known as **registers**. Because AArch64 relies on a load/store architecture, registers act as the middleman for almost every calculation. Understanding the layout and purpose of these registers is the first step in mastering the programmer's model.

### 3.3.1 General-Purpose Registers (X0-X30, W0-W30)
The AArch64 architecture provides thirty-one general-purpose 64-bit registers, accessible in assembly language as **X0 through X30**. These registers can be used for arithmetic, logical operations, and memory address calculation. 

To efficiently handle 32-bit data types (such as standard `int` variables in C), the architecture allows programmers to access the lower 32 bits of any X register by using the **W0 through W30** aliases. The X and W registers physically map to the exact same silicon. If an assembly instruction modifies a 32-bit W register, the processor automatically zero-extends the result, clearing the upper 32 bits of the corresponding 64-bit X register to zero. For example, writing the 32-bit value `0xFFFFFFFF` into W0 automatically forces X0 to become `0x00000000FFFFFFFF`.

### 3.3.2 Special-Purpose Registers (SP, LR, FP, PC, PSTATE)
In addition to the general-purpose registers, the ARM CPU tracks its execution state using a set of dedicated special-purpose registers:

*   **Stack Pointer (SP / X31):** The processor maintains a hardware stack in memory to track function calls and local variables. The 64-bit SP register points to the top of this active stack. Interestingly, the AArch64 architecture multiplexes the register index 31. Depending on the specific instruction context, referring to register 31 either accesses the Stack Pointer (SP) or acts as a dedicated Zero Register (**XZR** for 64-bit, **WZR** for 32-bit) which always reads as zero and discards any writes.
*   **Program Counter (PC):** The 64-bit PC register contains the absolute memory address of the instruction currently being executed. Because A64 instructions are uniformly 32 bits (4 bytes) wide, the hardware automatically increments the PC by 4 upon the completion of each sequential instruction. Unlike in the 32-bit ARM architecture, user code cannot write directly to the PC register to cause a jump; it must use dedicated branch instructions.
*   **Link Register (LR / X30):** When the processor executes a function call, it must remember the address to return to once the function finishes. The AArch64 architecture dedicates X30 as the Link Register (LR) for this purpose.
*   **Frame Pointer (FP / X29):** Complex functions establish "stack frames" or activation records in memory. X29 is conventionally reserved as the Frame Pointer (FP) to serve as a reliable base address for accessing local variables and parameters allocated on the stack.
*   **Process State Register (PSTATE):** The PSTATE register holds various system configurations and the highly critical **Condition Code Flags**. The flags indicate the results of the most recently executed arithmetic or logical instruction. The four primary flags are:
    *   **N (Negative):** Set to 1 if the result of an operation is mathematically negative (i.e., the most significant bit is 1).
    *   **Z (Zero):** Set to 1 if the result of the operation is exactly zero.
    *   **C (Carry):** Set to 1 if an unsigned addition results in a carry-out, or an unsigned subtraction does not require a borrow.
    *   **V (Overflow):** Set to 1 if a signed arithmetic operation produces a result too large (or too negative) to fit in the destination register.

## 3.4 Assembly Language and Load/Store Mechanics
High-level variables must be transferred between the processor's registers and main memory. AArch64 utilizes the `ldr` (Load Register) and `str` (Store Register) instructions for this task. 

### 3.4.1 Addressing Modes
To access memory, the hardware calculates an **Effective Address** using various addressing modes.
*   **Register-Indirect:** The simplest addressing mode fetches data using an absolute memory address held in a 64-bit register. 
    `ldr x0, [x1]` loads the 64-bit value located at the address held in X1 into the destination register X0.
*   **Indirect-Plus-Offset:** It is incredibly common to access data sequentially, such as in an array. This mode adds a fixed offset to the base register.
    `ldr w0, [x1, #4]` calculates the effective address as X1 + 4 bytes, loading the resulting 32-bit word into W0.
*   **Pre-indexed:** This mode adds an offset to the base register, accesses the memory, and then *permanently updates* the base register with the new address. This is denoted by an exclamation mark `!`.
    `str x0, [sp, #-16]!` drops the stack pointer by 16 bytes and then stores X0 at that new memory location. This is the fundamental mechanism for pushing data onto the stack.
*   **Post-indexed:** This mode accesses the memory at the base register's *current* address, and only updates the base register with the offset *after* the access completes.
    `ldr x0, [sp], #16` reads 64 bits from the top of the stack into X0, and subsequently raises the stack pointer by 16 bytes. This is the fundamental mechanism for popping data off the stack.

### 3.4.2 Arithmetic and Data Movement
To copy data between registers, or to load a small constant into a register, AArch64 provides the `mov` instruction:
`mov x1, x0` (Copies X0 to X1)
`mov x2, #10` (Loads the immediate constant 10 into X2).

For mathematics, the `add` and `sub` instructions perform addition and subtraction. By default, these operations *do not* affect the PSTATE condition flags. This is a deliberate RISC design choice, allowing the compiler to reorder instructions without accidentally destroying flag states needed by subsequent branches. To force the hardware to update the N, Z, C, and V flags, the software must append an `s` suffix to the instruction mnemonic, utilizing `adds` or `subs`.

## 3.5 Translating High-Level Flow Control
Computers derive their power from the ability to make decisions. In high-level languages like C, this is achieved via `if/else` statements and `while` or `for` loops. In AArch64 assembly, all control flow boils down to comparing values and conditionally altering the Program Counter (PC) to branch to new memory addresses.

### 3.5.1 The Compare and Branch Instructions
Decision-making requires two steps: evaluating a condition, and branching based on the result. 
The **`cmp` (Compare)** instruction subtracts its right operand from its left operand, discards the mathematical result, and updates the PSTATE flags (N, Z, C, V). For example, `cmp x0, x1` performs X0 - X1. If X0 exactly equals X1, the subtraction yields 0, and the Z (Zero) flag is set to 1.

Following the `cmp`, the program uses a **Conditional Branch** instruction to test the flags and potentially jump to a new statement label. Common conditional branches include:
*   `beq` (Branch if Equal): Jumps if the Z flag is 1.
*   `bne` (Branch if Not Equal): Jumps if the Z flag is 0.
*   `bgt` (Branch if Greater Than): Jumps if signed greater than (evaluates N and V flags).
*   `blt` (Branch if Less Than): Jumps if signed less than.
*   `bhi` / `blo` (Branch if Higher / Lower): Jumps based on unsigned comparisons.
*   `b` or `b.al` (Branch Unconditional): Forces a jump regardless of flags, equivalent to a `goto` statement.

### 3.5.2 Simulating If-Then-Else
Consider a standard C block:
```c
if (x == y) {
    c = d;
} else {
    c = 0;
}
```
At the machine level, the compiler generates assembly language that evaluates the opposite condition to skip blocks of code. Assuming `x` is in X0, `y` is in X1, `c` is in X2, and `d` is in X3, the equivalent AArch64 code is:
```assembly
    cmp x0, x1         // Compare x and y
    bne else_block     // If x != y, jump directly to the else block
    mov x2, x3         // THEN block: c = d
    b end_if           // Unconditionally jump over the else block
else_block:
    mov x2, xzr        // ELSE block: c = 0 (using the Zero Register)
end_if:
```
Software engineers translating complex compound booleans (e.g., `if (x == y && z < t)`) rely on **short-circuit evaluation**. Once the first condition `x == y` is proven false, the program immediately jumps to the `else` block without wasting CPU cycles evaluating the `z < t` condition. The AArch64 architecture also provides a highly advanced `ccmp` (Conditional Compare) instruction designed specifically to chain Boolean evaluations natively in hardware, minimizing expensive branch operations.

### 3.5.3 Loops and Optimization
Loops execute a block of code repeatedly. A `while` loop checks a termination condition at the beginning of the block. If the condition is false, it branches past the loop body. If true, it executes the body and uses an unconditional branch `b` to jump back to the test. 

However, computer architects and compiler writers employ strict optimization techniques to increase pipeline efficiency. The most common optimization is **moving the termination condition to the end of the loop**. A `do-while` (or `repeat-until`) loop evaluates its condition at the bottom. By compiling standard `for` and `while` loops to behave like `do-while` loops (preceded by a single initial check to ensure the loop should execute at least once), the compiler eliminates one unconditional branch instruction per iteration. 

Furthermore, loops counting downward to zero are inherently faster than loops counting upward. Executing `subs x0, x0, #1` inherently sets the PSTATE flags, allowing a subsequent `bne` (Branch if Not Equal) to evaluate the loop termination without requiring an explicit `cmp` instruction against a target boundary. Understanding these hardware-level behaviors allows software engineers to write highly performant C code that maps gracefully to ISA optimizations.

## 3.6 The Application Binary Interface (ABI)
As software engineering modularized, the ability to write a function in C and reliably call a function written in C++, Assembly, or Rust became mandatory. For this interoperability to exist, there must be strict, universally agreed-upon rules governing how functions interact at the hardware level. This contract is the **Application Binary Interface (ABI)**.

While the ISA dictates how the silicon executes instructions, the ABI dictates how software uses the registers and memory. If a caller routine and a callee routine do not agree on where parameters are stored, the program will instantly crash or corrupt memory. 

### 3.6.1 Parameter Passing and Return Values
The ARM64 ABI mandates that the first eight arguments of a function call are passed in the general-purpose registers **X0 through X7**. Passing parameters in registers is tremendously fast because it bypasses the slower main memory completely. If a function requires more than eight arguments, or the arguments are too large to fit in 64-bit registers (such as large C `struct`s), the additional parameters must be pushed onto the hardware stack in memory. 

When the callee function finishes its work, the ABI dictates that integer and pointer return values must be placed in the **X0** register. 

### 3.6.2 Volatile vs. Nonvolatile Registers
When Function A calls Function B, Function A might have critical calculations currently held in its registers. If Function B overwrites those registers, Function A's logic is destroyed upon return. The ABI solves this by classifying registers as either **volatile** (caller-saved) or **nonvolatile** (callee-saved).

*   **Volatile Registers (X0-X15):** The ABI states that these registers are completely disposable across function calls. Function B is free to overwrite X0-X15 at any time. If Function A needs the data in X0-X15 to survive the function call, Function A must push those registers to the stack *before* calling Function B, and pop them back off afterward.
*   **Nonvolatile Registers (X19-X28):** The ABI dictates that Function B *must not* destroy the values in these registers. If Function B wishes to use X19 for its own mathematics, Function B must push the original value of X19 to the stack upon entry, use the register, and pop the original value back into X19 before returning to Function A. 

## 3.7 The Call Stack and Stack Frames
With the ABI rules established, we can examine the mechanics of invoking a function. A procedure call alters the flow of control, but unlike a standard branch, it must return to the exact instruction immediately following the call once it completes. 

### 3.7.1 Branch with Link (`bl`) and Return (`ret`)
In AArch64, a function call is initiated via the **`bl` (Branch with Link)** instruction. When the CPU executes `bl my_function`, it does two things simultaneously:
1.  It jumps the Program Counter (PC) to the first instruction of `my_function`.
2.  It copies the address of the *next* sequential instruction (the return address) directly into the **Link Register (LR / X30)**.

Once `my_function` completes its task, it executes the **`ret` (Return)** instruction. The `ret` instruction seamlessly copies the 64-bit address held in the Link Register back into the Program Counter, instantly returning execution to the caller.

However, this creates a major architectural challenge. Because the processor only has one Link Register, what happens if Function A calls Function B, and Function B needs to call Function C? When Function B executes its `bl` instruction, the hardware will overwrite the Link Register with the new return address for C, permanently obliterating the return address for A. If Function B then attempts to `ret`, it will enter an infinite loop or crash the system.

### 3.7.2 Building the Activation Record
To solve the destroyed Link Register problem, and to allocate memory for localized variables, functions must build an **Activation Record**, more commonly known as a **Stack Frame**, in main memory. The stack frame isolates the execution state of the current function from all other functions in the system.

Upon entry, an ABI-compliant function executes a "prologue" sequence. The most critical step is preserving both the Frame Pointer (FP) and the Link Register (LR) by pushing them to the stack. Because the ARM architecture strictly demands that the Stack Pointer (SP) remains aligned on a **16-byte boundary** at all times, pushing the 8-byte FP and the 8-byte LR simultaneously is highly efficient.

The standard AArch64 stack frame prologue looks like this:
```assembly
my_function:
    // 1. Push FP and LR to the stack, decrementing SP by 16 bytes
    stp fp, lr, [sp, #-16]! 
    
    // 2. Set the Frame Pointer to the bottom of the new frame
    mov fp, sp
    
    // 3. Allocate N bytes of space for local variables (N must be a multiple of 16)
    sub sp, sp, #32 
```
With this stack frame established, the function can freely use the `bl` instruction to call other subroutines, knowing its original return address is safely preserved in RAM. It can also use the Frame Pointer (`fp`) to reliably access its local variables (e.g., `ldr w0, [fp, #16]`).

When the function finishes, it executes an "epilogue" sequence to deallocate the stack frame, pop the original Frame Pointer and Link Register back into the CPU registers, and return:
```assembly
    // 1. Deallocate local variables
    mov sp, fp
    
    // 2. Pop FP and LR from the stack, incrementing SP by 16 bytes
    ldp fp, lr, [sp], #16
    
    // 3. Return to caller using the restored LR
    ret
```
The stack frame discipline enables the most critical concept in computer science: **recursion**. Because each function invocation generates an entirely new, isolated stack frame in memory containing its own local variables and specific return address, a function can call itself infinitely (until physical memory is exhausted) without overwriting its previous state.

## 3.8 VirtMCU Homework: Stack Tracing and Deterministic Execution
In traditional operating systems, inspecting stack frames and observing execution state at the instruction level is obfuscated by OS schedulers and virtual memory mapping. To bridge this gap, you will utilize the **VirtMCU** framework for your Chapter 3 homework.

VirtMCU instantiates dynamic ARM machines relying on QEMU, utilizing dynamic QOM plugins to bypass standard emulation limits. Because VirtMCU implements *Cooperative Time Slaving*, the emulated processor executes deterministically.

1. **Translating C to AArch64:** You will be provided with a recursive C function that computes the factorial of an integer. Your first task is to manually translate this C code into strict AArch64 assembly, adhering completely to the ARM64 ABI. You must properly classify registers as volatile or nonvolatile, handle parameter passing via X0, and manually construct and destruct the stack frame (`stp fp, lr, [sp, #-16]!`) to preserve the Link Register during recursion.
2. **Deterministic Step Execution:** You will compile your bare-metal binary and load it into a VirtMCU instance running in `slaved-icount` mode. Because this mode provides exact nanosecond virtual time and locks the execution loop, you will be able to attach `gdb` and step through the binary cycle-by-cycle without any background host OS jitter interfering with the execution timing.
3. **Stack Frame Inspection:** As your recursive function calls itself, you will use the `gdb` memory inspection tools (introduced in Chapter 2) to manually dump the stack memory. You will trace the 16-byte alignments, identify where the `stp` instruction has written the sequential Link Register return addresses, and empirically verify the isolated local variables residing at fixed offsets from the Frame Pointer (`x29`).