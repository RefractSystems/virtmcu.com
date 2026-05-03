# Chapter 12: Scaling Up: GPUs, TPUs, and LLM Hardware

If you survived the custom silicon in Chapter 11, you now know how to design a highly optimized, low-power Domain-Specific Architecture (DSA) for the edge. You’ve squeezed every last milliwatt out of your battery-powered sensor. 

But what happens when the intelligence you need simply won't fit on the edge? What happens when your neural network doesn't have thousands of parameters, but *hundreds of billions*? 

You can no longer rely on a single chip. You must move to the cloud. In this chapter, we leave the constrained world of the edge and enter the gigawatt realm of the datacenter. We will explore the specialized silicon—GPUs, TPUs, Tensor Cores, and High Bandwidth Memory (HBM)—that makes Large Language Models (LLMs) like GPT-2 and GPT-4 possible. We will look at how the mathematical elegance of the Transformer architecture maps directly to physical silicon, and how engineers lash thousands of these chips together to build a single, planetary-scale brain.

## 12.1 The Datacenter *Is* the Computer

When scaling up to train massive AI models, you must abandon the idea of the "computer" sitting on a desk or in a rack. As defined by Hennessy and Patterson, for hyperscale cloud providers, the **Warehouse-Scale Computer (WSC)** is the fundamental unit of design. 

A WSC consists of 50,000 to 100,000 servers, tightly coupled by a hierarchical network, all operating as a single massive system. At this extreme scale, the line between hardware, software, networking, and the physical building itself blurs completely. The electrical substations, the battery backups, and the cooling towers—which evaporate massive amounts of water or use massive dry coolers to reject heat—are just as critical to the computer architecture as the CPU pipelines. 

> **WAR STORY: The Power Wall Meets the Warehouse**
> A single rack filled with high-performance AI servers can consume 50 to 100 kilowatts of electricity. At WSC scale, operational expenses (OPEX)—specifically the cost of electricity and the amortized cost of the cooling infrastructure—can represent over 30% of the facility's total cost over 10 years. You cannot just build a massive AI datacenter anywhere; you must build it where electricity is cheap, network optical fiber is dense, and the environment provides natural cooling assistance.

To execute massive AI workloads efficiently within these power limits, WSC architects deploy heavily specialized Domain-Specific Architectures (DSAs), primarily high-end GPUs and Google's Tensor Processing Units (TPUs). Let's examine the silicon inside these massive chips.

## 12.2 Feeding the Beast: High Bandwidth Memory (HBM)

The biggest bottleneck in AI is not computation; it is memory bandwidth. An AI accelerator is useless if it spends 99% of its clock cycles waiting for data to arrive from DRAM. 

Historically, processors accessed memory through double data rate (DDR) channels. However, physical pins on a CPU package are limited, and pushing signals across long copper traces on a motherboard requires excessive power and limits transmission speeds. 

The solution is **High Bandwidth Memory (HBM)**. Instead of placing memory chips horizontally across a motherboard, HBM stacks 4 to 16 DRAM dies vertically directly on top of a base logic die. This 3D stack is placed inside the exact same physical package as the GPU or TPU, sitting right next to the processor on a silicon "interposer".

The chips in an HBM stack are connected by microscopic vertical wires drilled straight through the silicon, known as *Through-Silicon Vias* (TSVs). Because the wires are microscopic and the distance is practically zero, the bus can be incredibly wide. A single HBM3E cube provides a 1,024-bit wide data bus. When a high-end GPU like the NVIDIA Hopper H100 surrounds itself with multiple HBM stacks, it achieves a mind-bending peak memory bandwidth of over 3,000 Gigabytes per second (3 TB/s). 

The tradeoff? HBM is incredibly expensive and difficult to cool, which severely limits its total capacity. An NVIDIA A100 might have a blistering 1.5 TB/s of bandwidth, but it only has 40 GB to 80 GB of capacity. As we'll see shortly, this capacity limit is the central hardware constraint when deploying LLMs.

## 12.3 Heavy Metal: Tensor Cores and Systolic Arrays

Once the HBM delivers the data to the processor, the silicon must crunch the numbers. Deep Neural Networks, at their core, are just massive sequences of matrix multiplications. To accelerate this, hardware designers have fundamentally changed the execution units.

### NVIDIA Tensor Cores
Modern NVIDIA GPUs (like Volta, Ampere, and Hopper architectures) partition their streaming multiprocessors into specialized units called **Tensor Cores**. 

A traditional floating-point ALU takes two numbers, multiplies them, and adds them to an accumulator. A Tensor Core takes two *4x4 matrices*, multiplies them together, and adds them to a 4x4 accumulator matrix—all in a single clock cycle. 

To accomplish this 4x4x4 matrix multiply-accumulate, a single Tensor Core executes 64 floating-point operations per clock cycle. The hardware utilizes purely combinational logic, relying on aggressive pipelining and physical circuit design to blast through the math instantly. Furthermore, these cores aggressively support reduced precision (Quantization). They dynamically crunch 16-bit floating point (FP16 or BF16) or even 8-bit formats (FP8) to double or quadruple throughput, while accumulating the results in 32-bit registers to maintain neural network stability.

### Google TPUs and Systolic Arrays
Google's Tensor Processing Units (TPUs) take matrix multiplication to an even further extreme by reviving an architectural concept from the 1980s: the **Systolic Array**.

Inside a TPU v4 is a massive Matrix Multiply Unit (MXU) consisting of a 128x128 grid of multiply-accumulate (MAC) ALUs. If you use standard CPU registers to feed 16,384 ALUs every clock cycle, the register file fetch overhead will consume more energy than the math itself. 

