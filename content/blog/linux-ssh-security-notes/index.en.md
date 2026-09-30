---
title: SSH Login and Security Hardening on Linux Servers
linkTitle: SSH and Security Hardening
description: Practical CentOS/Ubuntu VPS notes, from connection failures and private-key permission errors to port changes, UFW rules, and key-based authentication.
date: 2026-08-31
tags: [Linux, SSH, UFW, security, systemd]
---

My recent SSH experiments on a VPS involved public-network timeouts, private-key permission errors, and port changes that systemd did not pick up. This article combines several Obsidian notes in the order of getting connected, hardening access, and coordinating firewall rules.

![SSH login and security hardening diagram](ssh-security-fun-cover.png)
{caption="From client to server: allowing traffic through the cloud security group, UFW, and sshd"}

> [!NOTE] Illustrative placeholders
> IPs are represented by `ip1`, `ip2`, and similar placeholders, for example `ip1` for the server and `ip2` for an allowed source. The domain `xxx.xxx.com`, ports such as `22222`, and `username` are also **example placeholders**, not a real environment. Replace them with your own values.

## The four elements of SSH login {#four-factors}

Think of remote login in terms of four values:

| Element | Meaning | Common default |
| ------- | ------- | -------------- |
| IP / hostname | A publicly reachable address | Scanners probe address ranges at random; it **cannot truly be hidden** |
| Port | TCP port | `22` |
| Username | Login account | Often `root` |
| Credentials | Password or key | There is no default password; keys require a local private key and a server-side public key |

Hardening can change the port, username, and authentication method. A common combination is **keys instead of passwords, no root login, and a non-22 port**.

## Connection failures: timeouts and troubleshooting {#connect-timeout}

A typical error:

```console
ssh username@xxx.xxx.com
ssh: connect to host xxx.xxx.com port 22: Connection timed out
```

Possible causes:

1. **SSH is not on port 22** — Specify `-p <PORT>`.
2. **The cloud security group does not allow the connection** — Allow your IP or source range in the provider's console.
3. **A VPN or jump host is required first** — Internal servers often cannot be reached directly over SSH from a dormitory or home connection. Connect to the VPN or jump host first, then `ssh` to the target.

Confirm both the port and the username.

The public-network path is roughly **cloud security group → local firewall (UFW) → sshd**. A block at any layer can produce a timeout or rejection.

## A pitfall: overly permissive private keys {#private-key-permissions}

OpenSSH can refuse to load a private key before login even begins:

```text
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0664 for '/home/username/.ssh/id_ed25519' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/home/username/.ssh/id_ed25519": bad permissions
```

**Cause**: permissions `0664` allow the group and other users to read the private key. OpenSSH treats that as a potential exposure and **refuses to use the key rather than risk it**. This login therefore has no usable private key.

**Fix**: restrict access to the owner, tightening the directory permissions if needed:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
```

| Path | Suggested permissions |
| ---- | --------------------- |
| `~/.ssh/` | `700` |
| Private key | `600` |
| Public key `*.pub` | `644` is usually acceptable |
| Server-side `~/.ssh/authorized_keys` | `600` |

> [!WARNING] Public-key filenames
> Public keys uploaded to the VPS should **not** have an extra suffix such as `.txt`; rename them if necessary. The notes also recommend `chmod 600` for the server-side public-key file.

## Changing the SSH port with systemd and UFW {#change-port}

**A cautious order**: add the new port first, verify it, and only then remove the old one.

1. **Append** a new `Port` in `sshd_config`, keeping the old port temporarily.
1. Run `daemon-reload` and restart `ssh.socket` / `ssh.service`.
1. Check the new listening port with `sshd -T` and `ss`.
1. Allow the new port in UFW and the cloud security group.
1. **Open a new terminal** and try connecting through the new port.
1. After confirming access, remove the old rules and close port 22.
{.steps}

### Editing the sshd configuration {#改-sshd-配置}

```bash
sudo nano /etc/ssh/sshd_config
```

Add a line, for example adding `9753` alongside the existing `22222`:

```bash
Port 9753
```

`sshd_config` configures the **sshd server**: listening ports, root login, password authentication, and more. In nano, use `Ctrl+O` to save and `Ctrl+X` to exit.

### Why Ubuntu also needs ssh.socket updated {#ubuntu-上为何要动-sshsocket}

Ubuntu often uses **systemd socket activation** for SSH: `ssh.socket` listens first, then hands the socket to sshd in `ssh.service`. Editing `sshd_config` alone is not enough; the generator must update the socket configuration with the new ports:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket ssh.service
```

