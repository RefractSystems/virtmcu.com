Welcome to Part III of our course: The Hardware-Software Interface. We have spent the first half of this textbook exploring the digital logic that forms a processor, the microarchitecture that executes instructions, and the complex memory and interconnect hierarchies that move data across the silicon. We now reach a pivotal transition. Hardware without software is merely a space heater; to create a functional Cyber-Physical System (CPS), we must write software that commands the silicon.

Because our target audience consists of graduate students transitioning from high-level software engineering, you are likely accustomed to writing applications that run on top of a sophisticated operating system (OS) like Linux or Windows. In those environments, the OS provides a comfortable, abstracted virtual machine. If you want to read from a file or send data over a network, you invoke a system call, and the OS handles the complex, messy interactions with the physical hardware. 

However, in the world of embedded systems and CPS, you are often programming "bare-metal." There is no operating system hiding the hardware from you; your code executes directly on the processor, meaning you are responsible for everything from the moment power is applied to the chip. This chapter bridges the gap between hardware and software by exploring how a processor boots, how it handles unexpected events through the exception model, how it interacts with peripherals via interrupts, and how it isolates trusted code using privilege levels.

Here is the complete text for Chapter 7, formatted in Markdown.

***

# Chapter 7: Interrupts, Exceptions, and Bare-Metal Execution

## 7.1 Introduction: The Bare-Metal Environment
In a high-level programming environment, a software engineer rarely concerns themselves with the physical state of the machine at power-on. When a user runs a C program, the OS allocates virtual memory, sets up the execution environment, and smoothly transfers control to the `main()` function.

In bare-metal programming, however, `main()` does not execute by magic. The hardware strictly defines what happens the instant power is applied to the processor. A system must undergo a highly choreographed sequence of hardware and software initializations—collectively known as the boot process—to prepare the environment for high-level language execution. 

Furthermore, once the application is running, it must interact with the continuous-time physical world. In Chapter 6, we introduced the concept of programmed I/O, or polling, where the CPU continuously loops to check the status of a peripheral. Polling is incredibly inefficient because it wastes thousands or millions of clock cycles spinning in a tight loop, preventing the CPU from performing useful computation or dropping into low-power sleep states. To create responsive, real-time Cyber-Physical Systems, we must abandon polling in favor of asynchronous, interrupt-driven event handling, where the hardware forcibly alerts the software that an event has occurred.

## 7.2 Booting: What Happens at Power-On
When an embedded processor is first powered up, or when a hardware reset button is pressed, the physical reset signal (often an active-low signal denoted as `nRST` or `RST#`) is asserted. This forces the processor's internal state machine into a known, rigid initial state.

But where does the processor find its first instruction? It cannot rely on the main memory (DRAM) because volatile memory contains garbage data at power-on. Instead, the processor is hardwired to look at a highly specific, predefined address in a non-volatile memory region, such as an on-chip Flash memory or a Boot ROM. 

### 7.2.1 The Vector Table
Rather than placing the raw executable code directly at the boot address, modern architectures typically place a data structure known as the **Vector Table** at this location. The vector table is an array of addresses (pointers) that dictate where the processor should jump to handle specific hardware events. 

For example, in the ARM Cortex-M architecture, the vector table is located at the very beginning of memory. The hardware expects the first two entries of this table to contain the most critical information needed to boot the system:
1.  **Initial Stack Pointer (Offset 0x00):** The first 32-bit entry is not an instruction; it is the physical memory address of the top of the stack. When the CPU powers on, it immediately reads this value and loads it directly into the hardware Stack Pointer (SP) register. This is a brilliant architectural optimization, as it guarantees that a valid stack exists before the processor executes a single line of code, allowing the boot code to safely make function calls.
2.  **Reset Vector (Offset 0x04):** The second entry contains the memory address of the **Reset Handler**. The hardware automatically loads this address into the Program Counter (PC) and begins fetching instructions.

Because the vector table is typically stored in read-only, non-volatile memory, its contents are established at compile-time. In some advanced implementations, the base address of the vector table can be dynamically relocated by software later in the execution cycle by writing to a specific control register, allowing the operating system to install its own set of handlers.

