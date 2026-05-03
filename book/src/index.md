Welcome to the blueprint for our new graduate-level textbook and course structure. Designing this curriculum requires us to bridge a significant gap: taking graduate students who are highly proficient in software engineering and grounding them in the realities of hardware, computer architecture, and the continuous-time physical world. 

To achieve this, we will use **VirtMCU** as our core pedagogical tool, allowing students to build deterministic, multi-node digital twins without the scheduling jitter or physical hardware limitations that traditionally plague CPS education.

Below is the comprehensive structural plan for the textbook, formatted natively in `.md` (Markdown). It is designed to cover 28 lectures across 14 chapters.

***

# Book Title: Foundations of Computer Architecture and Cyber-Physical Systems 2.0: A Deterministic Approach Using VirtMCU

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

**Version:** 1.0.0 (Commit: `f14d70c`)

## Book Metadata and Author Directives
*   **Target Audience:** Graduate students with a software background transitioning into Computer Architecture and Cyber-Physical Systems (CPS).
*   **Format:** Markdown (`.md`).
*   **Length Constraints:** Total size $\ge$ 180 pages. Each of the 14 chapters will be strictly $\ge$ 8 pages and contain a minimum of 2,500 words.
*   **Course Mapping:** 14 Chapters, designed to be taught over 28 lectures (2 lectures per chapter).
*   **Pedagogical Tool:** **VirtMCU** (FirmwareStudio). The book leverages VirtMCU's deterministic QEMU-based simulation, Sensor/Actuator Abstraction Layer (SAL/AAL), and MuJoCo physics engine lock-stepping to provide hands-on homework.

---

## Part I: Hardware Foundations for Software Engineers (Lectures 1–6)
*Objective: Strip away the software abstractions and teach the students how electrons become 1s and 0s, and how 1s and 0s become instructions.*

### Chapter 1: The Digital Abstraction and Logic Design
*   **Lecture 1:** From Transistors to Logic Gates. We begin at the lowest level of abstraction: the physics of semiconductors, CMOS transistors, and logic gates (AND, OR, NOT). 
*   **Lecture 2:** Combinational and Sequential Logic. Students learn how gates are combined to create multiplexers, adders, and ALUs. We introduce sequential logic—latches, flip-flops, and clocks—explaining how circuits maintain state and memory.
*   **VirtMCU Homework:** Introduction to the VirtMCU environment. Students compile a basic C program into a bare-metal binary and observe simulated clock cycles.

### Chapter 2: Data Representation and Machine Organization
*   **Lecture 3:** Data Storage and Number Systems. Binary, hexadecimal, signed/unsigned integers, two's complement, and IEEE 754 floating-point formats. 
*   **Lecture 4:** Memory and Machine Organization. Big-endian vs. little-endian byte ordering, memory addresses, and the von Neumann vs. Harvard architectures.
*   **VirtMCU Homework:** Memory inspection. Students use `gdb` connected to the VirtMCU QEMU instance to step through memory and observe byte ordering and data representation live.

### Chapter 3: Instruction Set Architecture (ISA) and ARM AArch64
*   **Lecture 5:** The AArch64 Programmer's Model. Introduction to the 64-bit ARM architecture. We cover the 32 general-purpose registers (X0-X30, W0-W30), the program counter, and the stack pointer.
*   **Lecture 6:** Assembly Language and the Call Stack. Translating high-level C flow control (if/else, loops) into ARM assembly. We dive deep into function calls, the ARM Application Binary Interface (ABI), parameter passing, and stack frame discipline.
*   **VirtMCU Homework:** Students rewrite a simple C function in AArch64 assembly, load it into VirtMCU, and trace the register modifications and stack allocations.

---

## Part II: Modern System-on-Chip (SoC) Architecture (Lectures 7–12)
*Objective: Build a modern processor and SoC from the ground up, focusing on timing, memory bottlenecks, and interconnects.*

