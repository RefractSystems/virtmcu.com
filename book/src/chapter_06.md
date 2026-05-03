# Chapter 6: Real-Time Operating Systems (RTOS) Under the Hood

If you are building a system that balances an inverted pendulum, flies a quadcopter, or controls a robotic arm, writing a massive `while(1)` super-loop quickly becomes a nightmare. If the routine that reads the gyroscope takes slightly too long, the routine that updates the motor speeds runs late, and your quadcopter flips upside down. 

To fix this, we introduce the **Real-Time Operating System (RTOS)**. An RTOS allows you to split your monolithic firmware into smaller, independent threads (or tasks). The RTOS kernel manages the CPU, transparently pausing and resuming tasks to ensure that every hard deadline is met,. 

But an RTOS is not black magic. It is just software. In this chapter, we are going to look under the hood to see exactly how a CPU physically swaps between tasks, and how we can mathematically prove that our tasks will always hit their deadlines.

## 6.1 Task Control Blocks (TCB) & Context Switching

In a single-CPU system, only one task can physically be in the "Running" state at any exact nanosecond. All other tasks are either "Ready" (waiting for their turn), "Waiting" (blocked on a resource or delay), or "Terminated". 

To manage these tasks, the RTOS creates a data structure in RAM for every single task, known as the **Task Control Block (TCB)**,. The TCB is the task's identity. At an absolute minimum, it contains:
1.  **Task Stack Pointer:** The memory address of the current top of the task's private stack.
2.  **Task State:** Whether the task is Running, Ready, or Blocked.
3.  **Task Priority:** How important the task is relative to others.

When the RTOS decides it is time to stop running Task A and start running Task B, it performs a **context switch**. A context switch is the process of pausing a task, saving its exact CPU state (the context), and restoring the previously saved CPU state of another task. 

> **NOTE: The C Compiler Cannot Help You Here**
> Because a context switch involves forcibly ripping the CPU registers away from one task and giving them to another, this process cannot be written in standard C. It must be written in pure, low-level assembly language.

### 6.1.1 The AArch64 Context Switch

Let's look at the actual AArch64 assembly code for an RTOS context switch. This code is typically triggered by a hardware timer interrupt (like the SysTick timer) that fires every millisecond to give the RTOS kernel control of the CPU.

When the timer interrupt fires, the CPU automatically saves the Program Counter (PC) and PSTATE, but we have to manually save the 32 general-purpose registers (X0-X31) onto Task A's stack. Then, we save Task A's stack pointer into its TCB, load Task B's stack pointer from its TCB, and pop Task B's registers off its stack.

```assembly
// rtos_context_switch.S
.global rtos_context_switch
.extern current_tcb    // Pointer to the TCB of the task being suspended
.extern next_tcb       // Pointer to the TCB of the task being resumed

rtos_context_switch:
    // ---------------------------------------------------------
    // STEP 1: Save the context of Task A
    // ---------------------------------------------------------
    // Push all 32 general-purpose registers onto Task A's stack
    stp x0, x1, [sp, #-16]!
    stp x2, x3, [sp, #-16]!
    stp x4, x5, [sp, #-16]!
    // ... (omitting X6-X27 for brevity) ...
    stp x28, x29, [sp, #-16]!
    
    // Push the Link Register (X30). We don't push the SP directly; 
    // we manipulate the actual SP register.
    str x30, [sp, #-16]!

    // ---------------------------------------------------------
    // STEP 2: Save Task A's Stack Pointer to its TCB
    // ---------------------------------------------------------
    ldr x0, =current_tcb    // Load the address of the pointer current_tcb
    ldr x1, [x0]            // Dereference to get the actual TCB address
    mov x2, sp              // Copy the current hardware SP into X2
    str x2, [x1]            // Store the SP into the first field of Task A's TCB

    // ---------------------------------------------------------
    // STEP 3: Load Task B's Stack Pointer from its TCB
    // ---------------------------------------------------------
    ldr x0, =next_tcb       // Load the address of the pointer next_tcb
    ldr x1, [x0]            // Dereference to get the actual TCB address
    ldr x2, [x1]            // Load Task B's saved SP from the first field of its TCB
    mov sp, x2              // Overwrite the hardware SP with Task B's SP!
                            // WE ARE NOW ON TASK B'S STACK.

    // Update current_tcb to point to next_tcb
    ldr x0, =current_tcb
    str x1, [x0]

    // ---------------------------------------------------------
    // STEP 4: Restore the context of Task B
    // ---------------------------------------------------------
    // Pop the Link Register
    ldr x30, [sp], #16
    
    // Pop all general-purpose registers off Task B's stack
    ldp x28, x29, [sp], #16
    // ... (omitting X6-X27) ...
    ldp x4, x5, [sp], #16
    ldp x2, x3, [sp], #16
    ldp x0, x1, [sp], #16

    // Return from the timer interrupt.
    // The CPU will automatically pop the PC and PSTATE from the 
    // exception registers, instantly resuming Task B where it left off.
    eret
```

