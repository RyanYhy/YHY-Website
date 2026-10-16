---
title: 'Operating System Fundamentals: A Review (1)'
linkTitle: OS Fundamentals (1)
description: Using image resizing to understand programs, jobs, processes, and threads, then distinguish concurrency, parallelism, and synchronous and asynchronous calls.
date: 2026-10-16
tags: [Operating systems, Study notes, Processes, Concurrency, Asynchronous programming]
---

Today I went back over programs, jobs, processes, concurrency, parallelism, and synchronous and asynchronous calls. I could remember roughly what each term meant, but when I put them together, I still wasn't clear on what each one actually described.

On my second pass, I found it easier to start with one question: **What is this concept meant to explain?** I'll use that question to work through their differences.

![Illustration comparing programs, jobs, and processes, with examples of concurrency, parallelism, and asynchronous execution](cover.png)
{caption="First distinguish the work, the method, and its execution; then look at how multiple tasks make progress"}

## Programs, jobs, and processes {#program-job-process}

What I most wanted to separate was the method described by a program, the work requested from the system, and the execution of that work. Which concept describes each of these?

### A program describes a method {#program}

More precisely, a program consists of instructions and related data organized to perform certain tasks. It records a method and tells the computer what to do.

For example, some image-resizing code might specify how to read an image, calculate its new dimensions, and output the result. That program exists even before it runs.

So when I think about a program, I focus first on the method it describes. Whether it is stored on disk or loaded into memory is a separate question.

### A job describes the complete work request {#job}

A job was the concept I initially found hardest to understand. A concrete example helped make it clearer.

Suppose I want to resize two images. Having the resizing program is only part of the request: I also need to specify which images to process, the scaling ratio, and where to save the results. If there are several processing steps, their requirements and order matter too.

In the batch-processing context of operating system textbooks, a job can be understood as a complete unit of work submitted to the system. It includes the necessary programs, data, and control information.

In other words, **a program describes how to do something; a job describes the work I want the system to carry out.**

One thing to keep in mind is that "task" has a broad everyday meaning. It doesn't always correspond to an operating system job. I use "the complete work request" as a starting point, then check the specific textbook context.

### A process is an execution instance {#process}

A process is an instance of a program in execution, together with its execution environment. To manage that execution, the system needs to track its progress, resources, and current state.

Returning to the image-resizing example:

- The resizing code and related data describe the program.
- The input images, scaling ratio, output location, and processing requirements make up the submitted job.
- The running instance created to carry out the work is a process.

These concepts do not have a strict one-to-one relationship. The same program can run multiple times as different processes. A job can also contain several steps carried out by multiple processes.

An important point here is that a process can exist without executing on the CPU at that moment. Its current state matters too.

In the three-state model, a process can be ready, running, or blocked. Ready means it has what it needs to run and is waiting for CPU time. Running means it is executing. Blocked means it is waiting for an event, such as I/O completion. The five-state model adds new and terminated states.

Seen this way, the "dynamic" nature of a process refers to an execution that moves through different states.

### Threads and execution scheduling {#thread}

