# Chapter 4: Processor Microarchitecture

## 4.1 Introduction: Architecture vs. Microarchitecture
To a software engineer, the Instruction Set Architecture (ISA) defines the entirety of the processor. The ISA specifies the registers, the memory model, and the instructions available to the programmer. However, the ISA does not dictate how those instructions are physically executed. 

The specific physical arrangement of registers, memories, Arithmetic Logic Units (ALUs), and multiplexers used to implement an ISA is known as the **microarchitecture**. A single architecture, such as ARMv8, can be implemented by many different microarchitectures. One microarchitecture might be optimized for ultra-low power consumption in a battery-operated cyber-physical system, while another might be optimized for massive throughput in a cloud server. Though they share the same ISA and run the exact same compiled C code, their internal hardware designs differ vastly.

At the microarchitecture level, a processor is fundamentally a highly complex synchronous sequential digital circuit—essentially a giant finite state machine. The processor's job is to read instructions and data, compute results, and update the architectural state on the rising edge of the system clock. 

## 4.2 The Physics of Performance
Before designing our processor, we must define how we measure its performance. The execution time of a program is determined by the following fundamental performance equation:

$$Execution Time = Instructions \times CPI \times T_c$$

1.  **Instructions:** The total number of instructions executed by the program. This is determined by the compiler and the ISA. 
2.  **CPI (Cycles Per Instruction):** The average number of clock cycles required to execute each instruction.
3.  **$T_c$ (Clock Period):** The duration of a single clock cycle (in seconds), which is the inverse of the clock frequency.

The challenge of the microarchitect is to choose a design that minimizes the overall execution time. As we will see, this is a delicate balancing act. Making the hardware simpler might decrease the Clock Period ($T_c$) but increase the CPI. Conversely, adding complex hardware to execute multiple instructions simultaneously will decrease the CPI, but the added logic delay might require a longer Clock Period. 

## 4.3 The Single-Cycle Datapath and Control Unit
The simplest way to build a processor is to design a microarchitecture that executes one entire instruction in a single clock cycle. This is known as a single-cycle processor. To build it, we separate the design into two interacting parts: the **datapath**, which contains the structural components that hold and manipulate data, and the **control unit**, which decodes the instruction and commands the datapath.

### 4.3.1 The Fetch-Decode-Execute Cycle
The execution of any instruction on a von Neumann architecture universally follows a sequence of discrete steps known as the fetch-decode-execute cycle:
1.  **Fetch:** The processor uses the Program Counter (PC) to fetch the 32-bit instruction from the instruction memory,. Simultaneously, the processor calculates the address of the next instruction (typically PC + 4).
2.  **Decode:** The processor parses the instruction bits to determine the operation type. Simultaneously, it reads the required source operands from the register file. 
3.  **Execute:** The Arithmetic Logic Unit (ALU) performs the requested operation, such as addition, subtraction, or logical AND, on the operands. For load/store instructions, the ALU adds the base register value to a sign-extended immediate offset to calculate the effective memory address.
4.  **Memory:** If the instruction is a load or a store, the processor reads from or writes to the data memory at the address computed by the ALU.
5.  **Write-back:** The result of the ALU computation or the data read from memory is written back to the destination register in the register file.

### 4.3.2 The Single-Cycle Control Unit
The datapath contains multiple interconnected hardware blocks, and multiplexers are used to route data between them. The control unit acts as the "brain," driving the select lines of these multiplexers. 

The control unit is purely combinational logic. It receives the opcode and function fields of the fetched instruction and instantly generates the necessary control signals. For example, if the instruction is a memory store (`sw`), the control unit will assert the `MemWrite` signal to enable writing to the RAM, but it will de-assert `RegWrite` because a store instruction does not update the processor's registers. If the instruction is a conditional branch (`beq`), the control unit commands the ALU to subtract the two source registers. If the ALU outputs a `Zero` flag (indicating the registers are equal), the control unit switches a multiplexer to load the PC with the computed branch target address instead of the standard PC + 4.

