# Chapter 12: The RISC-V Architecture and Instruction Set

## 12.1 Introduction: The Need for Open Architectures in CPS
In the preceding chapters, we explored how standard microprocessors interact with the physical world. Through the Sensor/Actuator Abstraction Layer (SAL/AAL) discussed in Chapter 11, we demonstrated how continuous-time physical phenomena are translated into discrete-time memory-mapped I/O (MMIO) registers. However, when developing advanced Cyber-Physical Systems (CPS)—such as high-frequency drone flight controllers or ultra-low-latency robotic actuators—the processing overhead of reading MMIO registers, shifting bits, and executing standard arithmetic can become a bottleneck. 

To achieve maximum performance, computer architects often need to modify the processor itself, adding custom hardware accelerators and new machine instructions tailored specifically for the physical application. Historically, this has been nearly impossible for academic researchers and independent engineers because architectures like ARM and x86 are strictly proprietary. 

This paradigm shifted dramatically with the introduction of **RISC-V**. RISC-V is an entirely open-source specification for a reduced instruction set computer architecture. Because it is open and royalty-free, hardware designers are explicitly encouraged to modify the silicon and extend the instruction set to meet the unique requirements of their specific domain. In this chapter, we will examine the RISC-V architecture, explore its elegant instruction set, and discuss how its open nature enables the creation of custom silicon for Cyber-Physical Systems.

## 12.2 The Origins and Philosophy of RISC-V
The RISC-V architecture was publicly announced in 2011 after being developed at the University of California, Berkeley, by a team including Yunsup Lee, Krste Asanović, David A. Patterson, and Andrew Waterman. The "V" represents the Roman numeral five, signifying that this was the fifth major RISC architectural design project undertaken at UC Berkeley. 

Unlike many commercial architectures that are burdened by decades of legacy compatibility requirements, the RISC-V project began as a clean sheet design. The architects established several principal goals to ensure the ISA could scale across the entire spectrum of computing:
*   **Broad Scalability:** The architecture must efficiently support everything from ultra-low-power microcontrollers operating at the IoT edge to extreme-scale computing nodes in warehouse-scale cloud server farms.
*   **Modularity and Extensions:** The base instruction set is deliberately minimal. Advanced capabilities are provided via optional ISA extensions, which support features like floating-point mathematics, atomic memory operations, and hardware multiplication and division.
*   **Privilege Levels:** Additional extensions support privileged execution modes (similar to the x86 and ARM models discussed in earlier chapters) necessary to run secure operating systems. 
*   **Code Density:** To accommodate memory-constrained embedded systems, RISC-V supports a compressed instruction set extension. This allows 16-bit versions of common 32-bit instructions to be freely interspersed with standard 32-bit instructions in memory, significantly reducing the overall code footprint.
*   **Address Space Expansion:** The architecture provides optional extensions to support 64-bit, and even 128-bit, processor word sizes and paged virtual memory for massive multiprocessing configurations. 

Additionally, like modern ARM processors, the RISC-V architecture supports **bi-endianness**. This allows the operating system to select between big-endian or little-endian mode under software control, though most modern operating systems choose little-endian mode by default.

## 12.3 The RISC-V Programmer's Model
To program a RISC-V processor, a software engineer must understand its architectural state. At the core of the RISC-V base ISA is a remarkably orthogonal and simple register set. 

The base architecture provides 32 general-purpose registers, named `x0` through `x31`. In the standard 32-bit architecture (RV32), each of these registers is exactly 32 bits wide. Registers `x1` through `x31` are completely unrestricted and have no special functions forced upon them by the processor hardware. 

However, the `x0` register is unique: it is hardwired to the constant value zero. Any attempt to read `x0` will always return zero, and any value written to `x0` is immediately discarded by the hardware. As we will see in the next section, this hardwired zero register allows the instruction set to be drastically simplified.

### 12.3.1 The Application Binary Interface (ABI)
Although the processor hardware treats registers `x1` through `x31` as functionally interchangeable, building complex software requires strict agreements on how registers are used across different functions and libraries. Software compatibility requires that we specify which register serves as the stack pointer, which registers contain function arguments, and which contain return values. 

