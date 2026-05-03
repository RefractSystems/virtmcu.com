# Chapter 3: The Instruction Set Architecture (ISA) - ARM AArch64

## 3.1 Introduction: The Hardware-Software Interface
In the previous chapters, we examined the digital logic that physically processes binary signals. We now move up the hierarchy to the **Instruction Set Architecture (ISA) level**. The ISA is the formal boundary between the hardware and the software. It encompasses the complete set of machine instructions, the programmer-visible register set, the memory addressing modes, and the data types understood by a specific microprocessor. For software engineers and compiler writers, the ISA level is what is typically thought of as "machine language". 

An architecture is completely defined by its instruction set and architectural state. While different microarchitectural implementations can vary wildly in cost, performance, and complexity (e.g., adding deeper pipelines or out-of-order execution), they must all successfully execute the same binary programs if they share the same ISA. In this chapter, we will explore the 64-bit ARM architecture (AArch64) as our primary educational ISA and introduce the fundamentals of assembly language programming.

## 3.2 Instruction Set Design: RISC vs. CISC
When designing an instruction set, computer architects must decide how to encode the operations (opcodes) and their operands. Architectures generally fall into two broad philosophies: Complex Instruction Set Computers (CISC) and Reduced Instruction Set Computers (RISC).

CISC processors, such as the Intel x86 family, provide highly complex instructions that can span varying lengths (up to 17 bytes) and can often perform arithmetic operations directly on memory addresses. RISC processors, such as ARM and MIPS, prioritize simplicity and regularity. To simplify hardware decoding, RISC architectures typically encode all instructions in a fixed 32-bit width format. 

A defining feature of RISC architectures like the ARM is their use of a **load/store architecture**. All computational activity strictly takes place within the processor's general-purpose registers; the only instructions permitted to interact directly with main memory are those that explicitly load a value from memory or store a value into memory. Furthermore, RISC processors typically employ a three-address machine format for data processing, where an arithmetic instruction explicitly specifies two source registers and one destination register. 

## 3.3 The AArch64 Programmer's Model
To write assembly language for the ARM processor, a programmer must understand its architectural state. The 64-bit ARM architecture (AArch64) provides many general-purpose registers for data manipulation. These registers are 64 bits wide and are named **X0** through **X30**. The lower 32 bits of these registers can be accessed independently using the names **W0** through **W30**.

While the CPU hardware treats most of these registers as functionally interchangeable, the software Application Binary Interface (ABI) imposes strict rules on how they are used. Certain registers are dedicated to special purposes:
*   **The Link Register (LR / X30):** The ARM processor reserves this register to hold the return address during subroutine and function calls. When a program executes a branch and link (`bl`) instruction, the CPU automatically saves the address of the next sequential instruction into the LR. 
*   **The Stack Pointer (SP):** Used to maintain the call stack in memory, the SP points to the current top of the stack and is heavily utilized for pushing and popping variables, preserving volatile registers, and saving return addresses during nested function calls,.
*   **The Program Counter (PC):** The PC maintains the memory address of the instruction currently being executed by the processor. 

## 3.4 Memory Addressing and Endianness
Modern processors utilize byte-addressable memory, meaning each byte in memory is assigned a unique address. When the CPU needs to access a multibyte data type (such as a 32-bit word or a 64-bit doubleword), it must be aware of the system's **endianness**. 

In a **little-endian** memory organization, the lowest-order byte of a multibyte value is stored at the lowest memory address,. Conversely, a **big-endian** architecture stores the highest-order byte at the lowest memory address. The ARM architecture actually supports selecting between big- or little-endian modes under software control—a feature known as bi-endianness—though most modern operating systems execute in little-endian mode by default. 