### Chapter 4: Processor Microarchitecture
*   **Lecture 7:** The Datapath and Control Unit. Designing a single-cycle processor. Instruction fetching, decoding, execution, and write-back phases.
*   **Lecture 8:** Pipelining and Superscalar Execution. We explore the classic five-stage RISC pipeline, data/control hazards, and branch prediction. We briefly discuss modern out-of-order execution and multi-core simultaneous multithreading.
*   **VirtMCU Homework:** Analyzing pipeline stalls. Using VirtMCU's `slaved-icount` mode (which provides exact nanosecond virtual time), students measure the execution time differences between optimized and unoptimized assembly loops.

### Chapter 5: The Memory Hierarchy
*   **Lecture 9:** Caches and Spatial/Temporal Locality. The growing gap between CPU and DRAM speeds. Direct-mapped, set-associative, and fully associative caches. Cache coherency protocols (MOESI).
*   **Lecture 10:** Virtual Memory and the MMU. Paging, page tables, the Translation Lookaside Buffer (TLB), and how the Memory Management Unit maps virtual addresses to physical addresses.
*   **VirtMCU Homework:** Memory access profiling. Students write firmware that intentionally causes cache thrashing and TLB misses, observing the latency footprint.

### Chapter 6: SoC Interconnects and Peripherals
*   **Lecture 11:** Buses and Interconnect Protocols. Advanced Microcontroller Bus Architecture (AMBA). We cover AHB-Lite, APB for low-power peripherals, and AXI for high-speed packet-switched network-on-chip routing.
*   **Lecture 12:** I/O, UART, and Direct Memory Access (DMA). Memory-mapped I/O (MMIO) versus port-mapped I/O. We cover how peripherals interact with the CPU and how DMA controllers move data without CPU intervention.
*   **VirtMCU Homework:** Students write a bare-metal UART driver. They utilize VirtMCU's deterministic multi-node UART (`hw/rust/comms/chardev`), ensuring their driver respects virtual-timestamped delivery.

---

## Part III: The Hardware-Software Interface (Lectures 13–18)
*Objective: Transition from hardware design to systems programming, teaching students how software manages hardware events.*

### Chapter 7: Interrupts, Exceptions, and Bare-Metal Execution
*   **Lecture 13:** Booting and the Exception Model. What happens at power-on. The vector table, Nested Vector Interrupt Controller (NVIC), and transitioning between privilege levels (User mode vs. Kernel/Supervisor mode).
*   **Lecture 14:** Interrupt-Driven Programming. Context switching, saving machine state, and the difference between polling and interrupt-driven I/O.
*   **VirtMCU Homework:** Building an interrupt handler. Students configure VirtMCU to simulate a hardware button press, writing an interrupt service routine (ISR) to handle the event.

### Chapter 8: Real-Time Operating Systems (RTOS)
*   **Lecture 15:** RTOS Fundamentals. Soft vs. firm vs. hard real-time systems. The importance of deterministic response times over high average throughput.
*   **Lecture 16:** Task Scheduling and Synchronization. Priority-based preemption, round-robin scheduling, semaphores, and avoiding priority inversion and deadlocks.
*   **VirtMCU Homework:** Students port a lightweight RTOS kernel onto their VirtMCU simulated board and schedule two conflicting tasks, measuring exact context-switch jitter.

### Chapter 9: Introduction to Cyber-Physical Systems (CPS 2.0)
*   **Lecture 17:** The Evolution to CPS 2.0. Transitioning from isolated embedded systems (CPS 1.0) to CPS 2.0. We cover the 3Cs: Computation, Communication, and Control, and how AI, Edge Computing, and SDN are reshaping infrastructure.
*   **Lecture 18:** Anatomy of a Cyber-Physical System. The feedback loop: sensing the physical world, processing data, and actuating changes.
*   **VirtMCU Homework:** System architecture design. Students map a physical scenario (e.g., a drone flight controller) to a CPS 2.0 architecture layout.

---

## Part IV: VirtMCU and Continuous-Time Physics (Lectures 19–24)
*Objective: Integrate software execution with physical mechanics, utilizing VirtMCU's unique capabilities to bridge the discrete-time cyber and continuous-time physical worlds.*

