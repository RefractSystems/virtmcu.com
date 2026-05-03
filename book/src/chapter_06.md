# Chapter 6: SoC Interconnects and Peripherals

## 6.1 Introduction: Breaking Out of the Core
Welcome back. In our previous chapters, we constructed the processor pipeline and designed a deep memory hierarchy to keep the execution units fed with instructions and data. However, a processor that only talks to its own memory is effectively a brain in a jar; it can compute, but it cannot interact with the universe. For a Cyber-Physical System (CPS), interaction is the entire point. The system must sense physical properties, process them, and actuate mechanical responses. 

To bridge this gap, modern microprocessors are integrated with numerous communication interfaces and hardware controllers onto a single silicon die, creating a System-on-Chip (SoC). A SoC is not merely a collection of isolated parts; it is a complex, distributed network of functional blocks. These blocks, ranging from low-speed sensors to high-speed graphics accelerators, must all communicate flawlessly. 

In this chapter, we explore how data physically moves across the silicon. We will abandon the simplified abstraction of a monolithic "system bus" and dive into the mechanics of modern SoC interconnects. We will examine the Advanced Microcontroller Bus Architecture (AMBA), detailing the APB, AHB-Lite, and AXI protocols. Next, we will transition to the hardware-software interface, explaining how your C code interacts with these hardware peripherals through Memory-Mapped I/O (MMIO), interrupts, and Direct Memory Access (DMA). Finally, we will look at the Universal Asynchronous Receiver-Transmitter (UART) as a fundamental case study for external serial communication.

## 6.2 The Principles of SoC Interconnects
Historically, computer components were distributed across multiple chips on a printed circuit board and connected via shared, parallel copper wires—a traditional "bus". In a classic shared bus, multiple devices physically share the same wires. To prevent electrical short circuits (a "bus fight"), devices use tri-state logic gates to disconnect themselves from the wires when not transmitting. However, shared buses suffer from severe physical and performance limitations. Only one device can transmit at a time, meaning bandwidth is inherently limited. Furthermore, as clock frequencies increase, the capacitance and physical length of shared wires cause signal degradation and propagation delays that cap the maximum speed.

In a modern SoC, the "bus" is no longer a single set of shared wires; it is an active **interconnect fabric**. The interconnect fabric multiplexes and routes transactions between components using dedicated, unidirectional point-to-point wiring.

### 6.2.1 Initiators and Targets
Communication across an interconnect always involves two roles:
*   **Initiator (or Manager / Requester):** The device that starts a transaction by supplying an address and command. The CPU core and the DMA controller are the most common initiators.
*   **Target (or Subordinate / Completer):** The device that responds to the transaction. Memory controllers, UART peripherals, and timers are common targets.

The interconnect fabric sits between the initiators and the targets. It intercepts all transactions issued by the initiators and routes them to the appropriate target based on the address. 

### 6.2.2 Address Decoding and Routing
Every target connected to the fabric is assigned a specific range of addresses, defining the system's **memory map**. When an initiator issues a transaction, it drives the target address onto the interconnect. 

The fabric contains an internal **address decoder**. The decoder compares the high-order bits of the requested address against a routing table to determine which target the initiator is trying to reach. For example, if a SoC places a UART controller at address `0x4000_0000`, any read or write starting with `0x40` will be routed specifically to the UART's hardware port.

Once the target is identified, the interconnect fabric uses multiplexers to physically connect the initiator's data and control lines to the target's receiving lines. To avoid complex hardware subtractors in the decoding logic, SoC memory maps generally place peripherals at boundaries that are multiples of powers of two. This allows the interconnect to route traffic simply by looking at a specific prefix of the address bits, functioning much like an IP subnet mask in computer networking.

### 6.2.3 Backpressure and Flow Control
In a heterogeneous SoC, an initiator running at 1 GHz may attempt to send data to a peripheral running at 10 MHz. If the initiator sends data faster than the target can process it, data will be lost. To prevent this, interconnect protocols implement **backpressure**.

