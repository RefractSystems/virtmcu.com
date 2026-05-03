# Appendix B: Where to Go Next (Annotated Bibliography)

If this book has done its job, you are walking away with a deep appreciation for the entire Cyber-Physical stack—from the bare-metal assembly up to the datacenter AI accelerators. But this is only the beginning of the journey. 

To transition from a competent embedded programmer to a true systems architect, you need to dive into the canonical literature. Below is a curated, annotated bibliography of the required graduate-level reading for the working engineer. **Consider these texts the essential foundation of your professional library.**

## 1. The Bible of Performance and Scale
**Hennessy, J. L., & Patterson, D. A. (2026). *Computer Architecture: A Quantitative Approach (7th Ed.)*. Morgan Kaufmann.**

If there is one book you buy after reading this one, make it this one. John Hennessy and David Patterson literally invented the RISC architecture. While our book touched on the transition from CPUs to DSAs and GPUs, Hennessy and Patterson provide the rigorous, mathematical foundation for *why* those transitions happened. 
**Why you need it:** It is the definitive guide to understanding instruction-level parallelism, memory hierarchies, cache coherency, and the end of Moore's Law. It includes brilliant teardowns of Warehouse-Scale Computers (WSCs), Google's TPUs, and NVIDIA GPUs. It teaches you how to measure performance not with opinions, but with quantitative empirical analysis.

## 2. Dropping Down to the Logic Gates
**Harris, D. M., & Harris, S. L. (2013). *Digital Design and Computer Architecture (2nd Ed.)*. Morgan Kaufmann.**

In Chapter 11, we used Chisel to build a custom MAC unit. If you want to deeply understand how to construct an entire processor from scratch, *Harris & Harris* is your guidebook. They strip away the magic of the CPU, showing you exactly how transistors form logic gates, how gates form multiplexers and ALUs, and how ALUs are wired up to build a pipelined microprocessor.
**Why you need it:** It provides side-by-side implementations of digital circuits in both SystemVerilog and VHDL. If you are going to design custom hardware accelerators or work with FPGAs in your CPS edge devices, this text will teach you how to write the hardware description languages that actually synthesize into silicon.

## 3. The Grand Unifying Theory of Abstraction
**Tanenbaum, A. S., & Austin, T. (2016). *Structured Computer Organization (6th Ed.)*. Pearson.**

Computer science is the art of managing complexity through abstraction. Tanenbaum and Austin break the computer down into six distinct levels: digital logic, microarchitecture, instruction set architecture (ISA), operating system machine, assembly language, and high-level language. 
**Why you need it:** It perfectly explains the concept of virtual machines and interpreters at the hardware level. If you have ever wondered exactly how a single CISC instruction on an x86 chip is secretly broken down into micro-operations and executed by a hidden RISC core underneath, Tanenbaum demystifies the entire process. It bridges the gap between the raw hardware and the operating system seamlessly.

## 4. Forging the Silicon: The Modern SoC
**Greaves, D. J. (2021). *Modern System-on-Chip Design on Arm*. Arm Education Media.**

When you move from programming a microcontroller to actually designing a System-on-Chip (SoC), the rules change. You are no longer just writing C code; you are wiring up third-party IP blocks using AMBA AXI buses and worrying about clock domains, traffic engineering, and power gating.
**Why you need it:** Greaves provides the ultimate insider’s look at how modern silicon is actually engineered, simulated, and poured. He covers Electronic System-Level (ESL) modeling, Transaction-Level Modeling (TLM) in SystemC, and the grueling "back-end" physical flow of layout, routing, and fabrication. If you want to understand how the components inside your smartphone or drone physically communicate over networks-on-chip (NoC), this is the definitive text.