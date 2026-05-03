# Glossary of Terms and Abbreviations

*   **ABI (Application Binary Interface):** The low-level standard that dictates how software interacts with the hardware, including register usage conventions (volatile vs. nonvolatile) and parameter passing during function calls.
*   **ADC (Analog-to-Digital Converter):** A hardware component that converts continuous physical voltages into discrete digital numbers, limited by sampling rate and quantization resolution.
*   **AMBA (Advanced Microcontroller Bus Architecture):** A family of open-standard, on-chip interconnect specifications (including APB, AHB, and AXI) developed by ARM for routing data blocks within a System-on-Chip.
*   **AXI (Advanced eXtensible Interface):** A high-performance AMBA interconnect protocol that utilizes five independent, unidirectional channels to allow full-duplex, out-of-order memory transactions.
*   **CPI (Cycles Per Instruction):** A fundamental performance metric representing the average number of clock cycles required to execute a machine instruction.
*   **CPS (Cyber-Physical System):** An engineered system built from, and dependent upon, the seamless integration of computational algorithms and physical components.
*   **DMA (Direct Memory Access):** A hardware controller that autonomously transfers blocks of data between peripherals and main memory, bypassing the CPU execution pipeline to save clock cycles.
*   **DSA (Domain-Specific Architecture):** Custom silicon tailored to accelerate a specific class of applications (e.g., neural networks), trading general-purpose flexibility for massive efficiency gains.
*   **ISA (Instruction Set Architecture):** The boundary between hardware and software; the complete set of instructions, registers, and memory models understood by a specific microprocessor.
*   **MMIO (Memory-Mapped I/O):** A system design technique where peripheral control and data registers are mapped into the CPU's standard physical memory address space, allowing hardware to be controlled via standard load/store instructions.
*   **NVIC (Nested Vectored Interrupt Controller):** A hardware component in ARM architectures that prioritizes and manages incoming physical interrupts, automatically forcing the PC to the correct Interrupt Service Routine.
*   **PWM (Pulse Width Modulation):** A technique for simulating an analog voltage output by rapidly switching a digital signal HIGH and LOW. The effective output is proportional to the duty cycle.
*   **RTOS (Real-Time Operating System):** An operating system designed to guarantee strict deterministic timing and meet hard deadlines, rather than optimizing for average throughput.
*   **TLB (Translation Lookaside Buffer):** An ultra-fast hardware cache located inside the Memory Management Unit (MMU) that stores recent virtual-to-physical page table translations.
*   **TLM (Transaction Level Modeling):** A high-level simulation technique (often used in SystemC) that abstracts away individual clock cycles and pins, modeling bus communication via object-oriented method calls to dramatically speed up simulation.