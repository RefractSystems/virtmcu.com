# Chapter 5: Escaping the Super-Loop: Interrupts and Exceptions

If you followed the bare-metal UART driver exercise in Chapter 4, your program currently relies on a `while(1)` "super-loop" that constantly polls a hardware flag to see if the next byte is ready. In a desktop environment, spinning a core at 100% just to wait for user input is poor form. In a battery-powered Cyber-Physical System (CPS), it is a fatal design flaw. You are burning massive amounts of dynamic power to accomplish absolutely nothing. 

To build responsive, deterministic, and power-efficient embedded systems, we must stop asking the hardware if it needs attention. Instead, we configure the hardware to forcefully tap the CPU on the shoulder when an event occurs. This mechanism is the interrupt. 

## 5.1 The Exception Model

In the architectural world, an **exception** is a catch-all term for any event that forces the processor to alter its normal sequential flow of control. An **interrupt** is simply a specific type of asynchronous exception that originates from an external hardware device (like a UART receiving a byte, or a timer hitting zero). 

When an exception fires, the CPU pipeline pauses, saves its current location, and instantly jumps to an address in the Vector Table to execute a dedicated function called an Interrupt Service Routine (ISR) or Exception Handler. But what exactly happens to the instructions that were already halfway through the CPU pipeline when the exception fired? 

This brings us to a foundational concept in computer architecture: the difference between precise and imprecise exceptions. 

### 5.1.1 Precise vs. Imprecise Exceptions
Modern processors are deeply pipelined, meaning multiple instructions are in various stages of fetching, decoding, and execution at the exact same moment. If an exception fires, the processor must figure out how to halt this chaotic assembly line safely. 

As defined by Hennessy & Patterson, an architecture has **precise exceptions** if the pipeline can be stopped such that all instructions physically located before the faulting instruction complete their execution, while all instructions after it are cleanly aborted and restarted from scratch after the handler finishes. 

If a processor guarantees precise exceptions, the hardware masks the complexity of the pipeline from you, the software engineer. When your ISR returns, the program resumes execution smoothly, entirely unaware that it was ever interrupted. Because of this massive software advantage, almost all modern processors guarantee precise exceptions for their integer pipelines.

However, advanced architectures with out-of-order execution or deep Domain-Specific Architectures often struggle to maintain this. If a long-running floating-point division instruction causes an arithmetic overflow, but a subsequent, independent integer instruction has already zoomed through the pipeline and committed its result to a register, the processor's architectural state has been permanently altered. If the processor allows this altered state to stand, it has implemented an **imprecise exception**. 

> **NOTE: Why You Should Care About Imprecise Exceptions**
> While imprecise exceptions allow hardware designers to build faster, less complex out-of-order execution engines, they make the software engineer's life miserable. If an imprecise exception occurs, you cannot simply return from the ISR and resume the program, because the CPU registers are out of sync with the original program order. For hard real-time systems, we strongly prefer microcontroller architectures (like the ARM Cortex-M) that rigorously guarantee precise exceptions, ensuring absolute deterministic recovery.

### 5.1.2 The ARM Cortex Exception Types
Before we can write an ISR, we need to know what kind of exceptions the hardware can actually generate. The ARM architecture defines several core exceptions:

*   **Reset:** The ultimate exception. Initiated when power is applied or the reset pin is pulled low.
*   **Non-Maskable Interrupt (NMI):** A critical hardware interrupt that cannot be disabled by software. This is your "panic button," often wired to a power-failure detection circuit or a watchdog timer.
*   **HardFault:** The generic fault handler. If you attempt to execute an illegal instruction, or divide by zero, or access memory that doesn't exist, you end up here. 
*   **MemManage, BusFault, UsageFault:** Finer-grained fault handlers available on advanced Cortex-M cores to catch specific memory protection or bus errors.

Beyond these core system exceptions, the processor supports dozens (or even hundreds) of external hardware interrupts sourced from the SoC's peripherals. Managing the chaos of hundreds of potential simultaneous interrupts requires a dedicated piece of silicon.

## 5.2 The NVIC (Nested Vectored Interrupt Controller)

In older architectures, you had to route all your hardware interrupt pins into a single CPU pin, and your software ISR had to manually poll every peripheral's status register to figure out who actually triggered the interrupt. 

In the ARM Cortex-M architecture, this software overhead is eliminated by a tightly integrated hardware block known as the **Nested Vectored Interrupt Controller (NVIC)**. The NVIC sits directly alongside the CPU core and acts as the grand traffic cop for all exceptions and interrupts. 

The NVIC does three things exceptionally well: it prioritizes simultaneous requests, it handles preemptive nesting, and it orchestrates the automatic saving and restoring of CPU state.

### 5.2.1 Hardware Priorities
Not all interrupts are created equal. An interrupt triggered by an emergency braking sensor is infinitely more important than an interrupt indicating that a USB packet has arrived. 

The NVIC uses a mathematical priority system to resolve conflicts. **In the ARM architecture, a lower priority number represents a higher urgency.** 

