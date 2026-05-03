# Chapter 2: Data Representation and Machine Organization

## 2.1 Introduction: The Meaning of Bits
In the previous chapter, we stripped away the software abstractions to reveal the physical reality of computation: metal-oxide-semiconductor field-effect transistors (MOSFETs) acting as voltage-controlled switches,. We established that modern digital systems operate on the **digital abstraction**, restricting continuous analog voltages into two discrete, reliable states representing logic 0 and logic 1. 

However, a single bit—a solitary 0 or 1—carries very little information. Furthermore, the hardware itself has no inherent understanding of what these bits represent. Inside the computer, a number is simply a physical pattern of high and low voltages; it is the human programmer and the software architecture that assign meaning to these bit strings. Depending on the context of the program, a specific sequence of 32 bits might represent a signed integer, a floating-point fractional number, a string of text characters, an RGBA color pixel, or even an instruction dictating the next operation the processor must perform. 

For software engineers transitioning into computer architecture and cyber-physical systems (CPS), understanding precisely how data is represented, organized, and accessed in hardware is paramount. When writing high-level software, the compiler hides the physical layout of memory. In CPS and embedded systems, however, you will frequently interact directly with hardware registers, communication protocols, and sensor data. A misinterpretation of data formats—such as confusing a signed integer for an unsigned one, or reading bytes in the wrong order—can lead to catastrophic failures in the physical world. This chapter bridges the gap between raw binary logic and structured data, exploring number systems, memory architectures, and machine-level organization.

## 2.2 Number Systems and Positional Notation
You are already intimately familiar with the decimal numbering system, which is a base-10 positional notation system utilizing the digits 0 through 9. The base, or radix, defines the number of unique symbols used. In any positional notation system, the value of a digit is determined by its position relative to the radix point. Moving a digit one place to the left increases its value by a factor of the base, while moving it one place to the right decreases its value by the same factor. 

For example, the decimal number $123.456$ mathematically represents:
$1 \times 10^2 + 2 \times 10^1 + 3 \times 10^0 + 4 \times 10^{-1} + 5 \times 10^{-2} + 6 \times 10^{-3}$.

### 2.2.1 Binary and Hexadecimal
Because computer hardware relies on the two states of electronic switches, computers natively use the **binary numbering system** (base-2), consisting only of the digits 0 and 1. In binary, each column's weight is a power of 2. For instance, the binary number $11001010_2$ translates to decimal as:
$1 \times 128 + 1 \times 64 + 0 \times 32 + 0 \times 16 + 1 \times 8 + 0 \times 4 + 1 \times 2 + 0 \times 1 = 202_{10}$.

While binary perfectly matches the physical hardware, it is exceedingly verbose and difficult for humans to read. Representing the decimal number 202 requires eight binary digits but only three decimal digits. To mitigate this verbosity without losing the direct mapping to underlying bits, computer architects rely heavily on the **hexadecimal numbering system** (base-16). 

Hexadecimal uses 16 distinct symbols: the digits 0 through 9, followed by the letters A through F to represent the decimal values 10 through 15,. The mathematical beauty of hexadecimal lies in its relationship with binary: because $16 = 2^4$, exactly four binary digits (bits) map perfectly to one hexadecimal digit. By convention, hexadecimal numbers are often prefixed with `0x` in C-style languages or assembly (e.g., `0xDEADBEEF`) to distinguish them from decimal values,.

Converting between binary and hexadecimal is a trivial process of grouping bits. To convert a binary number to hexadecimal, simply pad the binary number with leading zeros until its length is a multiple of four, separate it into groups of four bits, and substitute the corresponding hexadecimal digit. For example, the binary string `1010101111001101` groups into `1010_1011_1100_1101`, which directly translates to `0xABCD`. 

### 2.2.2 Data Groupings: Bits, Nibbles, Bytes, and Words
Processors rarely manipulate individual bits in isolation. Instead, bits are grouped into standardized widths to form addressable data structures. 
*   **Nibble:** A grouping of 4 bits. A nibble can represent 16 distinct values ($2^4$) and perfectly corresponds to a single hexadecimal digit. It is also the size required to represent a single Binary-Coded Decimal (BCD) digit.
*   **Byte:** A grouping of 8 bits. The byte is arguably the most fundamental data structure in modern computing, as main memory and I/O addresses are almost universally byte-addressable. An 8-bit byte can represent 256 distinct values ($2^8$), typically ranging from 0 to 255 for unsigned integers.
*   **Half-Word, Word, and Double-Word:** While a byte is definitively 8 bits, the definition of a "word" depends strictly on the specific architecture of the processor—it represents the fundamental unit of data the CPU routinely handles. In the 64-bit ARM architecture (AArch64), a **half-word** is 16 bits, a **word** is 32 bits, and a **double-word** is 64 bits,. In contrast, in the x86 architecture, a word is 16 bits and a double-word is 32 bits, a holdover from the 16-bit 8086 processor era. 