These standard rules form the **Application Binary Interface (ABI)**. By standardizing register usage and calling conventions, the ABI ensures that compiled C code can successfully link with handwritten assembly routines on any compatible implementation. To aid programmers, RISC-V assemblers recognize alternate ABI names for the registers. The primary ABI designations are:
*   **`ra` (`x1`):** The Return Address register, used to hold the address to jump back to after a function call completes.
*   **`sp` (`x2`):** The Stack Pointer, pointing to the top of the current activation record in memory.
*   **`a0–a7` (`x10–x17`):** The Argument registers, used to pass parameters into functions and to return results back to the caller.
*   **`t0–t6`:** Temporary registers, which are volatile (caller-saved).
*   **`s0–s11`:** Saved registers, which are non-volatile (callee-saved).

## 12.4 The Instruction Set and Pseudo-Instructions
The philosophy of RISC-V is to keep the hardware as simple as possible. Consequently, the base ISA lacks many distinct instructions found in other architectures (such as explicit `MOV` or `NOT` operations). Instead of forcing the hardware to decode dozens of unique opcodes, the architecture relies on the assembler program to synthesize missing operations using combinations of the base instructions and the hardwired `x0` register. 

These synthesized aliases are known as **pseudo-instructions**. When the programmer types a pseudo-instruction, the assembler automatically translates it into the corresponding base RISC-V machine instruction. Table 12.1 outlines some of the most common pseudo-instructions:
*   **`nop` (No Operation):** Translated to `addi x0, x0, 0`. It adds zero to zero and discards the result in `x0`, consuming a clock cycle without altering the machine state.
*   **`mv rd, rs` (Move):** Translated to `addi rd, rs, 0`. It copies the value of the source register `rs` into the destination `rd` by adding zero to it.
*   **`not rd, rs` (Bitwise NOT):** Translated to `xori rd, rs, -1`. Exclusive-ORing a value with all 1s (-1) perfectly inverts all the bits.
*   **`neg rd, rs` (Negate):** Translated to `sub rd, x0, rs`. It mathematically negates `rs` by subtracting it from the `x0` register (zero).
*   **`j offset` (Unconditional Jump):** Translated to `jal x0, offset`. It jumps to the offset but discards the return address into `x0`.
*   **`beqz rs, offset` (Branch if Equal to Zero):** Translated to `beq rs, x0, offset`. 

By pushing these translations into the software assembler, the silicon required to decode instructions in the CPU is significantly reduced, lowering power consumption and increasing maximum clock frequencies.

### 12.4.1 Immediate Values and the Sign-Extension Quirk
Loading 32-bit constants or absolute 32-bit memory addresses into a register poses a challenge because RISC-V instructions are only 32 bits wide themselves. There is no physical room to pack a 32-bit opcode alongside a 32-bit constant. 

To solve this, RISC-V breaks the operation into two steps using a 20-bit upper immediate and a 12-bit lower immediate. The `lui` (Load Upper Immediate) instruction loads a 20-bit value into the highest 20 bits of a register, clearing the lower 12 bits. The `auipc` (Add Upper Immediate to PC) performs a similar task but adds the 20-bit value to the Program Counter, enabling position-independent code. The programmer then uses a subsequent instruction—like `addi` or a load/store offset—to supply the remaining lower 12 bits.

However, this two-step process introduces a subtle but critical mathematical quirk. In RISC-V, the 12-bit immediate value in the `addi` instruction is always treated as a signed two's-complement number. Before the processor adds this 12-bit value to the upper 20 bits, the hardware automatically sign-extends the most significant bit of the 12-bit value (bit 11) all the way through bit 31. 

If bit 11 happens to be a `1`, the 12-bit value is treated as a negative number, effectively *subtracting* from the upper 20 bits. For example, suppose a programmer wants to load the 32-bit value `0xFFFFFFFF` into the `x1` register. If they naively write:
```assembly
lui x1, 0xFFFFF   # x1 now equals 0xFFFFF000
addi x1, x1, 0xFFF
```
The `addi` instruction will take `0xFFF`, interpret it as a signed number, sign-extend it to `0xFFFFFFFF` (which is -1), and add it to `0xFFFFF000`. The resulting sum placed in `x1` will be `0xFFFFEFFF`, which is totally incorrect.

