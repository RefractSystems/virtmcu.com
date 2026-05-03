# Chapter 13: Security and Resilience in Cyber-Physical Systems

## 13.1 Introduction: Securing Critical Infrastructure
As established in Chapter 9, the transition to Cyber-Physical Systems (CPS 2.0) deeply integrates Operational Technology (OT) with Information Technology (IT), significantly expanding the attack surface of physical infrastructure. While traditional IT security focuses on data confidentiality and privacy, security in a CPS context is fundamentally about maintaining physical control and ensuring the safety and availability of critical services. 

Nowhere is this more evident than in **Critical Energy Infrastructure (CEI)**. Modern energy systems and power grids are constantly under stress from both natural disruptions—such as wildfires and extreme weather events—and sophisticated, targeted cyberattacks. To deal with the ever-increasing challenge posed by these cyber-physical events, we must shift our focus from mere prevention to **resilience**. 

Resilience is defined as the ability to withstand and reduce the magnitude and duration of disruptive events. A resilient CPS possesses the capability to anticipate, absorb, adapt to, and rapidly recover from an attack or failure. This chapter explores the methodologies used to model cyber-physical threats, assess risks, and deploy advanced computational techniques—such as robust optimization, decentralized autonomous controls, and distributed topology reconfiguration—to ensure the survival of critical infrastructure under adversarial conditions.

## 13.2 The Cyber-Physical Threat Landscape
To properly secure a CPS, engineers must understand the underlying assets, their vulnerabilities, and the associated threats. In energy and industrial networks, threats are broad, varying from simple localized faults to complex cascading failures. 

### 13.2.1 Classes of Cyber-Physical Attacks
Adversaries target the cyber-physical feedback loop through several distinct vectors:
*   **Measurement Error Injection:** Attackers inject constant offsets or time-varying errors into sensor readings. If left untreated, these can manipulate control laws and lead to ramp-induced physical attacks.
*   **Replay Attacks:** The measurement output is maliciously intercepted and changed to reflect the value at a previous timestamp, blinding the controller to current physical realities and impacting future decisions.
*   **State Estimation Corruption:** Attackers maliciously alter the estimated quantities required by the system's centralized dispatcher, causing the system to compute incorrect control actions.
*   **Coordinated Attacks:** Attackers gain access to multiple critical information nodes and launch simultaneous threats from multiple sources in a coordinated manner, designed to overwhelm standard fault-tolerance mechanisms.

### 13.2.2 Threat Modeling and Attack Trees
To analyze these complex vulnerabilities, security architects utilize **Attack Trees**. An attack tree is a model that formalizes the structure of well-known cyber-physical attacks, detailing the exact steps an attacker must take. 

For example, consider the cascading threat of cutting a city's water supply through the electrical grid. The attack tree demonstrates that the water supply can be cut if the water pumps are stopped and the reservoir is drained. The pumps stop if the primary power supply is cut *and* the backup power supply is disabled. The power supply itself can be interrupted maliciously by compromising a substation either physically or through cyber means. By mapping these steps using AND/OR logic gates, engineers can identify the critical nodes where design-time countermeasures (e.g., adding redundancy) or run-time mitigations (e.g., dynamic isolation) must be applied.

Furthermore, engineers must continuously evaluate **unknown threats**. These are addressed by exploring various conceptual spaces: the *threat space* (newly discovered vulnerabilities), the *attack space* (new attacker tools and methods), and the *technology space* (novel threats introduced by emerging technologies like autonomous drones or IoT automation).

## 13.3 Risk Management and Evaluation
Once threats are modeled, they must be assessed for their potential impact. The standard risk management process for critical infrastructure is based on **ISO/IEC 27005**. This process includes:
1.  **Context Establishment:** Defining the scope, identifying assets, and mapping threats to those assets.
2.  **Risk Assessment:** Estimating the risk based on the likelihood of the threat exploiting a vulnerability and the severity of the harmful result. 
3.  **Risk Treatment & Acceptance:** Preparing a mitigation plan and acknowledging any residual risks.

Risk estimation combines the human, economic, and social impact with the risk's likelihood. A qualitative approach is often used, categorizing impact from "minimal" to "severe" (levels 1 to 5) and likelihood from "rare" to "almost certain" (e.g., 1% to 80% probability).

## 13.4 Advanced Computational Techniques for Resilience
Traditional risk mitigation relies heavily on fortifying networks. However, in CPS 2.0, adversarial events are notoriously hard to predict and reliable historical data is often sparse. Attempting to make a system invulnerable to every possible disruption makes the operation overly conservative and economically impractical. Instead, modern CPS architecture relies on advanced computational techniques to guarantee resilience dynamically.