When working with groups of bits, we must establish a numbering convention. The rightmost bit is known as bit 0, or the **Least Significant Bit (LSB)**, because it carries the smallest mathematical weight ($2^0$). The leftmost bit is the **Most Significant Bit (MSB)**, carrying the greatest weight.

## 2.3 Integer Representation
Software engineers must acutely understand how the hardware interprets combinations of bits to represent mathematical integers, both positive and negative.

### 2.3.1 Unsigned Integers
If a data structure uses all available bits to represent a positive magnitude, it is an **unsigned integer**. An $N$-bit unsigned number represents one of $2^N$ possibilities, spanning the strictly positive range from $0$ to $2^N - 1$. For a 32-bit word, this provides a range from $0$ to $4,294,967,295$. While straightforward, unsigned integers cannot represent negative values, which are essential for many physical-world calculations, such as temperatures dropping below zero or reverse motor actuation.

### 2.3.2 Signed Integers: The Quest for Negativity
To represent negative numbers, the most intuitive human approach is to use a minus sign followed by a magnitude. Early computer architects attempted to mimic this with **Sign and Magnitude** representation, reserving the MSB as a sign bit (0 for positive, 1 for negative) and using the remaining $N-1$ bits for the absolute value,. While easy for humans to read, this system suffers from severe hardware drawbacks. First, it requires different, highly complex ALU logic to perform addition depending on the signs of the operands. Second, it creates two distinct representations for zero (a positive zero and a negative zero), which forces software to make double checks whenever testing for equality with zero.

An alternative historical approach was **Ones' Complement**, where a negative number is formed by simply inverting every bit of its positive counterpart (changing 0s to 1s, and 1s to 0s). This made negation extremely fast but still suffered from the "two zeros" problem ($00000000$ and $11111111$ both representing zero in an 8-bit system),.

### 2.3.3 Two's Complement Notation
Modern computer systems universally solve these problems using **Two's Complement** representation,. Two's complement overcomes the shortcomings of earlier systems: zero has exactly one binary representation, and ordinary binary addition hardware works seamlessly for both positive and negative numbers without requiring separate subtraction circuits.

In a two's complement system, the MSB still acts as a sign bit (0 for positive, 1 for negative). However, the mathematical weight of the MSB is negative. For an $N$-bit number, the MSB has a weight of $-2^{N-1}$ instead of $2^{N-1}$. 

To convert a positive binary number to its negative two's complement equivalent, you apply a two-step algorithm:
1.  **Invert all the bits** (apply a logical NOT operation).
2.  **Add 1** to the result, ignoring any carry out of the MSB.

For example, to find the 8-bit two's complement representation of $-5_{10}$:
*   Start with positive 5: `0000_0101`
*   Invert all bits: `1111_1010`
*   Add 1: `1111_1011`.

If you add $+5$ (`0000_0101`) and $-5$ (`1111_1011`) together in hardware, the binary sum is `1_0000_0000`. Because the system only holds 8 bits, the ninth carry bit is discarded, leaving exactly `0000_0000`, the single, correct representation of zero.

Because there is no negative zero, an $N$-bit two's complement system represents an asymmetric range: $[-2^{N-1}$ to $2^{N-1} - 1]$,. For an 8-bit byte, this range is $-128$ to $+127$. The most negative number, $-128$ (`1000_0000`), is an anomaly often called the "weird number" because attempting to negate it via the two's complement algorithm (invert to `0111_1111`, add 1 to get `1000_0000`) simply yields $-128$ again; it has no positive counterpart in the 8-bit space,.

