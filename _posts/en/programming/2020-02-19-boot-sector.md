---
layout: post-en
title: Boot Sector Programming
permalink: /programming/boot_sector_programming
author: Jesus
---

## 1. Introduction

A Boot sector program is a type of software that fits into very first 510 bytes of Master Boot Record (MBR). When the computer boots, this program is loaded by the BIOS firmware into RAM and then executed in real mode.

Today, the BIOS has been replaced by the UEFI BIOS. In brief, the UEFI BIOS uses the GUID Partition Table (GPT) scheme, and can launch an 64 bits EFI app with the PE32+ binary format (UEFI follows the Microsoft standard). If you are looking to develop something modern, you should use the UEFI BIOS and <ins>not the legacy BIOS</ins>.

In this article I will demonstrate how <s>easy is</s> to develop a <ins>stage 1 bootloader</ins> for the legacy BIOS.

> **Note**: Be aware that the main purpose here isn't to teach the assembly programming language.

## 2. Development Environment

To develop boot sector programs you don't need a big toolkit, three open source tools will suffice.

- **NASM**: Assembler with 16 bits support
- **QEMU**: Hardware emulator
- **GDB**: Assembly debugger

For example, we can easily install this tools using **APT** package manager on debian-based distros.

<figure class="highlight-figure highlight">
{% highlight plaintext %}
# apt update && apt install nasm qemu gdb -y
{% endhighlight %}
</figure>

### 2.1 First Program

To do the first test of the development environment, we will use a simple hello world program.

<figure class="highlight-figure highlight">
  <figcaption class="highlight-filename">File: hello_world.asm</figcaption>
{% highlight nasm linenos %}
[bits 16]
[org 0x7c00]

jmp 000000h:07c00h

mov al, 1 ; set atributte string write mode
mov bh, 0 ; VGA page number
mov bl, 0000_1111b ; background - foreground colors
mov cx, msg_size
mov dl, 10 ; line
mov dh,  1 ; column
push cs ; alternative: mov si, cs
pop es ;               mov es, si
mov bp, msg
mov ah, 13h ; write string
int 10h ; call BIOS

cli ; disable interrupts
hlt ; halt execution until interrupt raise (when?)

msg: db "hello world"
msg_size: equ $-msg

times 510-($-$$) db 0 ; padding to fiil the bootsector
dw 0AA55h ; bootable flag always goes at 0x01B8 offset
{% endhighlight %}
</figure>

Let's assemble it using **NASM**. The argument **-f flat** means that we are using a FLAT file format.

<figure class="highlight-figure highlight">
{% highlight plaintext %}
$ nasm -f bin hello_world.asm -o hello_world.bin
{% endhighlight %}
</figure>

Before run, let's check if this really is a bootable program with the Linux **file** command.

<figure class="highlight-figure highlight">
{% highlight plaintext %}
$ file ./hello_world.bin 
hello_world.bin: DOS/MBR boot sector
{% endhighlight %}
</figure>

The output of file command confirm, we have a MBR bootable program. Now, let's start the emulation with **QEMU**.

<figure class="highlight-figure highlight">
{% highlight plaintext %}
$ qemu-system-i386 ./hello_world.bin
{% endhighlight %}
</figure>

![](/imgs/boot-sector-programming/qemu_hello_world.png)

If you see this screen above, cool, it's working.

<!-- ### 2.2 Testing on Real Hardware

All codes here can run on real hardware too. On machines with UEFI BIOS, you need to enable the legacy boot option in BIOS setup.

![](/imgs/boot-sector-programming/bios-legacy-boot.png)

We will record the hello_world.bin file to a USB Flash Drive Media.

<figure class="highlight-figure highlight">
{% highlight plaintext %}
$ dd if=./hello_world.bin of=<your USB dev> conv=notrunc
{% endhighlight %}
</figure>
 -->
## 3. MBR

### 3.1 Floopy Disk

## 4. BIOS
The BIOS is a firmware that is recorded on.

## 5. Real Mode

### 5.1 A20 Line

## 6. Bootloader

## References

- [OSDEV - UEFI](https://web.archive.org/web/20201112030038/https://wiki.osdev.org/UEFI)
- [Ralf Brown's Interrupt List](https://web.archive.org/web/20200821051331/http://www.ctyme.com/intr/cat.htm)
- [8086 bios and dos interrupts (IBM PC)](https://web.archive.org/web/20201128193258/http://www.ablmcc.edu.hk/~scy/CIT/8086_bios_and_dos_interrupts.htm)
