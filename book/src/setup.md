# Setting Up the Sandbox

To follow along with this book, you need a reproducible development environment. Embedded development is notorious for "it works on my machine" compiler mismatches. To fix this, we are going to use Docker to containerize our entire toolchain. 

Our sandbox requires GCC cross-compilers (because your x86 or Apple Silicon laptop needs to generate binaries for raw ARM64 and RISC-V targets), **QEMU 11.0.0**, the **VirtMCU** framework, and the **MuJoCo** physics engine. We use a specially augmented version of QEMU 11.0.0 containing the `arm-generic-fdt` patch series, which allows us to dynamically instantiate ARM and RISC-V machines from a Device Tree at runtime without relying on hardcoded C machine structs,.

While the absolute easiest way to get started is to open the VirtMCU repository in VS Code and accept the "Reopen in Container" prompt, here is the exact `Dockerfile` so you can see the magic happening under the hood:

```dockerfile
# Use a stable Ubuntu base image
FROM ubuntu:22.04

# Prevent interactive prompts during apt installations
ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies, Python, Git, and essential tools
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    python3 \
    python3-pip \
    wget \
    curl \
    pkg-config \
    libglib2.0-dev \
    libpixman-1-dev \
    ninja-build \
    && rm -rf /var/lib/apt/lists/*

# Install GCC Cross-Compilers for our target ISAs
RUN apt-get update && apt-get install -y \
    gcc-aarch64-linux-gnu \
    g++-aarch64-linux-gnu \
    gcc-riscv64-unknown-elf \
    g++-riscv64-unknown-elf

# Install Rust (Required for VirtMCU QOM plugins)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.js | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Setup MuJoCo Physics Engine
RUN wget https://github.com/deepmind/mujoco/releases/download/2.3.0/mujoco-2.3.0-linux-x86_64.tar.gz \
    && tar -xzf mujoco-2.3.0-linux-x86_64.tar.gz -C /opt \
    && rm mujoco-2.3.0-linux-x86_64.tar.gz
ENV MUJOCO_DIR="/opt/mujoco-2.3.0"

# Set up the working directory
WORKDIR /workspace
```

### Spinning Up the Environment

Once you have your Docker container running, drop into your bash terminal. We need to pull down the VirtMCU framework, which contains the deterministic network transports (like Zenoh and Unix Domain Sockets) and the QOM plugins that handle cooperative time slaving,.

Execute the following commands in your terminal to fetch the repository and build the custom emulator:

```bash
# 1. Clone the VirtMCU repository 
$ git clone https://github.com/RefractSystems/virtmcu.git
$ cd virtmcu

# 2. Build the VirtMCU framework and patched QEMU
# This will compile the Rust peripheral models as shared libraries (.so)
# that QEMU can dynamically load via its module system.
$ make build

# 3. Verify the build
$ ./build/qemu-system-aarch64 --version
```

**Welcome to the Sandbox.** With VirtMCU compiled, your custom peripheral models will be auto-discovered via QEMU's `--enable-modules` system without requiring you to recompile the entire emulator every time you write a new device,. 

Now that your tools are sharp, turn the page. We have a bare-metal memory map to explore.