Instead, a systolic array passes data directly from one ALU to its physical neighbor. The weights of the neural network are pre-loaded into the 128x128 grid. Then, the input data flows into the left side of the array and moves sequentially to the right, one step per clock cycle, like blood pumping through a human circulatory system (hence the name "systolic"). As the data washes over the grid in a diagonal wavefront, each cell multiplies the input by its stored weight and passes the partial sum down to the next row. 

Because data is read from memory only once and passed from neighbor to neighbor, the systolic array achieves staggering energy efficiency and allows the TPU v4 to pack 131,072 MACs onto a single chip.

## 12.4 Mapping the Transformer to Silicon

How does all this hardware handle an actual Large Language Model? Let's break down the mechanics of the **Transformer** architecture—the breakthrough neural network behind models like GPT-2, GPT-4, and Gemini—and map it directly to the silicon.

We will use the original small GPT-2 model (124 million parameters) as our baseline to keep the math comprehensible, knowing that massive modern LLMs simply scale these exact same structural dimensions up by factors of a thousand.

When you type a prompt into an LLM, the text is first converted into discrete integer numbers called **Tokens**. GPT-2 uses a vocabulary of 50,257 possible tokens. The hardware translates your prompt into a matrix, where each row is a token, and each column is a 768-element floating-point vector representing the "meaning" of that token (the *Token Embedding*). Because the Transformer processes everything in parallel, the hardware injects a *Positional Encoding* matrix so the model knows the sequential order of the words.

This matrix is then fed through a sequence of identical Transformer Blocks. The heavy lifting inside a Transformer block happens in two primary phases:

### Phase 1: The Attention Block
The Attention block determines how much "attention" every word in your prompt should pay to every *other* word.
1. **Linear Projection:** The hardware takes the input matrix and blasts it through three massive matrix multiplications using learned weight matrices. This creates three new matrices: $Q$ (Query), $K$ (Key), and $V$ (Value). For GPT-2, multiplying the 1,024x768 input by a 768x768 weight matrix takes roughly 600 million MAC operations. This is a perfect workload for an HBM-fed systolic array.
2. **Attention Scores:** The hardware multiplies the Query matrix by the transpose of the Key matrix ($Q \times K^T$). This calculates the relevance between every word and every other word. The hardware then applies a masking operation so words cannot "look ahead" into the future, followed by a Softmax normalization. 
3. **Applying Attention:** The resulting score matrix is multiplied by the Value ($V$) matrix, producing an output that contains the context-aware meaning of the sequence. 

### Phase 2: The Multi-Layer Perceptron (MLP)
After the attention block, the data flows into a dense feedforward Multi-Layer Perceptron (MLP).
1. **Expansion:** The hardware performs another massive matrix multiplication to expand the 768-column matrix to 3,072 columns.
2. **Non-Linearity:** A non-linear activation function called GELU (Gaussian Error Linear Unit) is applied to every element. Unlike standard ReLU, GELU has a smooth curve around zero, which empirical testing shows helps LLMs learn complex language patterns.
3. **Contraction:** A final matrix multiplication shrinks the matrix back down from 3,072 columns to 768 columns. In GPT-2, this MLP block alone requires nearly 58 billion MACs per word generation.

Finally, after passing through all the Transformer blocks, the hardware performs one last matrix multiplication against the 50,257-token vocabulary. The highest probability score (the *logit*) dictates the exact next word the LLM outputs to your screen. Then, that word is appended to your prompt, and the *entire massive process runs again* to generate the next word.

## 12.5 Sharding the Beast: Scaling to Trillions of Parameters

If GPT-2 small requires 124 million parameters, it easily fits into the memory of a standard GPU. But modern LLMs (like GPT-4) contain hundreds of billions or even trillions of parameters. 

Even if you aggressively quantize the weights to 8-bit formats (1 byte per parameter), a 175-billion parameter model requires 175 Gigabytes of memory *just to hold the weights*—not counting the memory needed for the runtime calculations (the KV cache). This exceeds the HBM capacity of any single GPU in existence.

To run these models, WSC architects must stitch dozens or thousands of chips together into an LLM supercomputer. The fundamental approach is called **Sharding**—slicing the massive model into smaller shards distributed across multiple GPUs or TPUs.

There are three primary ways to shard an LLM across a datacenter:
1. **Pipeline Sharding:** You place Transformer blocks 1 through 10 on GPU A, blocks 11 through 20 on GPU B, and so on. GPU A processes the attention math, then streams the intermediate matrix over the network to GPU B, forming a massive factory assembly line.
2. **Sequence Sharding (Tensor Parallelism):** The massive matrix multiplications are sliced vertically or horizontally. GPU A computes the left half of the matrix multiplication, while GPU B computes the right half. They synchronize their partial sums over ultra-high-speed interconnects (like NVIDIA's NVLink, which provides 900 GB/s between chips) to produce the final matrix. 
3. **Expert Sharding:** Modern LLMs often use a *Mixture of Experts* (MoE) architecture. Instead of one massive MLP block, the model has dozens of smaller "expert" blocks. A router network sends math/logic tokens to the "math expert" residing on GPU A, and poetry tokens to the "poetry expert" residing on GPU B. This drastically reduces the number of parameters loaded for any single token.

By combining HBM, Tensor Cores, and massive multi-dimensional sharding over optical datacenter networks, the modern Warehouse-Scale Computer transforms the abstract mathematics of the Transformer architecture into the seemingly intelligent chatbots we interact with every day.