### 3.4.1 Addressing Modes
To load data from memory into a register (or store data from a register to memory), the processor must compute the target memory address. ARM supports several addressing modes:
*   **PC-Relative:** Computes the address as an offset relative to the current Program Counter. The `adr` and `adrp` instructions use this mode to securely obtain the address of labels and constants located nearby in the program's code section.
*   **Register Indirect:** The memory address is provided directly inside a base register (e.g., `ldr r0, [r1]`).
*   **Register Indirect with Offset:** An offset is added to the base register to compute the address. This offset can be an immediate numerical constant (e.g., `ldr r0, [r1, #32]`) or the value of another register.
*   **Pre-increment and Post-increment:** These modes automatically update the base register after computing the address, making them exceptionally useful for iterating through arrays or implementing push and pop stack operations,. For example, `ldr x0, [sp], #16` pops data off the stack and subsequently adds 16 to the stack pointer. Conversely, `str lr, [sp, #-16]!` pushes data by first subtracting 16 from the stack pointer and then storing the Link Register at that new address.

## 3.5 ARM Assembly Language Basics
Assembly language programs use **directives** (or pseudo-instructions) to instruct the assembler on how to organize the program in memory. A typical program is divided into multiple distinct sections:
*   **The `.text` section:** This section contains the actual executable machine instructions. For security, operating systems typically map the `.text` section into memory pages that are marked as read-only and executable, meaning any attempt to store data here will result in a segmentation fault,.
*   **The `.data` section:** Used to declare initialized static variables and embed lists of data. 
*   **The `.rodata` section:** Used specifically for read-only constant data, such as fixed string sequences.
*   **The `.bss` section:** Reserved for uninitialized global variables. Variables placed in the `.bss` section are zeroed out at startup and consume very little disk space within the compiled executable file. 

Because the Memory Management Unit (MMU) controls access permissions (like read/write vs. read-only) with page-level granularity, the linker ensures that each of these sections begins on a new MMU page boundary. 

Data processing in AArch64 centers around a core group of instructions. Data is transferred between registers and memory using `ldr` (load register) and `str` (store register), or between registers using `mov`,. Basic arithmetic is handled by instructions such as `add`, `sub`, and `mul`,. Bitwise logical instructions, including `and`, `orr` (OR), and `eor` (Exclusive-OR), are provided to manipulate specific bits within a word.

## 3.6 Low-Level Control Flow
To emulate the control flow structures found in High-Level Languages (HLLs)—such as `if...then...else` blocks, `switch` statements, and `while` loops—assembly language relies heavily on conditional branches and indirect jumps. 

This process begins with the **compare instruction (`cmp`)**. The `cmp` instruction evaluates two operands by effectively subtracting the second operand from the first. However, rather than saving the mathematical result into a destination register, it uses the result solely to update the processor's status flags. These flags record whether the result was Zero, whether it generated a Carry, whether it was Negative, or whether it caused an Overflow. 

Once the flags are updated, a **conditional branch instruction** is used to transfer control depending on the specific states of those flags. 
*   `beq` (Branch if Equal) and `bne` (Branch if Not Equal) evaluate the Zero flag to jump if the operands were identical or different.
*   `blo` (Branch if Lower) and `bhi` (Branch if Higher) are used to branch based on unsigned magnitude comparisons.

To emulate an `if...then...else...endif` statement in assembly language, the programmer uses a `cmp` instruction followed by a conditional branch that evaluates the *opposite* of the high-level condition. If the condition evaluates to false, the CPU branches *over* the `then` block instructions directly into the `else` block. An unconditional branch (`b` or `b.al`) is placed at the end of the `then` block to jump over the `else` statements so that both blocks are not executed sequentially,. 

For `switch...case` statements with many potential paths, assembly programmers often use **jump tables**. Instead of writing a long chain of `cmp` and `beq` instructions, the program calculates an index, loads an execution address from an array of addresses in memory, and uses an indirect branch (like `br`) to jump instantly to the appropriate case handler. 

Finally, for transferring control to a subroutine or function, the CPU uses the **`bl` (Branch and Link)** instruction, which jumps to the target label while simultaneously saving the return address into the Link Register (LR). When the subroutine finishes its execution, it issues a **`ret` (Return)** instruction, which unconditionally copies the address held in the LR back into the Program Counter, safely returning control to the caller,.