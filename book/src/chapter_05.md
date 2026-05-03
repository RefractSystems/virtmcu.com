# Chapter 5: The Memory Hierarchy

## 5.1 Introduction: The Memory Wall
In the preceding chapter, we examined the internal microarchitecture of the processor, demonstrating how pipelining, superscalar execution, and out-of-order scheduling can dramatically increase the instruction execution rate. However, a processor can only execute instructions as fast as it can be supplied with code and data. Historically, microprocessor speeds have doubled every two years, whereas the access latency of main memory has decreased at only a fraction of that rate. This ever-expanding divergence between CPU execution speed and memory latency is known as the "memory wall". 

If a modern processor running at 3 GHz (where one clock cycle takes 0.33 nanoseconds) were forced to access main memory directly for every instruction, it would have to wait hundreds of clock cycles for the data to arrive. The execution pipeline would starve, and the massive throughput gains of the microarchitecture would be entirely wasted. 

To overcome this bottleneck, computer architects do not rely on a single, monolithic pool of memory. Instead, they construct a **memory hierarchy**. The hierarchy is organized as a pyramid: at the very top, residing inside the CPU core, are the processor registers, offering instant access. Below the registers is the **cache memory**, which is small but extremely fast, operating at speeds comparable to the processor. Below the cache is the main memory, which is much larger but significantly slower. At the base of the pyramid lies secondary storage (magnetic hard disk drives or solid-state drives), offering vast capacity but agonizingly slow access times measured in milliseconds,. By intelligently migrating data up and down this hierarchy, the memory system provides the software engineer with an illusion: a memory pool that possesses the speed of the fastest cache and the immense capacity of the largest disk,.

## 5.2 Primary Storage Technologies: SRAM and DRAM
To understand the trade-offs in the memory hierarchy, we must first look at the physical semiconductor technologies used to implement it. There are two primary types of volatile memory used in computer architectures: Static Random Access Memory (SRAM) and Dynamic Random Access Memory (DRAM).

### 5.2.1 Static RAM (SRAM)
SRAM is the fastest memory technology available and is utilized primarily for processor caches. A standard SRAM bit cell is constructed from six MOSFET transistors arranged as two cross-coupled inverters (forming a flip-flop) plus two access transistors,. Because the data is actively driven by a continuous feedback loop between the inverters, SRAM retains its state as long as power is applied without any need for external intervention,. 

The flip-flop design provides incredibly low latency, allowing read and write operations to keep pace with high-frequency CPU clocks. Furthermore, reading an SRAM cell is non-destructive. The major downside to SRAM is its size and cost. Because it requires six transistors per bit, an SRAM array consumes a massive amount of silicon die area,. Additionally, the transistors in the cross-coupled inverters continuously leak a small amount of current, resulting in static power dissipation that grows severely as transistor sizes shrink.

### 5.2.2 Dynamic RAM (DRAM)
Main memory is almost universally implemented using DRAM. A DRAM bit cell is astonishingly simple: it consists of exactly one transistor and one microscopic capacitor,. A logical 1 or 0 is represented by the presence or absence of an electrical charge on the capacitor. Because it only uses one transistor per bit, DRAM achieves enormous data density, making it vastly cheaper per megabyte than SRAM.

However, this density comes with severe performance penalties. The capacitor naturally leaks charge over time, meaning the memory will "forget" its data within milliseconds,. To prevent data loss, the memory controller must continually read and rewrite the contents of the entire memory, a process known as **refreshing**,. Furthermore, reading a DRAM cell requires the bit-line to share charge with the microscopic capacitor, a delicate analog process that takes significant time and actually destroys the charge in the capacitor,. As a result, every DRAM read must be immediately followed by a hardware rewrite to restore the data. To manage this, DRAM chips use a multiplexed addressing scheme where a row (page) is activated first, followed by column accesses. This multi-step process makes DRAM latency hundreds of times slower than SRAM,.

## 5.3 Cache Memory Fundamentals
Because SRAM is too large and expensive to serve as main memory, architects insert small SRAM caches between the CPU and the DRAM,. The effectiveness of a cache relies entirely on the mathematical probability that a required piece of data is already present in the SRAM. This probability is driven by two empirical principles of software behavior known as **locality of reference**:

1.  **Temporal Locality:** If a memory location is accessed, it is highly likely to be accessed again in the near future,,. A software engineer iterating a counter variable inside a `for` loop is demonstrating temporal locality. The cache exploits this by keeping a copy of recently accessed data.
2.  **Spatial Locality:** If a memory location is accessed, memory locations with nearby addresses are likely to be accessed soon,,. A software engineer traversing an array of integers demonstrates spatial locality. The cache exploits this by never fetching just a single byte from main memory; instead, it fetches an entire contiguous **cache line** (or cache block), typically 32 or 64 bytes wide,.

