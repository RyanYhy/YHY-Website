---
title: Linux 服务器 SSH 登录与安全加固笔记
linkTitle: SSH 与安全加固
description: 从连不上服务器、私钥权限报错，到改端口、UFW 放行与密钥登录——CentOS/Ubuntu VPS 实操整理。
date: 2026-08-31
tags: [Linux, SSH, UFW, 安全, systemd]
---

最近在 VPS 上折腾 SSH：外网连超时、私钥权限报错、改端口后 systemd 不生效……把 Obsidian 里的几篇笔记合并成一篇，按「先能连上 → 再加固 → 防火墙配合」的顺序记录。

> [!NOTE] 虚构示例
> 文中 IP 用 `ip1`、`ip2` 等占位（如 `ip1` = 服务器、`ip2` = 允许连入的来源）；域名 `xxx.xxx.com`、端口（如 `22222`）、用户名 `username` 亦为**演示占位**，非真实环境。请替换为你自己的值。

## SSH 登录四要素 {#four-factors}

远程登录可以记成四个量：

| 要素 | 说明 | 常见默认值 |
| ---- | ---- | ---------- |
| IP / 主机名 | 公网可达的地址 | 扫描脚本会随机扫网段，**无法真正「隐藏」** |
| 端口 | TCP 端口 | `22` |
| 用户名 | 登录账户 | 常为 `root` |
| 凭证 | 密码或密钥 | 密码无默认值；密钥需本地私钥 + 服务器公钥 |

加固思路：端口、用户名、认证方式都可以改；**密码换密钥、禁 root、改非 22 端口** 是常见组合。

## 连不上：超时与排查 {#connect-timeout}

典型报错：

```console
ssh username@xxx.xxx.com
ssh: connect to host xxx.xxx.com port 22: Connection timed out
```

可能原因：

1. **SSH 不在 22 端口** — 需指定 `-p <PORT>`
2. **云厂商安全组未放行** — 控制台里要允许你的 IP 或来源段
3. **必须先 VPN / 跳板** — 机房内网节点往往不能从宿舍/家宽直接 SSH，要先连 VPN 或跳板机，再 `ssh` 到目标主机

需要确认端口以及用户名

外网路径大致是：**云安全组 → 本机防火墙（UFW）→ sshd**。任一层未放行都会表现为超时或拒绝。

## 踩坑：私钥权限过大 {#private-key-permissions}

连上之前还遇到过 OpenSSH 直接拒绝加载私钥：

```text
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0664 for '/home/username/.ssh/id_ed25519' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/home/username/.ssh/id_ed25519": bad permissions
```

**原因**：私钥文件权限是 `0664`，组用户和其他用户可读。OpenSSH 认为密钥可能已泄露，**宁可不用这把钥匙，也不带着风险去连**——于是这次登录等于没带上有效私钥。

