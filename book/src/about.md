# About This Book

**Who This Book Is For**
This book is intended for software developers, systems programmers, computer science professionals, and engineering students who want to understand the architecture and design principles underlying modern computer systems—from tiny embedded IoT devices to warehouse-sized cloud server farms. 

If you already know how to write a `while` loop in C, C++, or Python, but you have never configured a hardware peripheral or written an OS device driver, you are in the right place. We assume you are comfortable with the standard edit/compile/test/debug cycle and know your way around a command-line interface. You do not need a background in electrical engineering, nor do you need to know how to dope a semiconductor with phosphorus. We focus exclusively on the programmer's view of the hardware.

**What You Will Learn**
We bridge the gap between high-level software and raw silicon. You will learn to read and write **AArch64** and **RISC-V** assembly language, not because you should write entire applications in assembly, but because you need it as a scalpel to access hardware features the C compiler doesn't know about,. You will master the memory map, understand how the Advanced Microcontroller Bus Architecture (AMBA) AXI interconnect actually routes your data, and discover how to write control loops that interact with the physical world through sensor and actuator abstraction layers. 