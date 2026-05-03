# Chapter 8: Closing the Loop: Digital Control Systems

If you have survived the first seven chapters of this book, you know how to write bare-metal code, how to configure hardware timers, and how to use an RTOS to guarantee hard real-time execution deadlines. You have built a perfectly deterministic digital brain. 

But a Cyber-Physical System (CPS) is useless if it cannot interact with the physical world. In this chapter, we bridge the gap. We are going to connect your deterministic software to messy, unpredictable physical reality. We will explore how to safely read analog sensors, how to drive physical actuators, and how to write a production-ready Proportional-Integral-Derivative (PID) controller in C to keep a drone in the air or a robotic arm perfectly stabilized.

## 8.1 Sensing and Actuation (SAL/AAL)

In standard software engineering, we rely on a Hardware Abstraction Layer (HAL) to hide the ugly details of the silicon. In a CPS, we must go one step further. We need a **Sensor Abstraction Layer (SAL)** and an **Actuator Abstraction Layer (AAL)** to hide the ugly details of physics.

The physical world is continuous, chaotic, and governed by thermodynamic laws. When we attempt to measure it or manipulate it using a microcontroller, we immediately slam into three fundamental artifacts of reality: sensor noise, quantization error, and actuator saturation. 

### 8.1.1 Quantization Error

To a microcontroller, the physical world does not exist as a continuous spectrum of voltages. It only exists as discrete integers. 

When you read a temperature sensor or a gyroscope, an Analog-to-Digital Converter (ADC) samples the continuous electrical voltage and converts it into a digital number. However, an ADC has a fixed resolution. A typical 12-bit ADC can only represent a voltage using $2^{12}$ (4,096) discrete steps. 

If your ADC operates over a 0 to 3.3V range, each step represents exactly 0.0008V. If the actual physical sensor outputs 1.0004V, the hardware cannot represent it. The ADC will round it to the nearest available integer bucket. This forced rounding is called **quantization error**. 

To your software, quantization error looks like a high-frequency, low-amplitude staircase effect on your data. If you attempt to calculate the derivative (the rate of change) of a heavily quantized signal, the math will explode into massive spikes every time the signal jumps from one discrete step to the next.

### 8.1.2 Sensor Noise

Beyond the structural limits of the ADC, you must deal with actual electrical noise. Physical measurements are constantly perturbed by thermal fluctuations, electromagnetic interference (EMI) from nearby motors, and signal cross-talk.

If you plot the raw output of a drone's accelerometer while the motors are spinning, it will not look like a smooth line; it will look like a chaotic vibration. If you feed this raw, noisy data directly into a control algorithm, your actuators will violently chatter as they attempt to respond to the random noise, tearing your mechanical linkages apart.

> **TIP: Never Trust a Raw Sensor**
> Your SAL should never hand raw, unfiltered ADC readings to your control loop. You must implement digital signal processing, such as a low-pass filter or an Exponential Moving Average (EMA), to attenuate high-frequency noise and smooth out quantization artifacts before the data hits your physics math. 

### 8.1.3 Actuator Saturation

On the output side of the loop, you face physical limitations. 

Mathematical control theories assume that you can apply infinite force to correct an error. Reality vehemently disagrees. Motors have a maximum RPM, hydraulic valves have a maximum flow rate, and Pulse-Width Modulation (PWM) signals have a hard limit of 100% duty cycle. 

When your software calculates that it needs to apply 150 Volts to a motor to correct a sudden gust of wind, but your battery can only supply 24 Volts, your system has entered **actuator saturation**. When an actuator saturates, the linear mathematics behind your control system temporarily break down. If your software is not explicitly designed to handle this, it can lead to catastrophic failures like *integral windup*, which we will solve in the next section.

***

## 8.2 PID Control in C

Now that we understand the imperfections of our sensors and actuators, we need an algorithm that can actually control a physical process. The undisputed king of industrial control is the **Proportional-Integral-Derivative (PID) controller**. 

A PID controller looks at the current state of a system (e.g., the current angle of a drone), compares it to the desired target state (the *setpoint*), and calculates an error value. It then computes a control output by combining three separate mathematical reactions to that error.

1.  **Proportional ($K_p$):** Reacts to the *present* error. If the drone is tilted far to the left, push hard to the right. 
2.  **Integral ($K_i$):** Reacts to the *past* error. If the drone has been slightly tilted to the left for a long time, slowly build up a corrective force to overcome whatever constant wind or unbalanced weight is causing the persistent error.
3.  **Derivative ($K_d$):** Reacts to the *future* (the rate of change) of the error. If the drone is rapidly swinging back toward level flight, apply the brakes to prevent it from overshooting the target.

### 8.2.1 From Calculus to C

In continuous-time mathematics, the PID equation is a beautiful piece of calculus:

$$u(t) = K_p e(t) + K_i \int e(t)dt + K_d \frac{de(t)}{dt}$$

However, a C compiler does not know how to evaluate a continuous-time integral. Because our RTOS runs this control loop at discrete intervals (e.g., exactly once every 10 milliseconds), we must translate this calculus into discrete-time algebra using Euler approximations.

*   The continuous integral $\int e(t)dt$ becomes a running sum of the errors multiplied by the sample time: $\sum (e_k \cdot \Delta t)$.
*   The continuous derivative $\frac{de(t)}{dt}$ becomes the difference between the current error and the previous error, divided by the sample time: $\frac{e_k - e_{k-1}}{\Delta t}$.