The magic happens right in the middle at `mov sp, x2`. In a single clock cycle, the entire local memory landscape of the processor changes. The CPU forgets Task A ever existed and begins looking at the history of Task B.

## 6.2 Scheduling for Deadlines

Now that the RTOS can swap tasks, we have a new problem: *Which* task should it run next? 

An RTOS determines the next task using a scheduling algorithm. In hard real-time systems, we cannot just guess priorities and hope everything runs fast enough. We need mathematical proof that no task will ever miss its execution deadline,. 

The most common static-priority scheduling algorithm used in the industry is **Rate Monotonic Scheduling (RMS)**. 

### 6.2.1 Rate Monotonic Scheduling (RMS)

RMS assigns priorities to tasks using a simple, immutable rule: **the shorter the execution period of the task, the higher its priority**. 

If you have a Motor Control task that must run every 5 milliseconds, and a Sensor Logging task that runs every 10 milliseconds, the Motor Control task is mathematically forced to have a higher priority. It doesn't matter if you *feel* the sensor data is more important; under RMS, frequency dictates priority.

### 6.2.2 The Utilization Formula

How do we prove that a set of tasks running under RMS will meet all deadlines? We calculate the total CPU utilization factor. 

Every task $i$ has two parameters:
*   $C_i$: The worst-case execution time (how long it takes the CPU to run the task).
*   $T_i$: The execution period (the deadline by which the task must finish).

The CPU utilization for a single task is simply $U_i = \frac{C_i}{T_i}$. The total utilization for $n$ tasks is the sum of all individual utilizations. 

RMS guarantees that all tasks will meet their deadlines if the total CPU utilization satisfies this mathematical bound:

$$ \sum_{i=1}^{n} \frac{C_i}{T_i} \le n(2^{1/n} - 1) $$

Let's look at the math for a system with 3 tasks ($n=3$):
$3 \times (2^{1/3} - 1) \approx 0.78$,,

This means that if you have 3 tasks, and their combined CPU utilization is **78% or less**, RMS mathematically guarantees that no task will ever miss a deadline, even in the worst-case alignment where all tasks request the CPU at the exact same millisecond,,. 

Let's test a hypothetical set of three tasks:
*   **Task 1 (Motor):** Runs for 2ms, every 6ms ($C_1=2, T_1=6$).
*   **Task 2 (Sensors):** Runs for 1ms, every 5ms ($C_2=1, T_2=5$).
*   **Task 3 (Display):** Runs for 2ms, every 12ms ($C_3=2, T_3=12$).

Total Utilization $U = \frac{2}{6} + \frac{1}{5} + \frac{2}{12} = 0.33 + 0.20 + 0.17 = 0.70$.

Because 70% is less than our 78% bound, this system is **schedulable**,. You can flash this firmware to your drone, and you can sleep soundly knowing the RTOS will never drop a motor control packet.

> **WARNING: The 78% Threshold**
> What happens to the remaining 22% of the CPU's time? It is essentially wasted. If you try to add a 4th task that pushes the total utilization to 85%, the static-priority RMS math breaks down. The system *might* still work, but you can no longer mathematically guarantee it,. If you absolutely must push your CPU utilization to 99%, you have to abandon RMS and use a more complex, dynamic-priority algorithm like Earliest Deadline First (EDF).

## 6.3 Concurrency Hazards

By splitting our monolithic super-loop into multiple independent threads, we have gained the ability to guarantee hard real-time deadlines. But this power comes with a sharp edge. When multiple threads share the same physical memory space and hardware peripherals, they inevitably have to share resources. We use synchronization primitives like mutexes and semaphores to protect these critical sections, but if you aren't careful, the very mechanisms designed to protect your system will bring it crashing down. 

In a Cyber-Physical System, concurrency hazards don't just throw an exception on a screen—they lock up flight controllers and drop drones out of the sky. The two most notorious hazards you will face are deadlocks and priority inversion.

### 6.3.1 Deadlocks

A deadlock is a specific condition in which two or more tasks are simultaneously waiting for resources held by one another, leaving all involved threads in a wait state indefinitely. 

Deadlocks most commonly occur when multiple threads attempt to lock multiple mutexes in different sequences. Suppose you have an autonomous rover with two hardware resources: a robotic arm (protected by `mutex_arm`) and a camera (protected by `mutex_camera`). 

If `Thread 1` (the sampling task) locks `mutex_arm` and then attempts to lock `mutex_camera`, it will block if the camera is currently in use. Meanwhile, `Thread 2` (the navigation task) has already locked `mutex_camera` and suddenly decides it needs to lock `mutex_arm` to move the arm out of the way. 