A process can contain one or more threads. In a common modern operating system model, a process is generally the basic unit of resource allocation and protection, while a thread is the basic unit of CPU scheduling. [Microsoft's documentation on processes and threads](https://learn.microsoft.com/en-us/windows/win32/procthread/processes-and-threads) likewise describes a thread as the basic unit to which the operating system allocates processor time.

The way I understand it is this: a process organizes resources, while its threads carry the execution flows. Threads in the same process usually share resources such as the address space, but each can have its own execution progress.

**Review:**

1. A program describes a method, a job describes the complete submitted work, and a process is an execution instance.
2. A program and a process are different things. A process does not have to occupy the CPU continuously.
3. When distinguishing processes from threads, separate resource allocation from execution scheduling.

## Concurrency and parallelism {#concurrency-parallelism}

Once I have a clearer picture of how a program runs, the next question is: how do several tasks make progress together?

Concurrency and parallelism are more general concepts. I can use processes and threads to understand them in an operating system, but their use is not limited to that setting.

### Concurrency concerns making progress together {#concurrency}

**Concurrency means multiple tasks make progress over the same period of time. They do not have to execute at the same instant.**

First consider the simplified case of a single logical processor. Tasks A and B can take turns:

```text
Time moves to the right
Execution order: A -> B -> A -> B -> A -> B
```

Only one task executes at any instant. But over the whole interval, both tasks make progress. That is concurrency.

Taking turns is therefore one way to implement concurrency. When multiple execution resources are available, tasks may also execute simultaneously.

### Parallelism concerns simultaneous execution {#parallelism}

**Parallelism means multiple tasks execute at the same time.**

For example, two logical processors can each execute a task:

```text
Over the same time interval
Logical processor 1: A A A A
Logical processor 2: B B B B
```

Here, A and B both make progress over the same interval and actually execute simultaneously. This example exhibits both concurrency and parallelism.

[The Go project's explanation of concurrency and parallelism](https://go.dev/blog/waza-talk) distinguishes their concerns: concurrency is about organizing independently progressing activities, while parallelism is about whether computations execute simultaneously. I find it helpful to identify those two questions before judging a particular example.

For ordinary software threads, **multiple threads must take turns when there is only one logical processor; with multiple logical processors, multiple threads can execute simultaneously.** As a starting point, I think of a logical processor as a processing unit on which the operating system can independently schedule a thread. It does not necessarily correspond one-to-one with a physical core. This section is about software-thread execution.

**Review:**

1. Concurrency asks whether tasks make progress over the same interval; parallelism asks whether they execute simultaneously.
2. Concurrency can be implemented by taking turns or by using multiple execution resources.
3. First establish whether the discussion is about tasks, threads, or hardware. A blanket statement that "a CPU can only do one thing at a time" is too broad.

## Synchronous and asynchronous calls {#sync-async}

Concurrency and parallelism describe how multiple tasks make progress. Synchronous and asynchronous calls address a different question here: **after starting an operation, does the caller have to wait for it to finish before continuing?**

I start with these two descriptions:

- A synchronous call: the current calling flow continues after the operation finishes and the call returns.
- An asynchronous call: the caller can continue after starting the operation and obtain the result later through an agreed mechanism.

For an operation that takes some time, I picture a synchronous call like this:

```text
I start operation A -> Wait for A to finish and return -> Continue
```

An asynchronous call looks like this:

```text
I start operation A -> Continue with other work
When A finishes     -> Handle its result through a callback, event, or similar mechanism
```

"Not waiting for the result" does not mean the result is unimportant, or that I will never need to wait for it. Later work that depends on the result still needs coordination. [MDN's introduction to asynchronous programming](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing) follows the same idea: start a potentially lengthy operation, continue responding to other events, and receive the result when it is ready.

### Execution order in a synchronous call {#synchronization}

The Chinese word used for "synchronous" can easily make me think of things happening simultaneously. For a synchronous call, though, the useful question is whether the caller can continue executing.

Take image resizing again. If I call a synchronous resizing function, the current flow cannot execute its next step until that call finishes and returns. Even if the next step is unrelated to the resized image, it still has to wait for the call to return.

With an asynchronous resizing interface, the current flow can first do work that does not depend on the result. When resizing finishes, a callback, event, or another agreed mechanism can deliver the result so it can be saved.

For now, I understand it this way: **a synchronous call lets the current flow continue after the call finishes; an asynchronous call lets it continue first and handle the result later.** Either way, actually using the resized image requires the result to be ready.

### Asynchronous execution and parallelism {#async-vs-parallel}

Asynchronous execution does not guarantee that two tasks execute on the CPU simultaneously. For example, a single-threaded event loop can process other events after a request is sent and handle its callback when the result arrives. Those callbacks can still execute sequentially on the same thread.

Conversely, an operation may use multiple threads to perform calculations in parallel while its caller waits for the result. So "asynchronous" does not automatically mean "start another thread." Whether execution can be interrupted is not the criterion for distinguishing synchronous from asynchronous calls either.

**Review:**

1. Synchronous and asynchronous calls concern the relationship between the calling flow and operation completion. Concurrency and parallelism concern how multiple tasks make progress.
2. An asynchronous result is generally handled later. It still needs handling, and asynchronous execution does not guarantee parallelism.
3. An asynchronous call allows other work that does not depend on the result to proceed first. Actually using the result still requires it to be ready.

## Today's review {#review}

After going through these concepts again, what I most want to remember is that similar-sounding definitions can be answering different questions.

For programs, jobs, and processes, I ask what method is described, what work is requested, and how the system organizes its execution. For concurrency and parallelism, I distinguish making progress together from executing simultaneously. For synchronous and asynchronous calls, I look at the relationship between the calling flow and the result after an operation starts.

Separating those questions first makes the definitions easier to understand than memorizing words such as "static," "dynamic," "alternating," and "waiting" on their own.