### 4.3.3 The Single-Cycle Timing Bottleneck
In a single-cycle microarchitecture, the architectural state (the PC, the register file, and memory) is updated strictly on the rising edge of the clock. This means that the clock period ($T_c$) must be long enough to allow electrical signals to propagate through the entire datapath.

The critical path—the longest and slowest sequence of logic—typically occurs during a memory load instruction. The signal must travel through the PC, into the instruction memory, through the register file, through the ALU to calculate the address, into the data memory to fetch the value, through a multiplexer, and finally back to the setup pins of the register file. 

Because the clock cycle must be stretched to accommodate the slowest possible instruction, all other, faster instructions (like a simple addition) are artificially delayed. In modern deep sub-micron silicon, this makes the single-cycle processor incredibly inefficient, limiting the maximum clock speed to a few tens of megahertz,.

## 4.4 Pipelining: Increasing Throughput
To overcome the bottleneck of the single-cycle design, computer architects employ **pipelining**. Pipelining divides the instruction execution process into a sequence of smaller, faster stages.

Consider the analogy of an automobile assembly line. If a team of mechanics builds one entire car from start to finish before beginning the next, the factory produces one car per day. However, if the factory is divided into stations—chassis, engine, doors, wheels, paint—multiple cars can be assembled simultaneously. A finished car rolls off the line every hour, even though any individual car still takes a full day to build. 

### 4.4.1 The Classic Five-Stage RISC Pipeline
Modern processors slice the datapath into multiple stages separated by hardware registers known as pipeline registers. The classic RISC pipeline consists of five stages,:
1.  **Fetch (IF):** Read the instruction from the L1 Instruction Cache.
2.  **Decode (ID):** Decode the instruction, resolve register addresses, and read operands from the Register File.
3.  **Execute (EX):** The ALU performs the computation or address calculation.
4.  **Memory (MEM):** Access the L1 Data Cache for load/store operations.
5.  **Write-back (WB):** Write the final result back to the Register File,.

Because the pipeline registers isolate the stages, five different instructions can be in flight simultaneously. 

### 4.4.2 Latency vs. Throughput
It is critical to understand that pipelining *does not* reduce the execution time of an individual instruction; in fact, the addition of pipeline registers introduces a slight propagation delay that actually increases the latency of a single instruction. 

However, microprocessors process billions of instructions per second, so we prioritize **throughput** over single-instruction latency. In a perfectly balanced 5-stage pipeline, the clock frequency can be increased to nearly five times that of a single-cycle processor, because the clock period is now determined only by the delay of the single slowest pipeline stage, rather than the sum of all stages. Ideally, one instruction completes and retires every single clock cycle, achieving an ideal CPI of 1.

## 4.5 Pipeline Hazards and Mitigation
In reality, the CPI of a pipelined processor is always greater than 1. This is because instructions in a program are rarely completely independent. When one instruction depends on the result of a previous instruction that is still in the pipeline, a **hazard** occurs. 

### 4.5.1 Data Hazards and Forwarding
A **data hazard** occurs when an instruction attempts to read a register that has not yet been written back to the register file by a preceding instruction. The most common data hazard is the Read-After-Write (RAW) dependency,. 

Consider this sequence:
```assembly
add x1, x2, x3   // x1 = x2 + x3
and x4, x1, x5   // x4 = x1 AND x5
```
The `add` instruction calculates the result in the EX stage, but it does not write the value into `x1` until the WB stage. The subsequent `and` instruction attempts to read `x1` during its ID stage. If we allow the pipeline to proceed normally, the `and` instruction will read the stale, outdated value of `x1` from the register file, causing catastrophic computational failure.

To resolve this, modern processors use **forwarding** (or bypassing),. The processor adds a Hazard Detection Unit that monitors the pipeline. If it detects that an instruction in the EX stage needs a value currently held in the MEM or WB pipeline registers, it activates multiplexers that intercept the data and route it directly into the ALU input, bypassing the register file entirely,. 