Neither task can proceed from this state. `Thread 1` is waiting on `Thread 2`, and `Thread 2` is waiting on `Thread 1`. The system is deadlocked. The only way to fix this in software is strict discipline: you must architect your code so that all threads acquire multiple mutexes in the exact same predefined hierarchical order. Some sophisticated RTOS implementations can verify mutex ownership during a lock attempt and return an error code rather than freezing the system if a deadlock is imminent, but in simpler kernels, avoiding deadlocks is entirely the developer's responsibility.

### 6.3.2 Priority Inversion

While deadlocks are usually caused by logical bugs in your locking sequence, **priority inversion** is a far more insidious phenomenon that can occur in real-time kernels even when your locking logic is perfectly sound. It refers to a catastrophic scheduling failure where a lower-priority task inadvertently blocks the execution of a higher-priority task, completely upending the mathematical guarantees of Rate Monotonic Scheduling (RMS).

To understand how this happens, imagine a system with three threads:
*   **Thread H** (High Priority)
*   **Thread M** (Medium Priority)
*   **Thread L** (Low Priority)

Suppose `Thread L` wakes up and acquires a mutex to write data to a shared memory buffer. While `Thread L` is executing its critical section, `Thread H` wakes up. Because `H` has a higher priority, the RTOS preempts `L` and gives the CPU to `H`. 

Shortly after, `Thread H` attempts to acquire the exact same mutex. Because `L` still holds the mutex, `H` is immediately placed into the Blocked state, and the RTOS hands the CPU back to `L` so it can finish its work and release the lock. So far, the system is working exactly as intended. 

But then, disaster strikes. While `L` is trying to finish its critical section, `Thread M` becomes ready to run. Because `M` does not rely on that specific shared resource, it doesn't need the mutex. Since `M` has a higher priority than `L`, the RTOS preempts `L` and gives the CPU to `M`. 

Look at the state of our system now: `Thread M` is happily running, preempting `Thread L` and preventing it from releasing the resource required by `Thread H`. In effect, `Thread M` is indirectly blocking `Thread H`. The intended priority regime is completely inverted. If `Thread M` runs for a long time, `Thread H` will miss its hard real-time deadline.

> **WAR STORY: Priority Inversion on Mars**
> While the issue of priority inversion might seem like an obscure academic edge case, it arises even in the most carefully designed, multi-million-dollar real-time systems. 
> 
> In 1997, shortly after the NASA Mars Pathfinder rover landed on the Red Planet, its main processor began experiencing frequent, unexpected resets. The rover would simply reboot itself in the middle of operations. NASA engineers scrambled to pull the system logs across the solar system and eventually diagnosed the problem: a priority inversion in the VxWorks real-time operating system code. 
> 
> An infrequent, low-priority meteorological data-gathering task had acquired a lock on the rover's shared information bus. A high-priority bus management task tried to access the bus and blocked. Meanwhile, a medium-priority communications task woke up and preempted the low-priority meteorological task. The high-priority task was starved of execution time, triggering a hardware watchdog timer to reset the entire system to save the rover. NASA engineers had to upload a remote software patch to the rover's RTOS kernel to enable a specific protocol that fixed the scheduling behavior, enabling the mission to proceed.

### 6.3.3 Priority Inheritance Protocols (PIP)

To prevent priority inversion from bringing down your system (or your spacecraft), RTOS developers created a kernel-level mechanism known as **Priority Inheritance**. 

Under a Priority Inheritance Protocol (PIP), the RTOS kernel actively monitors the ownership of mutexes and the queues of threads waiting on them. When a high-priority thread attempts to acquire a mutex that is currently held by a low-priority thread, the RTOS intervenes: it temporarily elevates the priority of the low-priority thread to match the priority of the waiting high-priority thread.

At the kernel level, this means the RTOS modifies the Task Control Block (TCB) of `Thread L`, changing its current effective priority to equal that of `Thread H`. 

With its newly inherited high priority, `Thread L` resumes execution. If `Thread M` (the medium-priority task) wakes up now, the RTOS will *not* let it preempt `Thread L`, because `L` is currently executing at `H`'s priority level. This elegantly eliminates the possibility that a mid-priority thread can delay the low-priority thread holding the lock. 

Once `Thread L` finally finishes its critical section and releases the mutex, the RTOS immediately restores `Thread L` to its original, low base priority, and hands the CPU over to `Thread H`, which now holds the mutex. 

When writing RTOS code, standard semaphores usually *do not* support priority inheritance because they are designed for generic signaling, not mutual exclusion. If you are protecting a shared resource in a hard real-time environment, you must specifically instantiate a **Mutex** object and ensure that the RTOS's Priority Inheritance feature is enabled for it.