Backpressure allows a slower component to stall a faster component. This is universally handled using a "ready-valid" handshake mechanism. The initiator asserts a `VALID` signal when its data and address are stable. The target asserts a `READY` signal when it is capable of accepting the data. The transaction only completes on the exact clock edge where both `VALID` and `READY` are asserted simultaneously. If the target is busy, it deasserts `READY`, forcing the initiator to hold its data on the lines and wait, effectively stalling the initiator's pipeline. 

## 6.3 The AMBA Interconnect Protocols
To allow intellectual property (IP) blocks from different vendors (e.g., an ARM CPU, a Synopsys memory controller, and a custom accelerator) to communicate, the semiconductor industry relies on standardized interconnect protocols. The most ubiquitous standard is ARM's **Advanced Microcontroller Bus Architecture (AMBA)**. AMBA is not a single bus; it is a family of protocols designed for different performance, power, and area trade-offs. We will examine three critical AMBA protocols: APB, AHB-Lite, and AXI.

### 6.3.1 APB: The Advanced Peripheral Bus
Not all peripherals require high-bandwidth communication. Devices like timers, GPIO controllers, and UARTs have very low data throughput requirements. Providing these slow devices with complex, high-speed interconnect logic would waste precious silicon area and increase static power consumption. 

The **Advanced Peripheral Bus (APB)** is designed specifically for these low-bandwidth control interfaces. APB is a non-pipelined, state-machine-based protocol. Every transaction takes a minimum of two clock cycles to complete.

The APB protocol utilizes a strict three-state machine: `IDLE`, `SETUP`, and `ACCESS`:
1.  **IDLE:** The bus is inactive. 
2.  **SETUP:** When a transaction begins, the requester asserts a select signal (`PSEL`) for the target peripheral, along with the address (`PADDR`) and a read/write control signal (`PWRITE`). The bus remains in this state for exactly one clock cycle, giving the target peripheral time to wake up and prepare its internal logic.
3.  **ACCESS:** On the next clock edge, the requester asserts the enable signal (`PENABLE`). If it is a write, the data is driven onto `PWDATA`. The target evaluates the request. If the target needs more time, it holds its `PREADY` signal low, extending the `ACCESS` state and applying backpressure. Once the target is finished, it drives `PREADY` high (and supplies read data on `PRDATA` if applicable). The transaction completes, and the bus returns to `IDLE` or begins a new `SETUP` phase.

By guaranteeing that signals remain completely stable during the `SETUP` to `ACCESS` transition, APB eliminates unwanted circuit switching (glitches), significantly reducing dynamic power consumption.

### 6.3.2 AHB-Lite: The Advanced High-performance Bus
While APB is excellent for slow peripherals, it is far too slow for main memory or high-speed DMA transfers. For high-bandwidth components, designers use the **Advanced High-performance Bus (AHB-Lite)**. 

AHB-Lite achieves high throughput by abandoning the slow state-machine approach of APB in favor of a strictly **pipelined** architecture. In AHB-Lite, every transaction is split into two distinct phases: an **Address Phase** and a **Data Phase**.
*   **Address Phase:** Lasts exactly one clock cycle. The manager drives the address (`HADDR`), the transfer direction (`HWRITE`), and the size of the transfer (`HSIZE`).
*   **Data Phase:** Begins immediately after the Address Phase. The manager drives write data (`HWDATA`), or the subordinate provides read data (`HRDATA`). 

Because of the pipelining, the *Data Phase of the current transaction overlaps exactly with the Address Phase of the next transaction*. This means that while the memory is fetching data for address $A$, the manager is already transmitting address $A+4$ on the bus. This overlapping allows AHB-Lite to achieve 100% bus utilization during sequential reads or writes, effectively transferring one word per clock cycle.

To apply backpressure, an AHB-Lite subordinate pulls the `HREADY` signal low during the Data Phase. Because the pipeline is locked together, stalling the Data Phase of the current transaction inherently forces the Address Phase of the subsequent transaction to stall as well. 