| Action | Configuration on disk | Unit in memory | Kernel LISTEN socket |
| ------ | --------------------- | -------------- | -------------------- |
| Only change `Port 9753` | New | Old | Old |
| `daemon-reload` | New | New; generator updated | May still be old |
| `restart ssh.socket` | New | New | New; bind recreated |

Check which ports the configuration says should listen:

```bash
sudo sshd -T | grep -i '^port '
# 例：port 22222 \n port 9753
```

Check which ports the system actually listens on:

```bash
sudo ss -tlnp | grep ssh
```

`ss -tlnp` selects TCP, listening sockets, numeric ports, and process information. Remember: **listening locally does not mean reachable publicly**. UFW and the security group also matter.

### Allowing the new port in UFW {#ufw}

UFW is Ubuntu's firewall frontend. Traffic passes through:

```text
Cloud security group → UFW (on the server) → sshd
```

Check the status:

```bash
sudo ufw status verbose
```

- `inactive`: UFW is disabled; only the security group and sshd apply.
- `active`: incoming traffic is filtered according to the rules.

Interpreting the output:

| Column | Meaning |
| ------ | ------- |
| To | Port exposed on this server |
| Action | `ALLOW` permits traffic; `DENY` / `REJECT` blocks it |
| From | `Anywhere` means any IP; rules can instead allow only your home IP |

Allow the new port:

```bash
sudo ufw allow 9753/tcp
sudo ufw status verbose
```

`9753/tcp ALLOW IN` means the rule is present. Common maintenance commands:

```bash
sudo ufw status numbered
sudo ufw delete 3
sudo ufw allow from <ip2> to any port 22222 proto tcp   # 仅允许 ip2 连入（替换为你的来源 IP）
sudo ufw limit 22222/tcp    # 对同一 IP 短时多次连接节流，减轻扫端口
```

## Users, root restrictions, and key-based login {#hardening-auth}

1. **Create a non-root user** — Use `sudo adduser username`. On Debian/Ubuntu, install sudo with `apt install sudo` if needed and configure sudo-group access using `visudo`. Follow least privilege rather than assigning `NOPASSWD` everywhere.
1. **Disable root SSH login** — Set `PermitRootLogin no` in `sshd_config`.
1. **Use keys and disable passwords** — Generate a key pair locally, preferably **Ed25519**, avoiding DSA; see the next section for ECDSA/Ed25519 notes. Put the public key in the server's `~/.ssh/authorized_keys`, and set:
   - `PubkeyAuthentication yes`
   - `PasswordAuthentication no`

Reload or restart after configuration changes, and **keep an already authenticated session open** so that you do not lock yourself out.

### A brief guide to key algorithms {#key-types}

| Type | Notes |
| ---- | ----- |
| RSA | Common, with longer keys; usable but not the only choice |
| DSA | No longer secure; **do not use it** |
| ECDSA | Short and fast; the algorithm has attracted more debate |
| Ed25519 | One modern default recommendation, with public documentation and good performance |

## systemd and SSH: two units {#systemd-ssh}

systemd is the init and service manager, PID 1, on most modern distributions. For SSH:

- **ssh.service** runs the `/usr/sbin/sshd` process.
- **ssh.socket** lets systemd listen first and activate the service, known as socket activation.

A simplified relationship:

```text
systemd (pid 1)
  ├── ssh.socket   → listens on 0.0.0.0:22222 / 9753 …
  ├── ssh.service  → sshd takes over the existing fd
  └── generator    → reads sshd_config and generates the socket's port list
```

Unit files live under `/usr/lib/systemd/system/` for package definitions and `/etc/systemd/system/` for local overrides. `systemctl cat ssh.service` shows the combined definition. For port changes, remember that **Ubuntu needs a reload and a socket restart**, not just `systemctl restart ssh`.

## Summary {#summary}

| Stage | Key points |
| ----- | ---------- |
| Cannot connect | Check the port, security group, and VPN/jump host; all three layers must allow traffic |
| Private-key errors | Use `chmod 600` for the private key and `700` for `.ssh`; OpenSSH rejects overly open keys |
| Port changes | Add before removing; verify with `sshd -T` and `ss`; update UFW and the security group together |
| Hardening | Non-root users, disabled root login, key authentication, and a non-default port |

These are learning notes, not a production checklist. Practice on a test machine first, and always retain a login path that will not leave you locked out.
