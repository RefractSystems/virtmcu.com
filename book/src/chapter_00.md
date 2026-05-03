# Preface: How to Use This Book

The exponential increase in computing power and the pervasive integration of digital systems into the physical world have fundamentally transformed engineering. We are no longer simply designing isolated embedded systems; we are engineering **Cyber-Physical Systems (CPS 2.0)** that require a deep, integrated understanding of both hardware microarchitecture and continuous-time physical dynamics. 

This textbook was written to bridge the gap between traditional computer architecture and modern cyber-physical system design. It is designed to take students on a journey from the fundamental digital logic that makes up a processor, through the operating systems that schedule its tasks, and finally to the distributed networks, deterministic co-simulations, and domain-specific architectures that define the modern computing landscape.

### Target Audience and Prerequisites
This book is intended for senior undergraduate and graduate students in computer engineering, electrical engineering, and computer science. Because modern CPS design sits at the intersection of hardware and software, the text assumes readers are familiar with the basics of computer science and have completed a first programming course in C or C++. Furthermore, since we explore how hardware controls physical actuators, a basic understanding of continuous-time mathematics and introductory electronics will be highly beneficial.

### Organization of the Book
The material is systematically divided into distinct parts to manage the complexity of the subject matter:
*   **Part I: Machine Organization and Microarchitecture (Chapters 1–6)** builds the foundation. It covers digital logic, the ARM AArch64 Instruction Set Architecture (ISA), pipelined microarchitecture, the memory hierarchy, and System-on-Chip (SoC) interconnects.
*   **Part II: The Hardware-Software Interface (Chapters 7–8)** crosses the boundary into software, focusing on bare-metal execution, exceptions, interrupts, and the critical scheduling algorithms of Real-Time Operating Systems (RTOS).
*   **Part III: Cyber-Physical Systems and Co-Simulation (Chapters 9–11)** introduces the CPS 2.0 paradigm. It explores the 3Cs (Computation, Communication, and Control), the necessity of deterministic virtual time, and the Sensor/Actuator Abstraction Layers (SAL/AAL) required to couple discrete-event cyber simulators with continuous-time physics engines.
*   **Part IV: Advanced Architectures and Security (Chapters 12–14)** looks to the future, examining the open-source RISC-V architecture, cyber-physical threat intelligence and resilience, and Domain-Specific Architectures (DSAs) that accelerate AI at the edge and in the cloud.

### Using This Book in a Course
This book contains enough material for a rigorous, rapid-paced, single-semester introduction to computer architecture and CPS, or it can be expanded into a two-semester sequence to allow students more time to experiment in the lab. 

**For a Single-Semester Course (14-15 Weeks):**
*   **Weeks 1–5:** Focus heavily on **Chapters 1 through 5** to establish a strong hardware and microarchitecture foundation. 
*   **Weeks 6–8:** Transition to software with **Chapters 6 through 8**, emphasizing interrupts, memory-mapped I/O, and RTOS determinism.
*   **Weeks 9–12:** Introduce the CPS paradigm using **Chapters 9 through 11**. This is a great time to introduce mid-term laboratory projects involving co-simulation.
*   **Weeks 13–15:** Conclude with advanced topics based on instructor interest. An instructor focused on hardware design might prioritize **Chapter 12 (RISC-V)** and **Chapter 14 (DSAs)**, while an instructor focused on networks and infrastructure might focus on **Chapter 13 (Security and Resilience)**.

**For a Two-Semester Sequence:**
*   **Semester 1 (Computer Architecture):** Dedicate the entire first term to **Chapters 1 through 8**, allowing students to deeply digest the instruction set principles, pipelining, and memory hierarchies. The labs can focus on translating C code to ARM assembly, observing cache hits/misses, and writing bare-metal device drivers.
*   **Semester 2 (Cyber-Physical Systems):** Dedicate the second term to **Chapters 9 through 14**. This allows for a much deeper exploration of control algorithms, distributed optimal power flow, and modifying the RISC-V instruction set.

### Laboratory and Software Tools
The best way to learn digital design and system architecture is to do it. However, verifying hard real-time CPS constraints on standard operating systems is often frustrated by wall-clock scheduling jitter. To resolve this, this book includes companion homework assignments designed around the **VirtMCU FirmwareStudio**. 

Detailed instructions on how to use the software tools in a course are provided alongside the text. The VirtMCU framework allows students to execute ARM and RISC-V binaries in a deterministic, `slaved-icount` mode. By pairing VirtMCU with external physics engines (such as MuJoCo) via zero-copy shared memory, students can gain hands-on experience balancing an inverted pendulum or stabilizing a drone using the precise cycle-accurate timings required in the real world.