### 7.2.2 The C Runtime Initialization (CRT0)
The Reset Handler is a small, specialized block of assembly code—often called the startup code or `crt0` (C runtime zero)—responsible for preparing the environment so that C/C++ code can run safely. 

Software engineers are used to writing C code containing global variables with initial values (e.g., `int x = 5;`). However, non-volatile Flash memory cannot be modified at runtime, and volatile RAM contains random garbage at power-on. To solve this, the linker organizes the compiled program into distinct segments:
*   **.text:** Contains the executable machine instructions.
*   **.data:** Contains initialized global and static variables.
*   **.bss:** Contains uninitialized global and static variables (which the C standard dictates must default to zero).

During the boot process, the startup code must physically copy the initial values for the `.data` segment from the non-volatile ROM into the volatile RAM. Next, it must loop through the entire `.bss` segment in RAM and write zeros to every memory location. Finally, the startup code configures the start and limit addresses for the heap memory (used for dynamic allocations like `malloc`), and only then does it execute a branch instruction to transfer control to the user's `main()` function.

## 7.3 The Exception Model
In the normal course of execution, the processor fetches instructions sequentially, occasionally altering the Program Counter (PC) due to software branch instructions. However, the processor must possess mechanisms to handle unplanned, asynchronous events that demand immediate attention. This mechanism is known as the **Exception Model**.

An exception is conceptually similar to an unscheduled, forced function call. Exceptions can be broadly divided into two categories based on their origin: hardware and software.

### 7.3.1 Hardware Interrupts
A hardware exception, commonly referred to as an **interrupt**, is triggered by physical events external to the CPU execution pipeline. Examples include a user pressing a key on a keyboard, a timer reaching zero, or a network interface controller receiving a packet. 

When a peripheral requires attention, it asserts a physical interrupt request (IRQ) line wired to the processor. Because these events happen independently of the software's execution flow, they are asynchronous. The processor must finish executing the current instruction, halt its normal sequence, and jump to an **Interrupt Service Routine (ISR)** to handle the device.

### 7.3.2 Software Exceptions (Traps and Faults)
Software exceptions are synchronous events generated directly by the execution of a specific instruction within the pipeline. 
*   **Faults:** Occur when the processor encounters an error condition it cannot resolve natively. Examples include attempting to execute an undefined or illegal instruction opcode, attempting to divide a number by zero, arithmetic overflow, or an MMU page fault (attempting to access virtual memory that is not currently mapped to physical RAM).
*   **Traps:** Are intentional, scheduled exceptions triggered by specific assembly instructions (such as `SVC` or `SWI` in ARM, or `SYS` / `TRAP` in other architectures). Traps are the fundamental mechanism used by user-space applications to request services from the operating system, a concept we will explore further when discussing privilege levels.

## 7.4 Handling Exceptions: The Hardware Perspective
When an exception occurs, the processor hardware must perform several immediate, automated steps before any software handler can run. 

### 7.4.1 Recording the Exception State
To handle the exception and eventually return to the interrupted program, the hardware must save the state of the machine. At a minimum, this involves saving the current Program Counter (so the CPU knows where to return) and a code indicating the reason for the exception.

Architectures handle this differently. In the MIPS architecture, for example, the processor utilizes a dedicated set of system management registers known as **Coprocessor 0**. When an exception fires, the hardware automatically copies the current PC into the **Exception Program Counter (EPC)** register and writes an identification code into the **Cause** register. The processor then forces the PC to jump to a hardcoded global exception handler address (e.g., `0x80000180`), where the OS must read the Cause register to determine what actually happened.

In contrast, the ARM architecture utilizes a vectored approach via the Nested Vectored Interrupt Controller (NVIC). Each specific type of exception or peripheral interrupt is assigned a unique index number. The hardware uses this index to directly look up the specific handler address in the Vector Table we discussed earlier, branching immediately to the correct software routine without requiring a massive, centralized `switch/case` statement to decode the cause.

### 7.4.2 Precise Interrupts and Pipeline Flushing
Handling exceptions becomes incredibly complex in modern microarchitectures featuring deep pipelines, superscalar issue, and out-of-order execution. 