AHB-Lite also supports **Bursts** (`HBURST`). A burst allows a manager to inform the subordinate that it plans to perform a sequence of 4, 8, or 16 consecutive transfers. This allows advanced memory controllers, like SDRAM, to optimize their internal row-buffer accesses before the subsequent addresses are even placed on the bus.

### 6.3.3 AXI: The Advanced eXtensible Interface
As processor speeds pushed into the gigahertz range and multi-core SoCs emerged, even the pipelined AHB-Lite protocol became a bottleneck. In AHB-Lite, the Address and Data phases are rigidly locked together; if a memory read stalls, the entire bus pipeline is blocked, preventing any other transactions from occurring. Furthermore, AHB-Lite uses a single set of shared control signals for both reading and writing, meaning a system cannot read and write simultaneously (half-duplex).

To solve this, ARM introduced the **Advanced eXtensible Interface (AXI)**. AXI is a radical departure from traditional bus architectures. Instead of a single monolithic bus, AXI defines **five completely independent, unidirectional channels** between a manager and a subordinate:
1.  **Read Address Channel (AR):** Carries the address and control info for a read.
2.  **Read Data Channel (R):** Carries the requested data from the subordinate back to the manager.
3.  **Write Address Channel (AW):** Carries the address and control info for a write.
4.  **Write Data Channel (W):** Carries the payload data from the manager to the subordinate.
5.  **Write Response Channel (B):** Carries a success/failure acknowledgment from the subordinate back to the manager.

Each of these five channels operates completely independently, using its own `VALID` and `READY` handshake signals. This physical decoupling yields immense performance benefits. 

First, it enables **Full-Duplex** operation; a DMA controller can write data on the W channel at the exact same time it is receiving completely unrelated read data on the R channel, doubling peak throughput. 

Second, AXI supports **Outstanding Transactions** and **Out-of-Order Completion**. A CPU can blast five different read addresses down the AR channel without waiting for the data to return. The memory controller receives all five addresses and can reorder the reads based on which physical DRAM banks are currently open. When the memory controller finds the data, it sends it back on the R channel. Because the data might return out of order, every transaction is tagged with a unique Transaction ID (`ARID` / `RID`). The CPU matches the incoming data to the original request using this ID, much like a restaurant patron matching their receipt number to an order.

Because AXI is complex, ARM also provides **AXI-Lite**, a stripped-down version that removes burst capabilities and IDs. AXI-Lite provides AXI's channel decoupling but is simple enough to interface with standard registers.

## 6.4 The Hardware-Software Interface
Having established how data traverses the silicon via interconnects like AXI and APB, we must examine how the software engineer actually commands this hardware. In high-level languages like C, we manipulate variables in memory. But how do we tell a physical UART peripheral to transmit a byte?

### 6.4.1 Memory-Mapped I/O (MMIO) vs. Port-Mapped I/O
There are two architectural paradigms for interacting with peripherals: Port-Mapped I/O and Memory-Mapped I/O.

In older architectures like the Intel x86, peripheral devices exist in a completely separate, isolated address space. To access them, the CPU provides special, dedicated assembly instructions like `IN` and `OUT`. When the CPU executes an `OUT` instruction, it asserts a specific physical pin on the processor (the `M/IO` pin) to tell the hardware, "I am talking to a peripheral, not main memory". This is known as **Port-Mapped I/O**.

The ARM architecture (and almost all modern RISC designs) abandons this approach in favor of **Memory-Mapped I/O (MMIO)**. In MMIO, there are no special I/O instructions. The peripheral's control and data registers are mapped directly into the standard, unified physical memory address space. From the CPU's perspective, a peripheral register is indistinguishable from a standard RAM location. To send data to a peripheral, the software simply executes a standard assembly `STR` (Store Register) instruction targeting the specific memory address assigned to that device. 

