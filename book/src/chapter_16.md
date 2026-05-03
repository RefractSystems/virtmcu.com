
# Appendix A: Instruction Set Architecture (ISA) Reference

This appendix provides a quick reference for the primary Instruction Set Architectures utilized in this text: ARM AArch64 and RISC-V (RV32I).

## A.1 ARM AArch64 (A64) Instruction Subset
The ARMv8-A architecture introduced the 64-bit AArch64 execution state. 

**Data Transfer (Load/Store)**
*   `ldr Xd, [Xn, offset]`: Load a 64-bit doubleword from the memory address (`Xn` + `offset`) into register `Xd`.
*   `str Wd, [Xn, offset]`: Store a 32-bit word from register `Wd` into memory.
*   `ldp / stp`: Load/Store Pair. Pushes or pops two registers simultaneously, heavily used in stack frame prologues and epilogues (e.g., `stp fp, lr, [sp, #-16]!`).

**Arithmetic and Logic**
*   `add Xd, Xn, Xm`: `Xd = Xn + Xm`. (Use `adds` to update PSTATE condition flags).
*   `sub Xd, Xn, Xm`: `Xd = Xn - Xm`. (Use `subs` to update flags).
*   `mul Xd, Xn, Xm`: `Xd = Xn * Xm`.
*   `and / orr / eor`: Bitwise AND, OR, and Exclusive-OR.

**Control Flow**
*   `cmp Xn, Xm`: Compare (implicitly performs `subs` and updates flags without storing the result).
*   `b label`: Unconditional branch to `label`.
*   `beq / bne / blt / bgt`: Conditional branches (Branch if Equal, Not Equal, Less Than, Greater Than).
*   `bl label`: Branch with Link. Stores the return address in the Link Register (`LR`/`X30`) and jumps to `label` (used for function calls).
*   `ret`: Return from subroutine. Copies `LR` to the Program Counter (`PC`).

## A.2 RISC-V (RV32I) Base Instruction Subset
RISC-V is an open-source ISA that heavily utilizes pseudo-instructions to minimize silicon decoder complexity. 

**Core Instructions**
*   `addi rd, rs1, imm`: Add immediate. `rd = rs1 + imm`.
*   `lui rd, imm`: Load Upper Immediate. Places a 20-bit value into the highest 20 bits of `rd`.
*   `auipc rd, imm`: Add Upper Immediate to PC.
*   `jal rd, offset`: Jump and Link. Jumps to PC + `offset` and saves the return address in `rd` (usually `x1` / `ra`).
*   `beq / bne rs1, rs2, offset`: Branch if `rs1` == (or !=) `rs2`.

**Common Pseudo-Instructions**
*   `nop`: Translates to `addi x0, x0, 0`.
*   `mv rd, rs`: Translates to `addi rd, rs, 0`.
*   `not rd, rs`: Translates to `xori rd, rs, -1`.
*   `j offset`: Translates to `jal x0, offset`.