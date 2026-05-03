# Appendix B: Selected Answers to VirtMCU Exercises

**Chapter 3: Stack Tracing and Deterministic Execution**
*Solution Note:* When executing the recursive factorial function in VirtMCU `slaved-icount` mode, students should observe that the Link Register (`X30`) is pushed to the stack exactly 16 bytes below the previous Frame Pointer (`X29`). Because `slaved-icount` ties the virtual clock strictly to retired instructions, inspecting the cycle counter before and after the recursive calls will yield an identical delta on every simulation run, free from host OS jitter.

**Chapter 7: Deterministic Interrupt Handler**
*Solution Note:* Students must successfully construct the Vector Table to point to their ISR. Inside the ISR, the code must execute `stp x0, x1, [sp, #-16]!` (and subsequent saves) to preserve the volatile registers. Failing to acknowledge and clear the simulated push-button peripheral's IRQ flag in the MMIO register will result in an infinite interrupt loop upon executing the return instruction.

**Chapter 11: Inverted Pendulum Co-Simulation**
*Solution Note:* The continuous-time MuJoCo physics engine relies on the VirtMCU Sensor Abstraction Layer (SAL) to discretize angles into 12-bit simulated quadrature encoder pulses. Students must apply a Proportional-Integral-Derivative (PID) algorithm in C. Saturation in the Actuator Abstraction Layer (AAL) means that if the proportional gain ($k_p$) is set too high, the requested PWM duty cycle will clip, causing integral windup and leading to the pendulum crashing.