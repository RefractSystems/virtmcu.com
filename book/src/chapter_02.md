# Chapter 2: Data Representation and Machine Organization

## 2.1 Introduction: The Language of the Machine
In digital electronics, a circuit is a network that processes discrete-valued variables. While at the lowest level of physics these variables represent continuous electrical voltages, computer architects abstract these continuous signals into just two discrete binary states: 0 and 1. By disciplining ourselves to use only these two states, we can combine simple components into highly reliable and sophisticated systems,. 

Before we can architect a processor capable of executing complex instructions, we must first establish how data is represented mathematically using these binary digits (bits), and how physical transistors are arranged to perform logical computations on those bits. This chapter explores the fundamentals of number systems, combinational logic, and sequential logic, serving as the bridge between raw electricity and organized computation.

## 2.2 Data Representation: Number Systems
Because digital systems consist entirely of 1s and 0s, understanding binary arithmetic is essential. In the binary (base-2) number system, each bit represents a power of 2, just as each digit in the decimal system represents a power of 10. 

Because reading and writing long strings of binary digits is tedious and error-prone, assembly language programmers heavily utilize the **hexadecimal (base-16)** number system. Hexadecimal simplifies binary representation by grouping every four bits (a nibble) into a single alphanumeric character from 0 to 9 and A to F. By padding a binary number with leading zeros to make its length a multiple of four, one can effortlessly translate long bit strings into compact hexadecimal equivalents.

### 2.2.1 Signed vs. Unsigned Integers
The interpretation of a binary sequence depends entirely on the hardware acting upon it. For signed integers, modern computers universally employ the **two's complement** representation. 

To find the two's complement (the negative) of a binary number, one simply inverts all the bits and adds 1. This representation has a compelling architectural advantage: **addition works properly and identically for both positive and negative numbers**. A microprocessor does not need separate hardware adders for signed and unsigned math; the exact same logic gates compute the correct sum in both cases, though the processor flag used to detect an arithmetic overflow will differ,.

## 2.3 Boolean Algebra and Logic Gates
Computers process binary signals using logic gates. The fundamental logic gates—**AND**, **OR**, **NOT**, and **XOR**—are rigorously defined by their truth tables,,. A truth table is a tabular representation of a logical expression's output as a function of all possible combinations of its inputs.

### 2.3.1 CMOS Transistor Implementation
Beneath the digital abstraction, logic gates are constructed from **Complementary Metal-Oxide-Semiconductor (CMOS)** transistors. CMOS technology utilizes two types of transistors that act as voltage-controlled switches:
*   **nMOS Transistors:** Turn ON to conduct current when a high voltage (logic 1) is applied to the gate.
*   **pMOS Transistors:** Turn ON to conduct current when a low voltage (logic 0) is applied to the gate.

By arranging these nMOS and pMOS switches into complementary pull-up and pull-down networks, engineers create robust logic gates,. Because pMOS transistors are effective at passing high voltages and nMOS transistors are effective at passing low voltages, **CMOS circuits naturally favor the implementation of inverting gates like NAND and NOR** over non-inverting gates like AND and OR,,. 

### 2.3.2 Boolean Algebra and Minimization
To manage the complexity of millions of interconnected gates, engineers use **Boolean algebra** to mathematically analyze and simplify logic circuits. Any digital logic function can be expressed in a sum-of-products canonical form, where each row of a truth table that results in a TRUE output corresponds to a specific "minterm".

To reduce the physical footprint, cost, and power consumption of a circuit, designers employ Boolean theorems to minimize these equations before translating them into physical hardware,. A particularly powerful tool is **De Morgan's Theorem**, which dictates that the complement of the product of all terms is equal to the sum of their individual complements. De Morgan's Theorem physically proves that a NAND gate is logically equivalent to an OR gate with inverted inputs.

## 2.4 Combinational Logic Circuits
A digital circuit is classified as **combinational** if its outputs depend exclusively on the current values of its inputs,. Combinational circuits are memoryless; a change in the inputs immediately flows through the logic gates to alter the outputs,.