### 4.5.2 Load-Use Stalls (Bubbles)
Forwarding solves most data hazards, but it cannot solve all of them. Consider a **Load-Use hazard**:
```assembly
ldr x1, [x2]     // Load memory at x2 into x1
add x4, x1, x5   // x4 = x1 + x5
```
The `ldr` instruction does not actually retrieve the data from memory until the end of the MEM stage. However, the subsequent `add` instruction requires that data at the beginning of the EX stage. Because the data physically does not exist inside the processor yet, it is impossible to forward it back in time.

In this scenario, the hardware must physically **stall** the pipeline. The Hazard Detection Unit forces the `add` instruction to wait in the Decode stage for an extra clock cycle. To prevent the Execute stage from executing garbage, the control unit zeroes out the control signals, inserting a "bubble" (a hardware No-Operation) into the pipeline. Stalls degrade performance, increasing the CPI above 1,.

### 4.5.3 Control Hazards and Branch Prediction
The most severe threat to pipeline performance is the **control hazard**. When the processor fetches a conditional branch instruction (like `beq`), it does not actually know if the branch will be taken until the ALU evaluates the condition in the Execute stage. But by that time, the processor has already fetched two subsequent instructions into the pipeline. 

If the pipeline simply pauses to wait for the branch to resolve, it would suffer massive delays. If it guesses the branch is not taken and fetches sequentially, it will execute the wrong code if the branch is actually taken. When this happens, the processor must **flush** the pipeline, throwing away the mistakenly fetched instructions and converting them into bubbles,. The cycles wasted fetching the wrong instructions are called the branch misprediction penalty.

To mitigate this, processors utilize complex **Branch Predictors**. A dynamic branch predictor utilizes a Branch Target Buffer (BTB) to cache the destination addresses of recent branches, alongside a state machine that tracks the history of the branch. A common design uses a 2-bit finite state machine for each branch. The FSM transitions between "Strongly Not Taken", "Weakly Not Taken", "Weakly Taken", and "Strongly Taken". This hysteresis ensures that a loop that executes 100 times will only mispredict on the very last iteration when the loop finally exits. Modern branch predictors achieve accuracy rates exceeding 90%.

## 4.6 Advanced Microarchitecture: Superscalar and Out-of-Order Execution
The 5-stage pipeline represents a scalar processor, meaning it issues exactly one instruction per clock cycle. The absolute maximum throughput of a scalar processor is an IPC (Instructions Per Cycle) of 1. To achieve greater performance, engineers exploit **Instruction-Level Parallelism (ILP)**, executing entirely independent instructions simultaneously,.

### 4.6.1 Superscalar Issue
A **superscalar** microarchitecture duplicates the internal datapath hardware to fetch, decode, and issue multiple instructions in a single clock cycle,. A modern high-performance processor (such as the ARM Cortex-A series or Intel Core architectures) might fetch up to four or six instructions per cycle. 

To support this, the execution unit is populated with multiple ALUs, Floating-Point Units (FPUs), and load/store units,. Superscalar processors boast an ideal IPC greater than 1 (or a CPI of a fraction of a cycle),. 

### 4.6.2 Out-of-Order (OoO) Execution
In a strictly in-order pipeline, if an instruction stalls due to a cache miss, every single instruction behind it in the program is blocked, even if those subsequent instructions have their operands ready and are completely independent,.

**Out-of-Order (OoO)** execution allows the processor to look ahead across a vast "instruction window". When a micro-operation is decoded, it is dispatched to a queue known as a Reservation Station. The scheduler monitors the reservation stations and dispatches instructions to the ALUs the exact moment their data operands are ready, regardless of their original sequence in the compiled program code,. 

Because instructions finish in a chaotic order, the processor utilizes a **Reorder Buffer (ROB)**. Instructions are retired from the ROB strictly in their original program order. This ensures that if a hardware exception or interrupt occurs, the architectural state of the machine remains perfectly precise and easily recoverable,,.

