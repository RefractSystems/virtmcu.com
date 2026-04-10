# Virtmcu Project Goals & Information

## Core Value Proposition

**"The High-Performance Bridge for Digital Twins"**
Virtmcu is a specialized framework designed to bridge the gap between Renode's flexible platform descriptions and QEMU's high-performance execution. It enables embedded systems engineers and digital twin developers to run complex hardware simulations with deterministic timing and native speed.

## Key Features

- **Dynamic Hardware Modeling:** Instantiates full ARM machines from Device Tree Blobs (DTB) at runtime, eliminating the need to recompile the emulator for hardware changes.
- **Renode Parity:** Provides a `repl2qemu` translation layer that converts Renode `.repl` files into QEMU-compatible hardware descriptions.
- **Digital Twin Synchronization:** Uses the Zenoh protocol for lockstep clock synchronization between QEMU and external physics engines (e.g., MuJoCo).
- **Native QOM Plugins:** Supports custom peripheral models written in C or Rust, integrated directly into the QEMU Object Model (QOM) for maximum performance.
- **Test Compatibility:** Maintains full compatibility with Robot Framework and pytest, allowing Renode-style tests to run on QEMU.

## Target Audience

- **Embedded Systems Engineers:** Requiring fast, deterministic simulation for firmware development and CI/CD pipelines.
- **Digital Twin Developers:** Needing causal consistency between embedded firmware and physical world simulations.
- **Robotics Engineers:** Integrating firmware-in-the-loop (FIL) with high-fidelity physics simulators.
- **Renode Users:** Looking for QEMU-level execution speed without sacrificing Renode's platform flexibility.

## Technical Details

- **Base:** QEMU 11.0.0-rc3 with `arm-generic-fdt` patches.
- **Tooling:** Python (repl2qemu), Zenoh (Sync), C/Rust (Peripheral Models).
- **Integration:** Robot Framework, Pytest.
- **License:** GPL-2.0 (matching QEMU).

## Landing Page Strategy

- **Visual Hook:** "Hardware Abstraction" or "Interconnected Nodes" metaphor.
- **Primary Contrast:** "Slow/Rigid Simulation" vs. "Fast/Dynamic Virtmcu-Powered Simulation."
- **USP:** Running Renode `.repl` files at QEMU speeds with Digital Twin sync.
- **Trust Pillar:** "Native Performance" and "GPL-2.0 Open Source."
- **Primary CTA:** "Read the Architecture Docs" and "View on GitHub."