If a processor is executing five instructions simultaneously in a pipeline and an external interrupt fires, the processor cannot simply stop instantly. A fundamental requirement of modern systems is the **precise interrupt**. For an interrupt to be precise, the hardware must guarantee that:
1.  All instructions appearing in the program code *before* the interrupted instruction have fully completed and retired their results to the architectural state.
2.  All instructions appearing *after* the interrupted instruction have completely discarded any partial computations, leaving no trace in the architectural state.

To achieve this in an out-of-order processor like the Intel Core i7, instructions write their intermediate results to hidden physical registers, but they only commit their results to the visible architectural registers (a process called retirement) in strict, sequential program order. If a fault or interrupt occurs, the Retirement Unit halts, preserving the precise state of the machine up to that exact instruction, and the pipeline is flushed of all subsequent speculative instructions. This ensures that when the ISR finishes, the program resumes exactly where it left off, oblivious to the fact that it was ever interrupted.

## 7.5 The Interrupt Service Routine (ISR)
Once the hardware has verified the precise state and branched to the correct address in the vector table, the software **Interrupt Service Routine (ISR)** takes over. Writing an ISR requires extreme discipline, as the routine is hijacking the CPU from an active thread. 

As outlined in fundamental operating systems theory, a robust ISR must perform the following distinct software actions:
1.  **Context Save:** The very first action the ISR must take is to save the contents of all general-purpose registers it intends to use. If the ISR modifies a register (like `X0` or `R1`) without saving it, it will corrupt the mathematical calculations of the interrupted background program. Registers are typically pushed onto the current stack. *(Note to students: While the specific ARM AArch64 assembly instructions for context switching are standard industry practice and draw on our knowledge from outside the provided foundational texts, you are encouraged to independently verify the exact syntax in the ARM Architecture Reference Manual. Typically, this involves using the `STP` (Store Pair) instruction to push registers to the stack).*
2.  **Acknowledge and Clear:** The ISR must communicate with the hardware peripheral (e.g., the UART or Timer) that triggered the interrupt, reading its status registers to identify the specific sub-event, and explicitly writing a command to clear the hardware interrupt flag. If the flag is not cleared, the CPU will immediately re-trigger the interrupt the moment the ISR returns, resulting in an infinite loop.
3.  **Process the Data:** The ISR executes its specific logic—such as copying a received byte from a UART data register into an in-memory ring buffer, or decrementing a counter.
4.  **Context Restore:** Once the work is complete, the ISR pops the saved values off the stack, restoring the general-purpose registers to their exact state prior to the interrupt.
5.  **Return:** The ISR executes a special machine instruction (often called `RTI`, `IRET`, or a specific branch return in ARM) that atomically restores the processor's status flags from the hardware exception registers and copies the Exception Program Counter back into the active Program Counter, resuming the background task.

### 7.5.1 Interrupt Priorities and Nesting
In a complex system, multiple peripherals may attempt to interrupt the CPU simultaneously. Furthermore, a high-priority event (like an emergency motor shutoff) might occur while the CPU is already in the middle of executing a low-priority ISR (like a keyboard press). 

If an ISR disables all other interrupts during its execution to prevent race conditions, the system becomes completely sequential, risking the loss of time-critical data if the first ISR takes too long. To resolve this, modern architectures assign strict mathematical priorities to different interrupts. 

When an interrupt fires, the CPU elevates its current execution priority. If a new interrupt arrives with a *lower* priority, it is held in a pending state until the current ISR finishes. However, if an interrupt arrives with a *higher* priority, the CPU immediately preempts the active ISR, pushes its state to the stack, and services the more critical event—a concept known as **Nested Interrupts**. The ARM Nested Vectored Interrupt Controller (NVIC) handles these complex priority evaluations entirely in hardware, significantly reducing software latency.

## 7.6 Privilege Levels and Protection
Interrupts and exceptions are not only used for handling hardware events; they form the absolute foundation of system security and operating system architecture.

Modern processors implement multiple hardware privilege levels, or execution modes. The Intel Core i7, for instance, supports four privilege rings (Ring 0 to Ring 3), though typical operating systems like Linux and Windows only utilize two: Ring 0 (Kernel Mode) and Ring 3 (User Mode).

When the processor is in User Mode, the hardware Memory Management Unit (MMU) strictly restricts what the software can do. User Mode code is absolutely prohibited from executing privileged machine instructions (like disabling hardware interrupts) or accessing memory-mapped I/O peripheral registers. If a User Mode application attempts to directly modify a hardware timer, the MMU intervenes, throwing a synchronous fault exception that terminates the offending program.