### 8.2.2 The Production-Ready PID Implementation

Here is a complete, battle-tested C implementation of a PID controller. Unlike textbook examples, this code includes structural guards against real-world artifacts, specifically an anti-windup mechanism to handle actuator saturation.

```c
#include <stdint.h>

// The internal state of our PID controller
typedef struct {
    float kp;             // Proportional gain
    float ki;             // Integral gain
    float kd;             // Derivative gain
    
    float dt;             // Sample time in seconds (e.g., 0.01f for 100Hz)
    
    float integral_sum;   // Running accumulation of past errors
    float prev_error;     // The error from the previous loop iteration
    
    float out_min;        // Actuator saturation lower limit
    float out_max;        // Actuator saturation upper limit
} pid_controller_t;

// Initialize the controller with tuned gains and hardware limits
void pid_init(pid_controller_t *pid, float p, float i, float d, 
              float sample_time, float min, float max) {
    pid->kp = p;
    pid->ki = i;
    pid->kd = d;
    pid->dt = sample_time;
    pid->integral_sum = 0.0f;
    pid->prev_error = 0.0f;
    pid->out_min = min;
    pid->out_max = max;
}

// Compute the control output for the current time step
float pid_compute(pid_controller_t *pid, float setpoint, float measured_value) {
    
    // 1. Calculate the current error
    float error = setpoint - measured_value;
    
    // 2. Compute the Proportional term
    float p_term = pid->kp * error;
    
    // 3. Compute the Integral term (with Anti-Windup)
    pid->integral_sum += (error * pid->dt);
    float i_term = pid->ki * pid->integral_sum;
    
    // ANTI-WINDUP: Clamp the accumulated integral to the actuator limits.
    // If we don't do this, a blocked motor will cause the integral 
    // to grow to infinity, rendering the system uncontrollable.
    if (i_term > pid->out_max) {
        i_term = pid->out_max;
        pid->integral_sum = i_term / pid->ki; 
    } else if (i_term < pid->out_min) {
        i_term = pid->out_min;
        pid->integral_sum = i_term / pid->ki;
    }
    
    // 4. Compute the Derivative term
    float derivative = (error - pid->prev_error) / pid->dt;
    float d_term = pid->kd * derivative;
    
    // 5. Compute the total raw control output
    float output = p_term + i_term + d_term;
    
    // 6. Clamp the total output to the physical actuator saturation limits
    if (output > pid->out_max) {
        output = pid->out_max;
    } else if (output < pid->out_min) {
        output = pid->out_min;
    }
    
    // 7. Save the current error for the next loop iteration's derivative
    pid->prev_error = error;
    
    return output;
}
```

### 8.2.3 Line-by-Line Math-to-Code Walkthrough

Let's dissect the `pid_compute` function to see exactly how the mathematics map to the silicon.

**Step 1: The Error Calculation**
```c
float error = setpoint - measured_value;
```
This is the heart of closed-loop feedback. We subtract our SAL-filtered sensor reading (`measured_value`) from where we want to be (`setpoint`). 

**Step 2: The Proportional Term**
```c
float p_term = pid->kp * error;
```
This directly mirrors $K_p e(t)$. It provides the immediate "push" against the error. 

**Step 3: The Integral Term & Anti-Windup**
```c
pid->integral_sum += (error * pid->dt);
float i_term = pid->ki * pid->integral_sum;
```
This is our Euler integration. On every RTOS tick, we calculate the rectangular area of the current error (`error * dt`) and add it to our running total. We then multiply the whole accumulated sum by $K_i$. 

> **WARNING: The Integral Windup Trap**
> Look closely at the `if (i_term > pid->out_max)` block. Imagine your drone gets its landing gear caught on a tree branch. The `error` remains high because the drone cannot reach its target altitude. The integral term will blindly sum up that error every 10 milliseconds, growing to an astronomically massive number. 
> 
> If the drone suddenly breaks free from the branch, the massive accumulated integral will command the motors to fire at maximum thrust, rocketing the drone into the stratosphere. It will take several seconds of *negative* error just to "unwind" the massive integral sum back to zero. By forcefully clamping the `integral_sum` variable so that it can never exceed the physical capabilities of our actuators (`out_max`), we solve the windup hazard completely.

**Step 4: The Derivative Term**
```c
float derivative = (error - pid->prev_error) / pid->dt;
float d_term = pid->kd * derivative;
```
This translates the continuous derivative $\frac{de(t)}{dt}$. By subtracting the error from 10 milliseconds ago (`prev_error`) from the current error, we find the trajectory of the system. If the error is rapidly shrinking, this term becomes negative, actively fighting the Proportional term and acting as a much-needed brake to prevent overshooting.

**Steps 5 & 6: Actuator Saturation Clamping**
```c
float output = p_term + i_term + d_term;
if (output > pid->out_max) output = pid->out_max;
```
Finally, we sum the three terms. But before we hand this value off to the Actuator Abstraction Layer (AAL), we must enforce reality. If the math demands 120% motor power, we clamp it to the physical limit (e.g., 100%) so that our low-level PWM drivers do not overflow or behave unpredictably.

**Step 7: State Preservation**
```c
pid->prev_error = error;
```
Because a discrete-time controller relies on historical context to compute derivatives, we must save the current error to the `pid_controller_t` memory struct before exiting the function, ready for the next RTOS tick.