To prevent this, the assembler must perform mathematical compensation when evaluating the `la` (Load Address), `lw` (Load Word), and `sw` (Store Word) pseudo-instructions. If bit 11 of the lower 12-bit payload is a `1`, the assembler must pre-emptively add `1` to the upper 20-bit value before generating the `lui` or `auipc` instruction. This slight increment in the upper bits perfectly cancels out the subsequent negative sign-extension of the lower bits, resulting in the correct 32-bit address. 

## 12.5 Hardware Implementations and Custom Extensions
What makes RISC-V uniquely suited for modern Cyber-Physical Systems is its explicit support for user-defined enhancements. A team designing a robotic actuator does not have to settle for the standard instruction set; they can augment the processor with custom opcodes, hardware coprocessors, and other modifications as long as they comply with the RISC-V customization rules.

Because all the source code and processor design intellectual property required to implement a RISC-V core is freely available on the internet, developers can synthesize their own custom processors without paying licensing fees. By using an open-source RISC-V design as a starting point, engineers can implement custom modifications that are guaranteed to remain compatible with future versions of the RISC-V standard.

For example, the PicoRV32 is a popular open-source RISC-V core that can be easily synthesized and programmed into low-cost Field Programmable Gate Arrays (FPGAs). A budget-friendly FPGA board like the Digilent Cmod A7-35T utilizes a Xilinx Artix-7 chip (XC7A35T). This specific FPGA provides 5,200 logic slices, 41,600 flip-flops, 1,800 kbits of block RAM, and 90 specialized Digital Signal Processing (DSP) slices that natively support high-performance Multiply-Accumulate (MAC) operations. 

An engineer can map the PicoRV32 open-source model onto this FPGA using the Vivado synthesis toolchain. Once the baseline RV32IMC core is instantiated, the engineer can write Verilog code to bind the FPGA's physical DSP slices directly to custom RISC-V opcodes. This creates a deeply integrated, hardware-accelerated processor capable of executing complex PID control loops or AI inference models in a fraction of the time required by standard software execution.

## 12.6 VirtMCU Homework: Custom ISA Extensions for Deterministic Control
In previous chapters, you wrote control algorithms assuming a standard, immutable CPU architecture. However, in the CPS 2.0 paradigm, hardware and software must be co-designed. If a software control loop cannot meet its hard real-time deadlines, you now have the power to alter the hardware to solve the problem.

For this chapter's homework, you will step beyond standard software engineering and venture into computer architecture by modifying the ISA within the **VirtMCU FirmwareStudio**.

1.  **Baseline Profiling:** You will be provided with a standard C program that reads three orthogonal sensor registers (X, Y, and Z axes) via MMIO, computes their vector magnitude ($\sqrt{X^2 + Y^2 + Z^2}$), and writes the result to an actuator register. Compile this for the standard RISC-V RV32I base architecture. Run it in VirtMCU's deterministic `slaved-icount` mode and record the exact number of clock cycles required to execute the math loop.
2.  **Architectural Modification:** You will dive into the VirtMCU QEMU backend source code. You will define a custom RISC-V instruction, `VMAG rd, rs1, rs2, rs3`, that utilizes an unused opcode space. You will write the emulation logic in C to calculate the vector magnitude in a single simulated clock cycle.
3.  **Inline Assembly Implementation:** Modify your original C firmware to bypass the standard math libraries. Use GCC's inline assembly feature to invoke your new `VMAG` machine instruction directly.
4.  **Co-Simulation Validation:** Re-run the modified firmware in VirtMCU `slaved-icount` mode. Compare the new cycle count against your baseline profile. You must document the performance speedup achieved by pushing a specific computational bottleneck directly into the silicon architecture, empirically demonstrating the power of an open ISA in CPS design.