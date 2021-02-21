---
layout: post-en
title: Boot Sector Programming
permalink: /programming/boot-sector-programming
---

## Introdution

A Boot sector program is a class of software that fits into very first 510 bytes of Master Boot Record. This program is loaded by the BIOS firmware into RAM and then executed on bare metal.

Because the populaziration of BIOS UEFI, boot sector programs are no longer widely used. The BIOS UEFI uses the GPT partition scheme, and can launch an 64 bits EFI app with the PE32+ binary format (BIOS UEFI follows the Microsoft standard). As you can see, BIOS UEFI is a better alternative.

In this article I will demonstrate how easy is to develop a <ins>boot sector program</ins> and a <ins>stage 1 bootloader</ins>.

**OBS**.: The main objective here isn't to teach the assembly programming language.

## Development Environment

To develop boot sector programs you don't need a big toolkit, three open source tools will suffice.

- **NASM**: Assembler with 16 bits support
- **QEMU**: Hardware emulator
- **GDB**: Assembly debugger

For example, we can easily install this tools using **APT** package manager on debian-based distros, as you can see in the command below:

<figure class="highlight-figure highlight">
{% highlight plaintext %}
# apt update && apt install nasm qemu gdb -y
{% endhighlight %}
</figure>

All codes here can run on real hardware too. On machines with BIOS UEFI, you need to enable the legacy boot option in BIOS setup. As in the image below:

![](/imgs/boot-sector-programming/bios-legacy-boot.png)

### First Program

To do the first test of the development environment, we will use a simple hello world program.

<figure class="highlight-figure highlight">
  <figcaption class="highlight-filename">File: hello_world.asm</figcaption>
{% highlight nasm linenos %}
[bits 16]
[org 0x7c00]

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
dw 0AA55h ; bootable flag
{% endhighlight %}
</figure>

## Master Boot Record



## Basic Input Output System

## Real Mode

## References

- [OSDEV - UEFI](https://web.archive.org/web/20201112030038/https://wiki.osdev.org/UEFI)
- [Ralf Brown's Interrupt List](https://web.archive.org/web/20200821051331/http://www.ctyme.com/intr/cat.htm)
- [8086 bios and dos interrupts (IBM PC)](https://web.archive.org/web/20201128193258/http://www.ablmcc.edu.hk/~scy/CIT/8086_bios_and_dos_interrupts.htm)