This allows the C programmer to interact with hardware simply by casting an integer address to a volatile pointer:
```c
#define UART_TX_REG  (*(volatile uint32_t*) 0x40001000)
UART_TX_REG = 'A'; // Hardware automatically routes this to the UART
```
The `volatile` keyword is critical here. It explicitly commands the C compiler *never* to optimize away the memory access or cache the value in a CPU register, guaranteeing that every read or write genuinely reaches the hardware. Furthermore, MMIO regions are explicitly marked as "Device Memory" in the MMU page tables, bypassing the L1/L2 caches to ensure immediate, strongly-ordered electrical delivery to the peripheral.

### 6.4.2 Programmed I/O (Polling)
The simplest method to manage a peripheral is **Programmed I/O** (often called polling). In this approach, the CPU executes a continuous loop, reading the peripheral's status register until a specific bit indicates the device is ready.

For example, to receive a byte from a UART, the CPU repeatedly reads the UART's line status register checking the `Data Ready` flag. Once the flag becomes `1`, the CPU reads the data register to retrieve the byte. 
While trivial to program, polling is highly inefficient. The CPU wastes thousands or millions of clock cycles spinning in a tight loop, unable to perform useful computation or enter low-power sleep states. In modern, multitasking operating systems, polling is strictly avoided for routine operations.

### 6.4.3 Interrupt-Driven I/O
To eliminate the massive waste of CPU cycles caused by polling, systems rely on **Interrupt-Driven I/O**. Instead of the CPU constantly asking the peripheral if it is ready, the peripheral notifies the CPU when an event occurs.

Peripherals are wired directly to the CPU's **Nested Vector Interrupt Controller (NVIC)**. When a UART receives a byte, its hardware asserts an interrupt request (IRQ) line. The NVIC detects this, immediately pauses the CPU's current execution thread, pushes the CPU state to the stack, and forces the Program Counter to jump to an **Interrupt Service Routine (ISR)**. The ISR reads the byte from the UART's data register, places it into an operating system queue, clears the hardware interrupt flag, and returns execution to the original thread. 

Interrupt-driven I/O allows the CPU to execute completely unrelated applications, or drop into deep sleep modes, waking only for a few microseconds when a physical event requires attention.

### 6.4.4 Direct Memory Access (DMA)
While interrupts solve the problem of polling, they are still too slow for massive data transfers. If a gigabit Ethernet controller receives a 1,500-byte packet, generating 1,500 individual CPU interrupts to copy the data byte-by-byte into RAM would overwhelm the processor, a problem known as "interrupt storming".

To handle bulk data, SoCs utilize a **Direct Memory Access (DMA) Controller**. A DMA controller is an independent hardware engine that sits on the interconnect (typically as an AXI Manager) capable of generating its own read and write transactions. 

When the CPU needs to transfer data, it configures the DMA controller's MMIO registers, providing a source address, a destination address, and a block size. The CPU then goes back to its normal tasks. The DMA controller autonomously arbitrates for interconnect bandwidth and transfers the data directly between the peripheral and main memory, completely bypassing the CPU execution pipeline. Because the DMA controller shares the memory interconnect, it performs **cycle stealing**, slipping its transactions onto the bus during cycles when the CPU is idle or accessing L1 cache. Once the entire multi-kilobyte block is successfully transferred, the DMA controller fires a single interrupt to notify the CPU that the memory buffer is ready for software processing.

## 6.5 Core SoC Peripherals
With an understanding of how they connect to the system, we can briefly examine the internal architecture of the most ubiquitous CPS peripherals.

### 6.5.1 General-Purpose Input/Output (GPIO)
The most fundamental interface is the **GPIO** controller. GPIOs allow software to directly manipulate the physical voltage levels on the external pins of the SoC chip. A GPIO block contains several MMIO registers:
*   **Direction Register:** Sets each pin as an input (read sensor) or output (drive actuator).
*   **Data Register:** If configured as an output, writing a 1 or 0 physically drives the pin to $V_{DD}$ or GND. If configured as an input, reading this register samples the current digital voltage on the pin.
*   **Pull-up/Pull-down Configuration:** Activates internal resistors to prevent "floating" inputs that could cause CMOS shoot-through current.