### 2.3.4 Sign Extension vs. Zero Extension
When moving data between variables of different widths—such as loading an 8-bit sensor reading into a 32-bit CPU register—the hardware must pad the extra 24 bits. 
If the 8-bit value is an *unsigned* integer, the hardware performs **zero extension**, simply filling the new upper bits with 0s. For instance, `0x82` becomes `0x00000082`.
However, if the 8-bit value is a *signed* two's complement integer, zero-extending a negative number would accidentally convert it into a large positive number. Instead, the hardware must perform **sign extension**, copying the original sign bit (the MSB) into all the new upper bit positions. An 8-bit `-5` (`0xFB`) sign-extended to 32 bits becomes `0xFFFFFFFB`. Both represent the mathematical value $-5$, ensuring that subsequent ALU operations remain accurate.

## 2.4 Fractional Numbers: Fixed and Floating Point
While integers are sufficient for counting, cyber-physical systems deal with continuous physical phenomena—velocity, voltage, mass—that require fractional representation. 

### 2.4.1 Fixed-Point Representation
The simplest method to represent real numbers in binary is **fixed-point notation**, where an implicit, immovable binary point separates the integer bits from the fractional bits,. For example, in an 8-bit system using 4 integer bits and 4 fractional bits (often denoted as Q4.4 format), the binary value `0110.1100` translates to:
$0 \times 2^3 + 1 \times 2^2 + 1 \times 2^1 + 0 \times 2^0 \quad . \quad 1 \times 2^{-1} + 1 \times 2^{-2} + 0 \times 2^{-3} + 0 \times 2^{-4}$
$= 4 + 2 + 0.5 + 0.25 = 6.75_{10}$.

Fixed-point arithmetic is highly efficient because it utilizes standard integer ALU adders and multipliers (requiring only a subsequent bit-shift to realign the implicit binary point). This makes it ideal for power-constrained microcontrollers without dedicated math hardware. However, fixed-point numbers suffer from a severely constrained dynamic range; you cannot represent a very large number and a very small precise fraction simultaneously.

### 2.4.2 Floating-Point Representation (IEEE 754)
To accommodate the vast dynamic ranges required in scientific computing and complex CPS control algorithms, architectures use **floating-point** representation, which operates similarly to scientific notation. A floating-point number represents a value as:
$(-1)^{\text{Sign}} \times \text{Mantissa} \times 2^{\text{Exponent}}$.

Modern processors almost universally adhere to the **IEEE 754** floating-point standard, established in 1985,. The standard defines several precision formats, most notably:
*   **Single-Precision (32-bit):** 1 sign bit, an 8-bit exponent, and a 23-bit mantissa (fraction).
*   **Double-Precision (64-bit):** 1 sign bit, an 11-bit exponent, and a 52-bit mantissa.

To maximize precision, IEEE 754 assumes the mantissa is **normalized**. In binary, a normalized scientific number always has a single `1` to the left of the binary point (e.g., $1.011 \times 2^3$). Because this leading `1` is a guarantee for all normalized numbers, the IEEE 754 standard drops it from the physical bit storage, gaining an extra bit of precision "for free." This implied bit, combined with the explicitly stored fraction, is known as the **significand**,.

The exponent is stored using an **excess (or biased) notation** rather than two's complement. For single-precision, the bias is 127. This means an actual exponent of $0$ is stored as $127$ (`0111_1111`), an exponent of $+1$ is stored as $128$, and an exponent of $-1$ is stored as $126$. This bias guarantees that the stored exponent is always a positive, unsigned binary number, which allows the CPU hardware to compare two floating-point numbers using fast, standard integer comparison logic,.

The IEEE 754 standard also defines bit patterns for vital edge cases that commonly arise in sensor data processing:
*   **Zero:** Represented by an exponent of 0 and a fractional field of 0. (The standard uniquely defines both a $+0.0$ and a $-0.0$),.
*   **Infinity:** Represented by an exponent of all 1s and a fraction of 0. This handles overflow conditions gracefully, allowing calculations like $X / 0.0$ to yield $+\infty$ rather than crashing the system,,.
*   **NaN (Not a Number):** Represented by an exponent of all 1s and a non-zero fraction. NaNs propagate through calculations to indicate mathematical impossibilities, such as $\sqrt{-1}$ or $\infty / \infty$,,.
*   **Denormalized Numbers:** If a calculation underflows (becomes too small to represent with a normalized exponent), the hardware transitions to denormalized numbers, where the exponent is forced to 0 and the implied leading bit becomes 0. This provides a "graceful underflow" that trades precision to represent incredibly tiny values near zero.