**处理**：私钥仅本人可读（必要时目录也要收紧）：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
```

| 路径 | 建议权限 |
| ---- | -------- |
| `~/.ssh/` | `700` |
| 私钥 | `600` |
| 公钥 `*.pub` | `644` 通常可接受 |
| 服务器端 `~/.ssh/authorized_keys` | `600` |

> [!WARNING] 公钥文件名
> 上传到 VPS 的公钥**不要**带 `.txt` 等后缀；若有需重命名。服务器端公钥文件也建议 `chmod 600`。

## 改 SSH 端口（含 systemd + UFW）{#change-port}

**稳妥顺序**（先加新端口，验证后再删旧端口）：

1. 在 `sshd_config` **追加**新 `Port`（暂时保留旧端口）
1. `daemon-reload` + 重启 `ssh.socket` / `ssh.service`
1. `sshd -T` 与 `ss` 确认新端口在监听
1. UFW（及云安全组）放行新端口
1. **新开一个终端**用新端口试连
1. 确认无误后再删旧端口规则、关 22
{.steps}

### 改 sshd 配置

```bash
sudo nano /etc/ssh/sshd_config
```

增加一行（示例：在原有 `22222` 之外再加 `9753`）：

```bash
Port 9753
```

`sshd_config` 管的是 **sshd 服务端**：听哪些端口、是否允许 root、是否允许密码登录等。nano：`Ctrl+O` 保存，`Ctrl+X` 退出。

### Ubuntu 上为何要动 ssh.socket

在 Ubuntu 上 SSH 常由 **systemd socket 激活**：先由 `ssh.socket` 占端口，再交给 `ssh.service` 里的 sshd。只改 `sshd_config` 不够，还要让生成器把新端口写进 socket 配置：

```bash
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket ssh.service
```

| 操作 | 磁盘配置 | 内存中的 unit | 内核 LISTEN |
| ---- | -------- | ------------- | ----------- |
| 只改 `Port 9753` | 新 | 旧 | 旧 |
| `daemon-reload` | 新 | 新（生成器已更新） | 仍可能是旧的 |
| `restart ssh.socket` | 新 | 新 | 新（重建 bind） |

验证「配置认为该听什么」：

```bash
sudo sshd -T | grep -i '^port '
# 例：port 22222 \n port 9753
```

验证「系统正在听什么」：

```bash
sudo ss -tlnp | grep ssh
```

`ss -tlnp`：TCP、LISTEN、数字端口、显示进程。注意：**本机在听 ≠ 外网能连**，还要 UFW 和安全组。

### UFW 放行新端口 {#ufw}

UFW 是 Ubuntu 自带的防火墙前端。流量顺序：

```text
云厂商安全组 → UFW（本机） → sshd
```

查看状态：

```bash
sudo ufw status verbose
```

- `inactive`：UFW 未启用，仅安全组 + sshd 生效
- `active`：按规则过滤入站

示例输出解读：

| 列 | 含义 |
| -- | ---- |
| To | 本机开放的端口 |
| Action | `ALLOW` 放行；`DENY` / `REJECT` 拒绝 |
| From | `Anywhere` 任意 IP；也可写成仅允许你家 IP |

放行新端口：

```bash
sudo ufw allow 9753/tcp
sudo ufw status verbose
```

看到 `9753/tcp ALLOW IN` 即规则已写入。常用维护：

```bash
sudo ufw status numbered
sudo ufw delete 3
sudo ufw allow from <ip2> to any port 22222 proto tcp   # 仅允许 ip2 连入（替换为你的来源 IP）
sudo ufw limit 22222/tcp    # 对同一 IP 短时多次连接节流，减轻扫端口
```

## 用户、禁 root、密钥登录 {#hardening-auth}

1. **新建非 root 用户** — `sudo adduser username`；Debian/Ubuntu 需 `apt install sudo`，用 `visudo` 加入 sudo 组（按最小权限配置，不必一律 `NOPASSWD`）。
1. **禁用 root SSH** — `sshd_config` 中 `PermitRootLogin no`。
1. **密钥登录、关密码** — 本地生成密钥对（推荐 **Ed25519**，避免 DSA；ECDSA/Ed25519 选型见下节），公钥写入服务器 `~/.ssh/authorized_keys`；服务器端：
   - `PubkeyAuthentication yes`
   - `PasswordAuthentication no`

改配置后同样要 reload/restart，并**保留一个已登录的会话**，防止把自己锁在外面。

### 密钥算法简记 {#key-types}

| 类型 | 说明 |
| ---- | ---- |
| RSA | 常见，密钥较长；可用但非唯一选择 |
| DSA | 已不安全，**不要用** |
| ECDSA | 短、快；算法争议较多 |
| Ed25519 | 现代默认推荐之一，文档公开、性能好 |

## systemd 与 SSH：两单元 {#systemd-ssh}

systemd 是多数现代发行版的 init/服务管家（pid 1）。与 SSH 相关的概念：

- **`ssh.service`** — 跑 `/usr/sbin/sshd` 进程
- **`ssh.socket`** — 由 systemd 先监听端口，再激活 service（socket 激活）

关系可以简化为：

```text
systemd (pid 1)
  ├── ssh.socket   → 监听 0.0.0.0:22222 / 9753 …
  ├── ssh.service  → sshd 接手已有 fd
  └── generator    → 读 sshd_config，生成 socket 该听的端口列表
```

unit 文件位置：`/usr/lib/systemd/system/`（软件包）与 `/etc/systemd/system/`（本机覆盖）；`systemctl cat ssh.service` 可看合并结果。改端口时记住：**Ubuntu 上要 reload + restart socket**，不是只 `systemctl restart ssh` 就万事大吉。

## 小结 {#summary}

| 阶段 | 要点 |
| ---- | ---- |
| 连不上 | 查端口、安全组、VPN/跳板；三层防火墙都要通 |
| 私钥报错 | `chmod 600` 私钥、`700` `.ssh`；OpenSSH 拒绝「过于开放」的密钥 |
| 改端口 | 先加后删；`sshd -T` + `ss` 验证；UFW + 安全组同步放行 |
| 加固 | 非 root、禁 root 登录、密钥认证、非默认端口 |

这是学习笔记，不是生产 checklist。动手前建议在测试机上练一遍，并始终保留一条不会把自己锁死的登录路径。