When the processor requests data, it searches the cache. If the data is found, a **cache hit** occurs, and the data is served at SRAM speeds,. If the data is absent, a **cache miss** occurs, and the processor pipeline must stall while the hardware fetches the entire cache line from the slower main memory,. 

The overall efficiency of the memory hierarchy is quantified by the **Average Memory Access Time (AMAT)**:
$$AMAT = Hit\_Time + (Miss\_Rate \times Miss\_Penalty)$$
To reduce AMAT, modern SoCs utilize multiple levels of cache. The **Level 1 (L1)** cache is tightly coupled to the processor pipeline, incredibly fast (often 1-3 cycles), but very small (e.g., 32 KB),. It is usually split into an L1 Instruction Cache (I-cache) and L1 Data Cache (D-cache) to prevent structural hazards and enable simultaneous instruction fetches and data loads—a hallmark of the Harvard architecture,. Below the L1 is the **Level 2 (L2)** cache, which is larger (e.g., 256 KB to 1 MB), somewhat slower, and usually unified (holding both instructions and data),. Many high-performance systems add a massive **Level 3 (L3)** cache shared among multiple processor cores,. 

## 5.4 Cache Organization and Placement Policies
When a cache fetches a 64-byte block from main memory, it must decide exactly where in its internal SRAM array to place it. Because the main memory is gigabytes in size and the cache is only kilobytes, countless memory blocks must map to the same cache slots. The hardware rules governing this mapping dictate the cache's placement policy.

### 5.4.1 Direct-Mapped Caches
A direct-mapped cache is the simplest organization. The cache is divided into a one-dimensional array of "sets," where each set can hold exactly one cache line,. A physical memory address is mapped to a specific set using a hardwired modulo operation,. 

To look up data, the cache controller splits the memory address into three fields:
*   **Byte Offset:** The lowest bits specify which exact byte within the 64-byte cache line is requested.
*   **Index (Set):** The middle bits determine which specific set in the cache array to check,.
*   **Tag:** The uppermost bits identify the exact main memory block currently residing in that set,. 

Because each memory address maps to exactly one set, finding data is fast; the cache checks the set's Tag against the address's Tag. If they match, and the "Valid" bit is set, it is a hit,. 

However, direct-mapped caches suffer from severe **conflict misses**. If a program actively bounces between two different memory addresses that happen to map to the exact same cache set (e.g., array elements spaced exactly by a multiple of the cache size), the cache will continually evict and reload the same set,. This pathological condition, known as thrashing, destroys performance. 

### 5.4.2 Fully Associative Caches
To eliminate conflict misses entirely, a cache can be made **fully associative**. In this design, a memory block can be placed in *any* available slot in the cache. The address is only split into a Tag and a Byte Offset; there is no Index. 

While this prevents arbitrary collisions, looking up data becomes a hardware nightmare. The cache controller must compare the requested Tag against the Tags of *every single line in the entire cache simultaneously*. This requires massive amounts of comparator logic (AND-gates and OR-gates), which consumes excessive die area and power, making it entirely impractical for large L1 or L2 caches,,.

### 5.4.3 N-Way Set-Associative Caches
Modern processor caches strike a compromise using **set-associative** mapping. The cache is divided into sets, but each set contains $N$ separate slots (or "ways"),. For example, in an 8-way set-associative cache, a memory address still hashes to one specific set, but the cache line can be placed into any of the 8 available ways within that set.

During a lookup, the hardware reads all $N$ tags in the indexed set in parallel and compares them to the requested address,. This effectively mitigates the "birthday paradox" of cache collisions without requiring the massive hardware overhead of a fully associative search. Most L1 caches today are 4-way or 8-way set-associative, offering an optimal balance between hit rate, hardware complexity, and access latency.

## 5.5 Cache Replacement and Write Policies
When a set-associative cache experiences a miss and all $N$ ways in the target set are currently full, the cache controller must choose one existing line to evict. 

The gold standard for eviction is the **Least Recently Used (LRU)** policy,. LRU relies on the principle of temporal locality, assuming that the cache line which has gone the longest without being accessed is the safest to discard,. True LRU is easy to implement for 2-way caches but becomes exponentially complex for 8-way or 16-way caches. Therefore, modern processors often use **Pseudo-LRU** (using a tree of binary flags to approximate age) or a simple Not-Recently-Used (NRU) clock algorithm,.

Handling memory stores (writes) introduces further complexity. If the CPU updates a variable, it modifies the copy in the cache. The cache and main memory are now out of sync. There are two primary write policies to resolve this:
*   **Write-Through:** Every write to the cache is simultaneously propagated out to the main memory,,. This ensures memory is always perfectly up-to-date, making recovery easy. However, it severely wastes memory bus bandwidth. If a program increments a counter 1,000 times, write-through initiates 1,000 slow DRAM transactions.
*   **Write-Back:** Writes only update the cache,,. A special metadata flag called the **dirty bit** is flipped to indicate the cache line contains modified data,. The line is only written back to DRAM when it is eventually evicted. This technique, called write coalescing, drastically improves performance by absorbing thousands of intermediate writes,.