### 6.5.2 The Universal Asynchronous Receiver-Transmitter (UART)
While GPIO is useful for simple logic, exchanging complex data with external microcontrollers or diagnostic terminals requires serial communication. The **UART** is a ubiquitous, legacy protocol that transmits data sequentially over a single wire without a shared clock signal. 

Because there is no clock wire to synchronize the sender and receiver, a UART relies on strict timing agreements. Both ends must be configured to the exact same **baud rate** (symbols per second). 

A standard UART transmission frame operates as follows:
1.  **Idle State:** The line is held at logic HIGH (1).
2.  **Start Bit:** The transmitter pulls the line LOW (0) for exactly one baud period. This alerts the receiver that a frame is beginning, allowing it to synchronize its internal clock timers.
3.  **Data Bits:** The transmitter sends 5 to 8 bits of payload data, usually Least Significant Bit (LSB) first.
4.  **Parity Bit (Optional):** A hardware-generated bit used for basic error detection (e.g., ensuring the total number of 1s is even).
5.  **Stop Bit:** The line is driven HIGH (1) to return to the idle state and guarantee a clear transition for the next start bit.

Because modern CPUs run billions of times faster than standard UART baud rates (e.g., 115,200 bps), UART IP blocks incorporate hardware **FIFO (First-In, First-Out) buffers**. When the CPU wishes to print a string, it blasts the entire string into the UART's TX FIFO using MMIO in just a few nanoseconds. The hardware state machine then sequentially shifts the bits out over the physical wire at the slow baud rate, eventually raising an interrupt when the FIFO is empty and ready for more data.

### 6.5.3 Synchronous Serial: SPI and I2C
While UART is asynchronous, faster peripheral communication is achieved using synchronous protocols that include a dedicated clock wire. 
*   **SPI (Serial Peripheral Interface):** A full-duplex protocol utilizing four wires: Master Out Slave In (MOSI), Master In Slave Out (MISO), Serial Clock (SCK), and Chip Select (CS). Because the master explicitly drives the clock, SPI can easily run at tens of megahertz, making it ideal for interfacing with external flash memory or LCD screens.
*   **I2C (Inter-Integrated Circuit):** A half-duplex, multi-master protocol utilizing only two wires: Serial Data (SDA) and Serial Clock (SCL). I2C uses open-drain signaling with pull-up resistors and requires devices to broadcast target addresses over the bus before data transfer. It is slower than SPI but drastically reduces pin count, making it standard for reading low-speed sensor arrays (e.g., accelerometers, temperature probes).

## 6.6 VirtMCU Homework: Building a Deterministic UART Driver
In traditional embedded systems education, writing a bare-metal UART driver introduces students to the harsh realities of physical timing. If your C code relies on polling, and the host operating system scheduling your emulator preempts your thread for a few milliseconds, the simulated UART peripheral will drop characters, leading to corrupted strings and immense frustration. Standard virtual machines fail to replicate the strict, continuous-time relationships required for asynchronous serial communication.

To resolve this, this chapter’s homework relies on the **VirtMCU** framework. Because VirtMCU utilizes a dynamic QOM plugin architecture to enforce deterministic virtual time via the `hw/rust/backbone/clock` module, time *stops* for the simulated SoC when the simulator pauses.

1.  **Memory Map Investigation:** You will inspect the VirtMCU hardware definition files to locate the base address of the APB-attached UART peripheral.
2.  **MMIO Driver Implementation:** You will write a C driver utilizing volatile pointers to interact with the UART's memory-mapped control, status, and data registers. First, you will implement a polled transmission function, writing a string to the TX register and spinning until the `TX_EMPTY` flag is asserted.
3.  **Deterministic Evaluation:** You will launch the VirtMCU instance and connect a simulated serial terminal to the `hw/rust/comms/chardev` deterministic backend. Because VirtMCU strictly lock-steps the UART baud-rate generation to the exact number of retired instructions in the `slaved-icount` mode, you will observe flawless character delivery. You will then intentionally configure a baud rate mismatch between your driver and the terminal to observe framing errors, empirically proving how asynchronous protocols fail without precise timing synchronization.