### Chapter 10: Co-Simulation and Virtual Time
*   **Lecture 19:** The Problem with Standard Emulators. Why standard QEMU fails for CPS. The necessity of deterministic virtual time, external clock authority, and eliminating wall-clock scheduling jitter.
*   **Lecture 20:** VirtMCU Clock Slaving. Understanding the `hw/rust/backbone/clock` module. We explore `slaved-suspend` mode for high throughput and `slaved-icount` mode for exact microsecond-precision hardware timers.
*   **VirtMCU Homework:** Students run a firmware simulation that requires strict 10ms control loops. They will compare standard QEMU (where the loop drifts due to host OS jitter) against VirtMCU's deterministic clock.

### Chapter 11: The Sensor/Actuator Abstraction Layer (SAL/AAL)
*   **Lecture 21:** Bridging MMIO and Physics. How to translate raw firmware register reads/writes into continuous physical properties (e.g., force, acceleration, angle).
*   **Lecture 22:** Physics Engine Lock-Stepping. Integrating VirtMCU with the MuJoCo physics engine via zero-copy shared memory. Simulating transfer functions and sensor noise.
*   **VirtMCU Homework:** Inverted Pendulum Simulation. Students write a firmware controller that reads simulated gyroscope registers (SAL) and writes to motor PWM registers (AAL) to balance a pendulum simulated in MuJoCo.

### Chapter 12: Distributed Control and Multi-Node Networks
*   **Lecture 23:** Deterministic Networking. The challenge of distributed control in large-scale CPS (e.g., Virtual Power Plants). Designing for latency, packet loss, and semantic communication.
*   **Lecture 24:** VirtMCU Federation Bus. Multi-node simulation using `hw/rust/comms/netdev`. Students learn how Ethernet frames are buffered and injected into the guest NIC only when virtual time reaches the stamped arrival time, avoiding UDP multicast jitter.
*   **VirtMCU Homework:** Multi-node Virtual Power Plant. Students spin up two VirtMCU instances representing Distributed Energy Resources (DERs). They communicate over the deterministic bus to balance a simulated power load.

---

## Part V: Advanced Topics in CPS Architecture (Lectures 25–28)
*Objective: Expand the students' horizons into the modern challenges of security, data processing, and hardware acceleration.*

### Chapter 13: Security and Resilience in CPS
*   **Lecture 25:** Vulnerabilities in Critical Infrastructure. The impact of cyberattacks on physical safety. Protection strategies for industrial serial networks and transitioning to software-defined networking (SDN) for resilience.
*   **Lecture 26:** Hardware Security and Firmware Updates. Implementing TrustZone, memory protection units, and secure boot. Strategies for securing Firmware Over-The-Air (FOTA) updates with cryptographic keys and safe rollback mechanisms.
*   **VirtMCU Homework:** Students implement an MPU policy in their firmware to restrict a malicious payload from accessing the actuator memory-mapped registers.

### Chapter 14: Hardware Acceleration and the Future of CPS
*   **Lecture 27:** SIMD, NEON, and DSP. Applying Single Instruction, Multiple Data (SIMD) for parallel processing of sensor arrays. Introduction to ARM NEON registers for vector mathematics and DSP filtering algorithms.
*   **Lecture 28:** GPUs, Autonomous Vehicles, and the Edge. The architecture of modern self-driving vehicle computers (e.g., Tesla HW3/HW4). Fusing LiDAR, RADAR, and vision via Convolutional Neural Networks (CNNs) processing at the edge.
*   **VirtMCU Homework:** Vectorized Sensor Processing. Students rewrite a sensor data fusion loop using ARM NEON intrinsics, verifying the execution speedup within the VirtMCU environment.

***

### Summary of Pedagogical Alignment
This book structure directly addresses your requirement to write a textbook for software-oriented graduate students. By starting with **Digital Logic (Chapter 1)**, we bridge their software knowledge to the hardware level. We subsequently move through **Architecture (Chapters 4-6)** and the **OS Machine Level (Chapters 7-8)**. Finally, the second half of the book is heavily dedicated to **CPS 2.0 (Chapters 9-14)**, relying completely on the **VirtMCU** framework to provide reproducible, zero-jitter, multi-node homework assignments that interact with continuous-time physics engines.