Furthermore, if a CPU attempts to write to an address that is *not* currently in the cache, it must decide whether to fetch the block first. Modern processors usually employ a **write-allocate** policy, dragging the missing cache line from DRAM into the cache before modifying it, assuming the software will likely write to adjacent variables in the same block shortly,.

## 5.6 Cache Coherence in Multicore Systems
As discussed in Chapter 4, to increase throughput, modern architectures place multiple processor cores on a single silicon die (Symmetric Multiprocessing or SMP). Each core possesses its own private L1 cache. If we utilize a high-performance write-back policy, we inevitably trigger the **cache coherence problem**,,.

Suppose Core A and Core B both load a shared memory variable $X$ (currently 0) into their respective L1 caches. Core A executes `X = 5`. Because Core A uses a write-back cache, the new value `5` is stored only in Core A's L1 cache; main memory remains `0`, and Core B's cache remains `0`,. If Core B subsequently reads $X$, it will see stale, invalid data. This violates the sequential consistency expected by software engineers writing multithreaded applications.

To prevent this, the hardware implements a **cache coherence protocol**. In smaller SMP systems, this is achieved via **snooping**,. All cache controllers constantly monitor (snoop) the shared memory bus,. When a core wishes to write to a shared variable, it broadcasts a signal. 

The baseline snooping protocol is **MSI**, which assigns one of three states to every cache line:
1.  **Modified (M):** The line is dirty. This core owns the only valid copy in the system.
2.  **Shared (S):** The line is clean. Multiple cores may have copies. The core can read it, but cannot write to it without asking permission.
3.  **Invalid (I):** The line contains garbage.

If a line is Shared, and Core A wants to write to it, Core A must broadcast an "Invalidate" message on the bus (BusRdX). Core B hears this snoop message and downgrades its copy of $X$ to Invalid. Core A then transitions to Modified and performs the write. If Core B later wants to read $X$, it broadcasts a read request. Core A snoops the request, pauses, flushes its Modified line back to DRAM, and then both cores transition back to Shared.

Modern processors (like the Core i7) use the extended **MESI** protocol, which adds an **Exclusive (E)** state. Exclusive indicates the line is clean, but this core is the *only* one holding it. If the core decides to write, it can transition from E to M silently, without broadcasting an expensive invalidate message on the bus. 

Advanced ARM processors use the **MOESI** protocol, which adds an **Owned (O)** state,. The Owned state solves a major inefficiency: if Core A has a Modified line and Core B wants to read it, standard MESI forces Core A to flush the line to slow DRAM before Core B can read it. Under MOESI, Core A simply transmits the dirty data directly to Core B over the fast internal bus. Core A becomes the "Owner" (responsible for eventually writing it back to DRAM), and Core B enters the Shared state. This peer-to-peer cache transfer entirely bypasses the main memory bottleneck.

For enormous systems with hundreds of cores where broadcast snooping would saturate the bus, architects use **directory-based coherence**,. A centralized directory tracks exactly which cores hold which cache lines, allowing point-to-point invalidation messages rather than global broadcasts,.

## 5.7 Virtual Memory
In the early days of computing, software ran directly on physical memory. If an application needed 64 MB of RAM but the machine only had 32 MB, the programmer had to manually chop the program into "overlays," shuttling segments of code back and forth from the disk—a tremendously tedious process. 

To solve this, architects introduced **Virtual Memory**. The operating system and hardware conspire to give each running process the illusion of an immense, private, contiguous address space (e.g., 4 GB on a 32-bit system or 256 TB on a 64-bit system), regardless of how much physical RAM is actually installed,. 

This illusion is sustained via **paging**. The vast virtual address space is sliced into fixed-size blocks called **virtual pages** (typically 4 KB),. The physical RAM is similarly sliced into 4 KB chunks called **page frames**. At any given time, only the actively used virtual pages (the "working set") reside in physical page frames. The rest are parked on the incredibly slow secondary storage (the hard disk or SSD), in an area known as the swap file. 

If the CPU attempts to read a virtual address whose corresponding page is currently on disk, the hardware triggers an exception called a **page fault**,. The operating system traps the fault, pauses the program, evicts an old physical page frame (often using the Clock or LRU algorithm), fetches the requested 4 KB page from the hard drive, and then restarts the instruction,. From the software engineer's perspective, the memory read simply took a very long time; the underlying mechanics are entirely transparent.