### 4.6.3 Register Renaming
Out-of-order execution introduces new hazards known as Write-After-Write (WAW) and Write-After-Read (WAR) dependencies. These are "false" dependencies caused by the compiler reusing a limited number of architectural registers (like `x0` through `x30` in ARM). 

To eliminate these false dependencies, OoO processors implement **Register Renaming**. The processor contains a massive pool of hidden, internal physical registers. When an instruction decodes, a hardware mapping table dynamically assigns the architectural destination register (e.g., `x1`) to an unused physical register. This allows multiple instructions to write to `x1` simultaneously in the pipeline without corrupting each other's data, allowing true ILP to flourish,.

## 4.7 Multithreading and Multi-core Architectures
There is a hard physical limit to how much ILP exists in a single program thread. Even with massively wide superscalar execution and deep OoO windows, processors eventually run out of independent instructions to schedule, leaving expensive functional units completely idle,. 

### 4.7.1 Hardware Multithreading
To keep the execution units saturated, microarchitects implemented **hardware multithreading**, allowing a single physical processor core to present the illusion of multiple logical processors to the operating system. The processor duplicates the Program Counter (PC) and the Register File for each thread, but shares the heavy execution hardware (the ALUs and memory buses),.

*   **Coarse-grained Multithreading:** The processor runs one thread until it suffers a major stall (like an L2 cache miss), at which point it instantly switches context to a second thread to hide the memory latency,.
*   **Fine-grained Multithreading:** The processor switches between threads every single clock cycle in a round-robin fashion, inherently masking data and control hazards.
*   **Simultaneous Multithreading (SMT):** Found in almost all modern high-performance cores, SMT allows the superscalar scheduler to issue instructions from multiple independent threads into the execution units during the *exact same clock cycle*,.

As thermal dissipation limits (the "power wall") prevented further increases in single-core clock frequencies, the industry transitioned to **multi-core** architectures, placing multiple independent CPU cores onto a single silicon die. Modern SoCs utilize a combination of multicore chips, superscalar pipelines, and SMT to achieve vast computational throughput.

## 4.8 VirtMCU Homework: Analyzing Pipeline Stalls and Deterministic Execution
The advanced microarchitectural optimizations we just discussed—deep pipelining, out-of-order execution, branch prediction, and multi-level caching—are brilliant for increasing average throughput. However, for Cyber-Physical Systems (CPS), these features create a nightmare scenario: **timing unpredictability**. 

When controlling an aircraft actuator or a robotic joint, missing a control loop deadline by a few microseconds can cause catastrophic physical failure. In a standard OS running on a modern OoO core, it is virtually impossible to guarantee exact microsecond execution bounds due to the dynamic nature of branch mispredictions and cache misses.

In this homework, you will use the **VirtMCU FirmwareStudio** to analyze instruction latency at the bare-metal microarchitectural level.

1.  **Code Profiling:** You will be provided with two versions of a C array-processing loop. The first is an unoptimized sequence containing severe Read-After-Write (RAW) Load-Use data hazards. The second version utilizes loop unrolling and instruction scheduling to place independent math instructions between the `ldr` and data consumption, eliminating the pipeline stall.
2.  **Simulation under Jitter:** First, compile the unoptimized binary and run it in a standard, free-running QEMU emulator. Observe how the host operating system's scheduler creates wall-clock jitter, making it difficult to measure the exact nanosecond penalty of the data hazards.
3.  **Deterministic `slaved-icount` Execution:** You will then load the binaries into VirtMCU configured in `slaved-icount` mode. Because VirtMCU strictly lock-steps the virtual clock to the exact number of retired instructions (bypassing host OS jitter), you will use the emulated hardware timer registers to measure the exact cycle count of the execution loops.
4.  **Pipeline Analysis:** Calculate the empirical CPI of both the unoptimized and optimized assembly loops. You must submit a report identifying the exact assembly instructions where the processor was forced to insert a pipeline bubble due to a Load-Use data hazard, verifying your analysis against the cycle counts retrieved from the VirtMCU deterministic timer.