The core system exceptions have fixed, negative priority numbers to guarantee they always win:
*   **Reset:** Priority -3
*   **NMI:** Priority -2
*   **HardFault:** Priority -1

For all your standard hardware peripherals (UART, Timers, DMA), the priority is strictly positive (0 and up) and is completely programmable via software. If a Timer (configured to Priority 2) and a UART (configured to Priority 5) both request an interrupt on the exact same clock cycle, the NVIC hardware evaluates the priorities, pauses the main program, and instantly vectors the CPU to the Timer's ISR.

### 5.2.2 Preemptive Nesting
What happens if the CPU is already executing the UART ISR (Priority 5), and suddenly the Timer (Priority 2) fires? 

Because the Timer has a mathematically lower priority number (higher urgency), the NVIC initiates **preemptive nesting**. It immediately pauses the execution of the UART ISR, pushes the UART ISR's context onto the stack, and jumps to the Timer ISR. 

When the Timer ISR finishes, the hardware automatically unwinds the stack, returning execution to the UART ISR exactly where it left off. Once the UART ISR finishes, the stack unwinds again, returning to your `main()` `while(1)` loop. This entire multi-level preemption happens in hardware with zero software overhead.

> **WARNING: Stack Overflow via Nesting**
> Preemptive nesting is incredibly powerful, but dangerous. Every time an interrupt preempts another interrupt, the NVIC automatically pushes 8 registers (R0-R3, R12, LR, PC, and xPSR) onto your main stack to save the processor state. If you have 10 different priority levels and a cascade of nested interrupts occurs, your hardware will chew through at least 80 words of stack memory instantly. If your stack isn't sized properly, you will silently corrupt your `.data` or `.bss` sections, leading to a catastrophic system failure.

### 5.2.3 Talking to the NVIC in C
Because the NVIC is tightly integrated into the ARM core, its control registers are mapped into a specific region of the physical memory map called the System Control Space (SCS), starting at address `0xE000E000`. 

To configure an interrupt, we must manipulate two critical arrays of Memory-Mapped I/O (MMIO) registers:
1.  **`NVIC_ISER` (Interrupt Set-Enable Registers):** Used to turn the interrupt on.
2.  **`NVIC_IPR` (Interrupt Priority Registers):** Used to assign the priority level.

Let's look at the inline C code to enable a hardware interrupt (let's assume our target peripheral is hardwired to IRQ number 5) and set its priority to 2.

```c
#include <stdint.h>

// Base address for the NVIC Interrupt Set-Enable Register 0
#define NVIC_ISER0 (*((volatile uint32_t*) 0xE000E100))

// Base address for the NVIC Interrupt Priority Register 1
#define NVIC_IPR1  (*((volatile uint32_t*) 0xE000E404))

void enable_peripheral_interrupt(void) {
    // Step 1: Set the Priority Level
    // The NVIC_IPR registers hold 8-bit priority values for each IRQ.
    // IRQ 5 is located in the second byte (bits 15:8) of IPR1.
    // We want to set the priority to 2.
    
    // First, clear the existing priority for IRQ 5
    NVIC_IPR1 &= ~(0xFF << 8); 
    
    // Now, set the new priority level to 2
    // Note: Many ARM chips only implement the top 3 or 4 bits of the priority byte!
    // If the chip uses 3 priority bits, priority 2 is actually written as (2 << 5).
    NVIC_IPR1 |= (2 << (8 + 5)); 

    // Step 2: Enable the Interrupt
    // ISER0 controls IRQs 0 through 31. We set bit 5 to enable IRQ 5.
    // Writing a 1 enables the interrupt; writing a 0 has no effect.
    NVIC_ISER0 = (1 << 5);
}
```

By keeping our ISRs short, offloading heavy data movement to the DMA, and letting the NVIC handle all of the priority math in hardware, we can design hard real-time systems that never miss a deadline. But to write an ISR that actually compiles and links correctly, we have to look closely at the ABI (Application Binary Interface) and how the compiler handles context switching. We will dive into the assembly language of a bulletproof ISR in the next section.

## 5.3 Writing a Bulletproof ISR

When an interrupt fires, the processor abruptly halts your `main()` program, freezes the instruction pipeline, and vectors away to execute your Interrupt Service Routine (ISR). To your main program, this happens completely invisibly. 

But there is a catch: because the main program has no idea it was interrupted, it expects the entire state of the processor—every single register and status flag—to be exactly the way it left it. If your ISR modifies register `X0` to do some math and forgets to put the original value back, the main program will resume execution with corrupted data. You will spend weeks hunting down a "random" bug that only occurs when the interrupt fires at the exact wrong microsecond.

To write a bulletproof ISR, you must religiously practice **context saving and restoring**. You must push the processor's state onto the stack upon entry, and pop it back off the stack right before returning.

### The AArch64 Assembly Wrapper
In smaller microcontrollers (like the ARM Cortex-M series), the hardware automatically pushes some registers to the stack for you. However, in the 64-bit AArch64 architecture, the hardware expects the software to do the heavy lifting. When an interrupt occurs, the hardware automatically saves the Program Counter (PC) and the Processor State (PSTATE) into special exception registers, but the general-purpose registers (`X0`-`X30`) are entirely your responsibility.