But if a user program cannot access hardware, how does it ever print to the screen or save a file? It must ask the highly trusted Operating System to do the work on its behalf.

### 7.6.1 The System Call
Because User Mode code cannot simply execute a `CALL` instruction to branch directly into the Kernel's memory space (which is protected by the MMU), it must use a controlled hardware gateway. 

To request a service, the user program loads a specific service number into a general-purpose register and executes a software trap instruction (e.g., `SYS` or `SVC`). This instruction intentionally causes a hardware exception. The processor instantly elevates its privilege level to Kernel Mode and forces the PC to jump to a highly secured, predetermined vector address containing the OS System Call Handler. 

The OS examines the requested service number, securely validates any passed pointers, performs the privileged hardware I/O operation, and then executes a return-from-exception instruction to demote the processor back to User Mode and resume the application. This strict separation ensures that buggy or malicious user software cannot crash or compromise the underlying Cyber-Physical System.

## 7.7 Context Switching and Parallel Processing
By combining hardware timer interrupts with the privilege and exception model, operating systems can create the illusion of true parallel processing on a single CPU core. 

If multiple programs (processes or threads) reside in memory, an RTOS (Real-Time Operating System) configures a hardware timer peripheral to generate a high-priority interrupt at a fixed interval (e.g., every 1 millisecond). 
1.  The CPU is running Task A. 
2.  The timer fires, preempting Task A and forcing a jump to the OS Scheduler ISR.
3.  The OS saves the exact register state of Task A onto Task A's private stack.
4.  The OS changes the CPU's hardware Stack Pointer to point to Task B's private stack.
5.  The OS pops Task B's previously saved registers off Task B's stack.
6.  The OS executes the return-from-exception instruction, which restores Task B's Program Counter.
7.  The CPU resumes executing Task B.

This incredibly rapid process is known as a **Context Switch**. Because it relies entirely on the precise interrupt mechanism preserving and restoring architectural state, neither Task A nor Task B is aware that it was paused and swapped out of the execution pipeline.

## 7.8 VirtMCU Homework: Building a Deterministic Interrupt Handler
In a standard embedded systems curriculum, writing bare-metal interrupt handlers introduces massive frustration. If a student configures a timer interrupt in a standard software emulator (like a vanilla QEMU instance), the emulator relies on the host operating system's wall-clock to trigger the event. Because the host OS (Linux/Windows) introduces unpredictable scheduling delays, context switches, and network latencies, the simulated timer interrupt suffers from immense **wall-clock jitter**,. 

This jitter makes it impossible to reliably debug precise hardware timing dependencies, a fatal flaw when designing Cyber-Physical Systems where missing a control deadline by microseconds can crash a drone.

To solve this, your homework relies on the **VirtMCU FirmwareStudio**. VirtMCU completely abandons the host OS wall-clock. Instead, it utilizes a dynamic QOM plugin architecture to enforce the **Big QEMU Lock (BQL)** constraints and implements strict cooperative time slaving. 

1.  **Architecture Review:** You will begin by reviewing the VirtMCU design rationale in `docs/architecture/01-system-overview.md` to understand how the five implementation pillars guarantee cycle-accurate deterministic execution regardless of host computer speed.
2.  **Writing the Handler:** You will be provided with a bare-metal C framework containing an uninitialized vector table. You must write an assembly language Interrupt Service Routine (ISR) that adheres to the strict context save/restore requirements discussed in Section 7.5.
3.  **Peripheral Interfacing:** Using the `hw/rust/common/rust-dummy/` module as a template, you will instantiate a simulated push-button peripheral that triggers an IRQ line mapped to the NVIC.
4.  **Execution:** You will compile your binary and run it within VirtMCU in `slaved-icount` mode. Because VirtMCU strictly lock-steps the virtual clock to the exact number of retired instructions (bypassing host OS jitter), you will use the `gdb` debugger to step through your ISR cycle-by-cycle. You will empirically verify that your interrupt fires at the exact same deterministic virtual nanosecond across multiple simulation runs, proving the stability necessary for rigorous CPS 2.0 design.