### 2.4.1 Multiplexers and Decoders
Engineers group combinational logic into higher-level building blocks. Two of the most ubiquitous are multiplexers and decoders:
*   **Multiplexers (Mux):** Choose an output from among several possible inputs based on the binary value of a select (or control) signal. 
*   **Decoders:** Perform a translation from a binary input code to a one-hot output. An $N$-input decoder asserts exactly one of its $2^N$ output lines depending on the specific input combination. 

### 2.4.2 Arithmetic Circuits
Arithmetic circuits are the central building blocks of the processor. The simplest arithmetic block is the **half adder**, which adds two 1-bit inputs to produce a sum bit and a carry-out bit, typically constructed from an XOR gate and an AND gate,.

Because the half adder lacks an input to accept a carry from a previous column, it is insufficient for multi-bit addition. The **full adder** solves this by incorporating an incoming carry bit ($C_{in}$) into the calculation,. By chaining multiple full adders together—wiring the $C_{out}$ of one stage into the $C_{in}$ of the next—architects create a **ripple-carry adder** capable of summing multi-bit data words. 

Because electrical signals take finite time to travel through logic gates—a phenomenon known as **propagation delay**—the speed of a ripple-carry adder is limited by how long it takes for the carry signal to cascade from the least significant bit to the most significant bit,.

## 2.5 Sequential Logic: Introducing Memory
While combinational circuits are essential for computing values, a computer must be able to store those values. This requires **sequential logic**, where the outputs depend on both current and prior input values,. Sequential logic inherently possesses memory.

### 2.5.1 Latches and Flip-Flops
The fundamental building block of memory is the bistable element, a circuit with two stable states that can retain a value indefinitely. By cross-coupling two NOR gates or two NAND gates, engineers create an **SR (Set-Reset) Latch**,. Pulsing the Set input forces the output to 1, and pulsing the Reset input forces the output to 0.

By adding an enable signal and ensuring the Set and Reset inputs are always opposites, the circuit becomes a **gated D latch**, which passes the data input (D) to the output (Q) when the enable is high, but locks and holds the previous value when the enable goes low,.

To construct highly reliable synchronous systems, architects rely on **edge-triggered D flip-flops**,. Unlike a latch, which is level-sensitive, a flip-flop only samples its input and changes its output at the exact microscopic instant that the clock signal transitions (e.g., on the rising edge). This isolates the inputs from the outputs for the remainder of the clock cycle, allowing combinational logic sitting between flip-flops to safely compute the next state without causing chaotic feedback loops.

### 2.5.2 Finite State Machines (FSM)
Complex sequential circuits are formalized as **Finite State Machines (FSMs)**. An FSM consists of a set of states, a state transition function, and an output function. 
*   In a **Moore machine**, the outputs depend solely on the current state.
*   In a **Mealy machine**, the outputs depend on both the current state and the current inputs.

FSMs form the core control logic for processors, stepping the hardware through the sequential phases of instruction fetching, decoding, and execution.

## 2.6 Hardware Description Languages (HDLs)
Modern microprocessors contain billions of logic gates, rendering traditional schematic diagrams completely obsolete for large-scale design,. Instead, computer architects specify the behavioral and structural properties of digital systems using **Hardware Description Languages (HDLs)**,. 

The two globally prevalent HDLs are **SystemVerilog** and **VHDL**. These languages strongly resemble traditional programming languages like C, but they are uniquely designed to model the parallel nature of hardware. Using HDLs, engineers can simulate the timing and functionality of a circuit on a workstation before it is manufactured. Once the code is verified, logic synthesis tools automatically translate the HDL text into a highly optimized netlist of physical logic gates and flip-flops,. 

For example, in VHDL, a hardware component is cleanly partitioned: the `entity` block defines the external inputs and outputs (the interface), while the `architecture` block defines the internal combinatorial and sequential behavior of the circuit. 

With the digital logic foundations established, we now have the building blocks required to design an actual computer processor. In Chapter 3, we will assemble these multiplexers, adders, and registers to form the core execution units of an Instruction Set Architecture.