Because we want to write our actual ISR logic in C, we need to write an assembly language "wrapper." The C compiler assumes it is free to trash any volatile register (like `X0`-`X7`) during a function call. Therefore, our assembly wrapper must push all volatile registers to the stack, call the C function, pop the registers to restore them, and then execute the special `eret` (Exception Return) instruction.

Here is the exact AArch64 assembly code for a robust ISR wrapper:

```assembly
// isr_wrapper.S
.text
.align 2
.global uart_irq_wrapper

uart_irq_wrapper:
    // 1. Context Saving: Push all volatile registers to the stack.
    // We use the Store Pair (stp) instruction with pre-indexed addressing
    // to push two 64-bit registers at a time and decrement the Stack Pointer (SP) by 16 bytes.
    // The ARM stack MUST remain 16-byte aligned at all times!
    stp x0, x1, [sp, #-16]!
    stp x2, x3, [sp, #-16]!
    stp x4, x5, [sp, #-16]!
    stp x6, x7, [sp, #-16]!
    stp x8, x9, [sp, #-16]!
    stp x10, x11, [sp, #-16]!
    stp x12, x13, [sp, #-16]!
    stp x14, x15, [sp, #-16]!
    stp x16, x17, [sp, #-16]!
    stp x18, x30, [sp, #-16]! // Note: X30 is the Link Register (LR)

    // 2. Call the high-level C interrupt handler
    bl c_uart_handler

    // 3. Context Restoring: Pop all volatile registers from the stack.
    // We use the Load Pair (ldp) instruction with post-indexed addressing.
    // IMPORTANT: You must pop them in the exact reverse order that you pushed them!
    ldp x18, x30, [sp], #16
    ldp x16, x17, [sp], #16
    ldp x14, x15, [sp], #16
    ldp x12, x13, [sp], #16
    ldp x10, x11, [sp], #16
    ldp x8, x9, [sp], #16
    ldp x6, x7, [sp], #16
    ldp x4, x5, [sp], #16
    ldp x2, x3, [sp], #16
    ldp x0, x1, [sp], #16

    // 4. Return from Exception. 
    // This hardware-level instruction restores the PC and PSTATE from the exception registers.
    eret
```

By pushing and popping pairs of registers using `stp` and `ldp`, we efficiently move data to and from memory while guaranteeing the stack pointer (`SP`) remains aligned to a 16-byte boundary, preventing a bus error fault.

### The C Handler: Deferring the Heavy Lifting

Now that our assembly wrapper guarantees the CPU state is preserved, we can write the actual interrupt logic safely in C. 

> **TIP: Keep It Short! Set a Flag and Get Out**
> A common beginner mistake is trying to do too much inside the ISR. If your ISR reads a UART buffer, processes a JSON string, does some math, and prints a message to the console, your system will fail. While the CPU is executing your ISR, other interrupts are typically blocked or delayed. If your ISR takes 10 milliseconds to run, you will drop network packets and miss sensor deadlines. 
> 
> The golden rule of embedded systems: **Keep your ISRs as short as absolutely possible.** Acknowledge the hardware to clear the interrupt, set a `volatile` software flag (or push the data into a circular buffer), and return immediately. Let the main `while(1)` loop or your RTOS tasks handle the heavy processing later.

Here is the C code that implements this philosophy for a UART interrupt:

```c
#include <stdint.h>

// Hardware register definitions (from the SoC datasheet)
#define UART0_ICR     (*(volatile uint32_t*) 0x40001044) // Interrupt Clear Register
#define UART0_DR      (*(volatile uint32_t*) 0x40001000) // Data Register

// Global flags shared between the ISR and the main loop.
// They MUST be marked 'volatile' so the compiler knows they can change 
// unexpectedly outside of the main program's normal flow.
volatile uint8_t rx_data_ready = 0;
volatile char    rx_byte = 0;

// The C handler called by our AArch64 assembly wrapper
void c_uart_handler(void) {
    // 1. Read the data from the hardware to prevent buffer overruns
    rx_byte = (char)(UART0_DR & 0xFF);
    
    // 2. Clear the interrupt in the hardware so it doesn't immediately fire again
    UART0_ICR = 1; 

    // 3. Set a flag indicating to the main loop that data is available
    rx_data_ready = 1;
    
    // 4. Return immediately!
}

int main(void) {
    // ... Initialization code ...

    while(1) {
        // The main super-loop does the heavy lifting
        if (rx_data_ready) {
            // Process the received byte
            process_network_packet(rx_byte);
            
            // Clear the flag until the next interrupt
            rx_data_ready = 0; 
        }
        
        // ... Do other background tasks or go to sleep ...
    }
}
```

Notice how we separated the fast hardware abstraction from the slow application logic. The hardware taps the CPU on the shoulder, the ISR safely swoops in, grabs the byte, sets `rx_data_ready = 1`, and gracefully exits via the `eret` instruction. The main loop then detects the flag and takes all the time it needs to process the payload without blocking the rest of the physical world.