## 2.5 Character Data Representation
Cyber-physical systems must occasionally communicate with human operators via logging, network interfaces, or diagnostic terminals. This requires representing alphanumeric characters as binary numbers. 

The most ubiquitous legacy standard is **ASCII** (American Standard Code for Information Interchange), developed in 1963,. ASCII is fundamentally a 7-bit code mapped into an 8-bit byte, defining 128 unique characters,. The first 32 codes (0x00 to 0x1F) are non-printable control characters originally designed for teletype machines (e.g., Carriage Return `0x0D`, Line Feed `0x0A`),. The numeric digits '0' through '9' are mapped to `0x30` through `0x39`. Conveniently, the lowercase letters differ from their uppercase equivalents by exactly one bit (bit 5); for instance, 'A' is `0x41` (`0100_0001`) and 'a' is `0x61` (`0110_0001`), allowing software to toggle case with a simple bitwise XOR operation,.

Because 128 characters are entirely inadequate for international languages and technical symbols, modern systems primarily use **Unicode**, which assigns a unique 16-bit or 32-bit code point to virtually every character in human existence,,,. To maintain backward compatibility with legacy C code and serial terminal protocols, Unicode is most frequently transmitted using **UTF-8** encoding. UTF-8 is a variable-length encoding: standard ASCII characters consume only 1 byte, while complex symbols span 2, 3, or 4 bytes. UTF-8 is self-synchronizing, meaning that if a byte is corrupted over a noisy network line, the receiving software can easily resynchronize at the start of the next valid character.

## 2.6 Machine Organization: Architectures and Memory Maps
With our data formatted into bytes and words, we must examine how the processor architecture organizes and accesses this data. At a high level, general-purpose computer architectures fall into two primary structural families based on how they route data and instructions.

### 2.6.1 The Von Neumann Architecture
Proposed by John von Neumann in 1945, the **von Neumann architecture** utilizes a single, unified memory space that holds both the executable program instructions and the variable data the program operates upon,. The processor interfaces with this unified memory over a single set of shared buses (address, data, and control),,. 

This design is incredibly efficient from a hardware perspective, minimizing the physical pin count on the processor and simplifying memory allocation for the operating system. However, it suffers from the infamous **"von Neumann bottleneck."** Because the CPU must fetch an instruction and then subsequently read or write the data for that instruction over the same bus, it requires multiple sequential clock cycles, severely limiting peak throughput,. Furthermore, placing executable code and writable data in the same unified memory space exposes the system to severe security vulnerabilities, such as buffer overflow attacks where malicious data is injected and subsequently executed as code,.

### 2.6.2 The Harvard and Modified Harvard Architectures
To bypass the bottleneck, the **Harvard architecture** employs two completely physically isolated memory spaces: one strictly for program instructions and one strictly for data,. Each memory has its own dedicated address and data buses. This allows the CPU to fetch the next instruction simultaneously while reading or writing data for the current instruction, enabling single-cycle execution for many operations,. Strict Harvard architectures are prevalent in dedicated Digital Signal Processors (DSPs), where deterministic, high-speed mathematical throughput is prioritized over programming flexibility,.

Modern System-on-Chip (SoC) microprocessors—such as the ARM Cortex-A series—utilize a **Modified Harvard Architecture**,. At the highest level, the main DRAM is unified (von Neumann), allowing the OS flexibility in loading programs. However, inside the processor core, the memory immediately adjacent to the execution unit is split into a separate **Level 1 Instruction Cache (L1 I-cache)** and **Level 1 Data Cache (L1 D-cache)**,. This grants the CPU the immense parallel bandwidth of the Harvard architecture during typical execution, falling back to the von Neumann bus only when a cache miss forces a read from main DRAM,.

### 2.6.3 Memory Maps and Direct Addressing
From the software engineer's perspective, whether the underlying architecture is von Neumann or Harvard, the CPU presents memory as a linear array of byte-sized "drawers," each numbered sequentially from 0 to $2^N-1$, where $N$ is the width of the address bus,. This logical arrangement is known as the **memory map**.