Beyond giving the illusion of infinite memory, paging provides strict **memory protection**. Because each process has its own isolated mapping, Process A cannot physically formulate an address that maps to Process B's page frames. The MMU simply forbids it, throwing an access violation exception if attempted,.

## 5.8 Address Translation and the MMU
The translation of a programmer's virtual address into a hardware physical address is performed by the **Memory Management Unit (MMU)**. 

For a 32-bit system using 4 KB ($2^{12}$ bytes) pages, a virtual address is mathematically divided into two parts:
*   **Page Offset:** The lowest 12 bits. This defines the exact byte within the 4 KB page. Because the page size and frame size are identical, the offset requires absolutely no translation. It passes directly to the physical address,.
*   **Virtual Page Number (VPN):** The upper 20 bits. The MMU uses the VPN as an index into a **Page Table** to find the corresponding Physical Page Number (PPN),.

The Page Table is a data structure maintained by the Operating System residing in physical memory. Each Page Table Entry (PTE) contains the mapped Physical Page Number, alongside metadata bits: a Valid bit (is it in RAM or on disk?), a Dirty bit (has it been modified?), and protection bits (Read/Write/Execute permissions),. 

A flat page table mapping 4 GB of space requires $2^{20}$ (over 1 million) entries per process. To avoid wasting megabytes of contiguous RAM just for mapping tables, modern architectures use **multilevel page tables**,. The 20-bit VPN is split again (e.g., into a 10-bit Page Directory Index and a 10-bit Page Table Index),. The CPU first looks up the Page Directory, which points to a secondary Page Table, which finally points to the physical frame. This allows sparse allocation, where page tables for unused memory regions do not need to be instantiated,.

## 5.9 The Translation Lookaside Buffer (TLB)
Hierarchical page tables solve the memory footprint issue but introduce a catastrophic performance problem. Because the page tables are stored in main memory, translating a single virtual address requires two separate physical memory reads (one for the page directory, one for the page table) *before* the CPU can even attempt to read the actual data,. This would triple the execution time of every instruction.

To bypass this penalty, the MMU relies on a specialized cache called the **Translation Lookaside Buffer (TLB)**,,. The TLB is an ultra-fast, fully associative cache placed directly inside the MMU that stores the most recently used Virtual-to-Physical translations,.

When the CPU generates a virtual address, the MMU first blasts the Virtual Page Number into the TLB,. If a TLB Hit occurs (which happens >99% of the time due to spatial and temporal locality), the MMU instantly retrieves the Physical Page Number and synthesizes the physical address in a single clock cycle, completely skipping the page table walk,. 

If a **TLB Miss** occurs, the hardware (or a microcode software trap, depending on the architecture) must perform the expensive "page walk" through the hierarchical tables in DRAM, locate the translation, and load it into the TLB, evicting an older entry,. Because a TLB is fully associative to maximize hit rates and minimize conflict misses, it is hardware-intensive and usually quite small (holding only 64 to 512 entries),. 

For a software engineer, understanding the TLB is critical for high-performance code. If a program randomly accesses memory across thousands of distinct 4 KB pages (e.g., traversing a poorly constructed linked list spread across a large heap), it will cause "TLB thrashing." The TLB will constantly miss, forcing the hardware to perform page table walks, reducing the CPU's throughput to a crawl even if the data itself resides comfortably in the L2 cache.

## 5.10 VirtMCU Homework: Memory Access Profiling
In standard software development on a host operating system, observing the exact microarchitectural penalties of cache misses and TLB thrashing is incredibly difficult. The host OS scheduler interrupts your process randomly, and background tasks continually pollute the L1/L2 caches and TLB, injecting massive amounts of wall-clock jitter into any performance measurement.

For this chapter's homework, you will bypass these abstractions using **VirtMCU FirmwareStudio**. You will analyze memory hierarchy latency utilizing VirtMCU’s deterministic `slaved-icount` mode, which guarantees exact, jitter-free cycle counts.

1.  **Cache Thrashing:** You will be provided with a C program that performs matrix multiplication. You will write two versions of the inner loop: one that iterates through the matrices in row-major order (respecting spatial locality) and one that iterates in column-major order (violating spatial locality). 
2.  **TLB Miss Measurement:** You will write a second program that initializes a large array of structs. One version of your code will traverse the structs sequentially. The second version will traverse the structs using a randomized stride that deliberately jumps across 4 KB page boundaries on every access, intentionally exceeding the TLB's 64-entry capacity.
3.  **Deterministic Cycle Profiling:** You will compile these binaries for bare-metal ARM execution and load them into VirtMCU. By reading the virtual hardware timers in `slaved-icount` mode before and after your execution loops, you will measure the exact nanosecond penalty introduced by cache line fetches and page-table walks. You will document the performance divergence, proving empirically how software data structures interact with physical cache associativity and MMU translation buffers.