### 13.4.1 Distributionally Robust Optimization (DRO)
To handle uncertainty in system parameters and adversarial forecasts, systems utilize stochastic optimization. **Distributionally Robust Optimization (DRO)** is a probabilistic method that determines the exact amount of reserves required to deal with cyber-physical events in a resilient and cost-effective manner.

Rather than planning for a single worst-case scenario, DRO considers a bounded set of uncertainty $\Omega$ and optimizes the system's response across a probability distribution of potential disruptions. By integrating these probabilistic models, the CPS dispatcher ensures sufficient dispatchable resources are available to absorb the impact of an attack without collapsing the grid.

### 13.4.2 Decentralized Autonomous Controls
During severe cyber-physical attacks, centralized communication networks may be congested, compromised, or entirely unavailable. To survive, the decision-making agents within the network must be able to act autonomously and collaboratively. This is achieved through minimally invasive, decentralized control layers:
*   **Proactive Autonomy:** These controls continuously guarantee that the system operates within strict safety limits during likely, bounded disturbances. By utilizing mathematical proofs (such as Nagumo’s theorem), proactive autonomy ensures the system's operational viability without requiring communication with a central coordinator.
*   **Reactive Autonomy:** When a high-impact, low-probability adversarial event thrusts the system state outside the safe operating regime, reactive autonomy takes over. Reactive control involves computing control inputs in real-time—often by efficiently solving for energy functions—to steer the highly nonlinear dynamics of the system back into a safe region as quickly as possible.

Together, these autonomous controls act as a bridge between myopic local sensors and the centralized dispatcher, ensuring that a communication failure does not result in physical destruction.

## 13.5 Network Reconfiguration and Resilient Learning
In distributed critical infrastructure, such as interconnected microgrids, resilience can be further enhanced by dynamically altering the physical topology of the system to isolate attacked segments.

### 13.5.1 Topology Reconfiguration via Distributed OPF
If a portion of the grid is compromised by a cyberattack, local controllers must determine the optimal physical interconnection topology to island the threat while minimizing generation costs and line losses. This requires solving a **Distributed Optimal Power Flow (OPF)** problem. 

Because attackers may simultaneously target the controllers themselves, resilient consensus algorithms are utilized. These algorithms allow each microgrid to exchange optimal objective functions with neighboring grids via Peer-to-Peer (P2P) communication. To solve these complex distributed equations rapidly, techniques such as the **Alternating Direction Method of Multipliers (ADMM)** are heavily utilized, ensuring convergence even when parts of the network are untrusted.

### 13.5.2 Resilient Reinforcement Learning
Modern energy infrastructure heavily integrates inverter-based resources, such as solar panels and battery storage. These utilize **Grid-Forming (GFM)** inverters, modeled as AC voltage sources with local frequency and voltage control signals governed by droop controls. 

To optimize these distributed resources under attack conditions where data sharing is limited or unsafe, researchers are deploying Reinforcement Learning (RL) and Federated Learning (FL). These data-driven, machine learning techniques allow the localized controllers to collaboratively learn optimal resilient policies without transmitting sensitive, interceptable state data across the network.

## 13.6 VirtMCU Homework: Attack Tree Modeling and Resilient Recovery
*(Note: This exercise builds on our established course framework using the VirtMCU firmware studio, applying the theoretical concepts of this chapter to a simulated environment).*

In Chapter 11, you designed a PID control loop to stabilize an inverted pendulum. In this chapter's homework, you will subject that continuous-time control loop to a simulated cyber-physical attack to evaluate its resilience.

**Your Assignment:**
1.  **Attack Tree Construction:** Draft a formal Attack Tree outlining the steps an attacker would take to destabilize your inverted pendulum. Include nodes for both cyber vectors (e.g., compromising the PWM duty cycle communication via a buffer overflow) and physical vectors (e.g., injecting false quadrature encoder data). 
2.  **Implementation of a Replay Attack:** Modify your firmware to simulate a state estimation corruption. At exactly 5.0 seconds into the simulation, your code must freeze the angular sensor reading $\theta(t)$ to its last known value, blinding the PID controller to the true physical state. Observe how rapidly the system fails.
3.  **Reactive Autonomy (Fallback Control):** Implement a secondary, decentralized fallback control law. You will monitor the raw derivative of the cart's wheel velocity. If the discrepancy between the expected cart position and the stale $\theta(t)$ reading exceeds a threshold, your firmware must automatically trigger a "Reactive Autonomy" state, overriding the primary PID loop with an aggressive braking maneuver to bring the system to a safe halt.
4.  **Deterministic Evaluation:** Run the simulation in VirtMCU's `slaved-icount` mode. Because virtual time is strictly deterministic, you must provide a cycle-accurate report of your Reactive Autonomy detection latency (the exact number of instructions between the attack injection and the override engagement), proving your system can reliably recover from a sensor-blinding attack within the physical constraints of the hardware.