In embedded SoC development, the memory map does not exclusively point to RAM. Using **Memory-Mapped I/O (MMIO)**, the physical addresses decode to various distinct hardware components on the silicon die,. For example, addresses `0x0000_0000` to `0x000F_FFFF` might map to non-volatile Flash memory (for boot code), addresses `0x2000_0000` to `0x2003_FFFF` might map to high-speed volatile SRAM, and addresses starting at `0x4000_0000` might map directly to the control registers of physical peripherals, such as UARTs, timers, and pulse-width modulation (PWM) motor controllers,.

## 2.7 Endianness: The Byte Ordering Battle
We now arrive at a subtle machine organization detail that routinely haunts software engineers writing network stacks and low-level drivers: **Endianness**.

As established, a 32-bit CPU operates on 32-bit words, but memory is heavily byte-addressable. This means a single 32-bit (4-byte) word spans four distinct memory addresses,. If a software engineer writes the 32-bit hexadecimal value `0x12345678` into memory starting at address `0x1000`, the hardware must decide *which* byte goes into address `0x1000`, `0x1001`, `0x1002`, and `0x1003`,.

*   **Little-Endian:** The *Least Significant Byte* (LSB, `0x78` in our example) is stored at the lowest memory address (`0x1000`). The Most Significant Byte (MSB, `0x12`) is stored at the highest address (`0x1003`),,. The x86 architecture is famously little-endian,.
*   **Big-Endian:** The *Most Significant Byte* (MSB, `0x12`) is stored at the lowest memory address (`0x1000`). The LSB (`0x78`) is stored at the highest address (`0x1003`),,. Many classic network protocols (TCP/IP) and historical IBM mainframes mandate big-endian byte ordering,,.

The terms derive from Jonathan Swift’s 1726 satire *Gulliver's Travels*, in which two warring nations violently disagree over which end of a soft-boiled egg should be cracked first,,. While internally consistent as long as a processor only talks to itself, endianness becomes a critical point of failure when transmitting multi-byte data across a network or shared memory bus to a processor of the opposite endianness. If an x86 processor (little-endian) sends a 32-bit integer over a network to a classic SPARC processor (big-endian), the SPARC will read the bytes backward, interpreting `0x12345678` as `0x78563412`,,,. 

Many modern architectures, including ARMv8 (AArch64) and RISC-V, support **bi-endianness**, allowing the operating system to configure the processor to access memory in either big- or little-endian mode dynamically, though little-endian remains the default for most consumer operating systems,.

Furthermore, endianness directly impacts **unaligned memory transfers**. An aligned transfer means a 32-bit word is read from an address evenly divisible by 4 (e.g., `0x1000`, `0x1004`). If a programmer attempts to read a 32-bit word from an unaligned address (e.g., `0x1001`), some strict RISC processors will immediately crash with a hardware fault,,. More forgiving processors (like x86) will handle the unaligned read by silently issuing two separate, sequential hardware memory reads and stitching the bytes together in the CPU, incurring a massive unseen performance penalty that varies wildly based on the endianness configuration,,.

## 2.8 VirtMCU Homework: Inspecting Memory and Data Types
In the physical world, bugs related to data types and endianness do not always crash a program immediately; they often manifest as corrupted actuator outputs or bizarre sensor readings. To bridge the gap between C code and raw hardware organization, this chapter’s homework relies on the **VirtMCU FirmwareStudio**.

You will be provided with a firmware binary compiled for the VirtMCU ARM Cortex-M target. This binary declares several global variables in C: an array of 8-bit characters, a signed 32-bit integer, and a 32-bit IEEE 754 floating-point number.
1.  **Connecting the Debugger:** You will launch the VirtMCU QEMU instance and attach the GNU Debugger (`gdb`) to the live simulation port.
2.  **Memory Inspection:** Instead of evaluating the variables by their C names, you will use `gdb`'s raw memory examination commands (e.g., `x/4xb &my_integer`) to dump the exact bytes residing at the physical memory addresses mapped by VirtMCU.
3.  **Endianness Discovery:** By comparing the known 32-bit value in your C code to the physical byte sequence dumped by `gdb`, you will empirically verify the endianness of the simulated ARM core.
4.  **Floating-Point Analysis:** You will dump the raw hexadecimal bytes of the floating-point variable, manually decode the IEEE 754 Sign, Biased Exponent, and Significand bits, and calculate the decimal equivalent to prove the hardware's internal representation matches the mathematical theory discussed in this chapter. 

Through VirtMCU, you will bypass the compiler's abstractions and witness firsthand how raw binary data is organized, stored, and retrieved in an active machine architecture.