# OCI VM setup

Prepare an Oracle Cloud (OCI) Ubuntu VM to host the dashboard.

## 1. Create the SSH key pair (on your own computer)

The pipeline logs in with a PEM private key. No passwords are used.

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f oci_deploy.pem -N "" -C "github-actions-deploy"
```

- `-m PEM` writes the private key in PEM format.
- `-N ""` means no passphrase (GitHub Actions cannot type one).

This creates two files:

- `oci_deploy.pem` is the **private** key. It goes into a GitHub secret. Never share it or commit it.
- `oci_deploy.pem.pub` is the **public** key. It goes on the VM.

## 2. Create the instance

In the OCI Console: **Compute → Instances → Create instance**.

1. **Image:** Canonical Ubuntu 24.04 (or 22.04).
2. **Shape:** any shape works. The Always Free `VM.Standard.A1.Flex` (ARM) or `VM.Standard.E2.1.Micro` is enough; the images build on both.
3. **Networking:** use a public subnet and choose **Assign a public IPv4 address**.
4. **SSH keys:** choose **Paste public keys** and paste the contents of `oci_deploy.pem.pub`:

   ```bash
   cat oci_deploy.pem.pub
   ```
5. Click **Create** and wait for the state to become **Running**. Note the **Public IP address**.

Tip: convert the IP to a **Reserved public IP** (Networking → IP management → Reserved public IPs) so it never changes if you recreate the VM.

## 3. Open ports 80 and 443 in OCI

**Networking → Virtual cloud networks → your VCN → your subnet → Security List → Add Ingress Rules**:

| Source CIDR | Protocol | Destination port |
|---|---|---|
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |

Port 22 (SSH) is open by default. GitHub's servers use changing IP addresses, so SSH must be reachable from anywhere. This is safe because password login is disabled (step 7).

## 4. Connect to the VM

```bash
chmod 600 oci_deploy.pem
ssh -i oci_deploy.pem ubuntu@<PUBLIC_IP>
```

The default user on Ubuntu images is `ubuntu`. The first time, type `yes` to trust the server.

## 5. Open the ports in the VM firewall

OCI Ubuntu images ship with firewall rules that block web traffic. List them first:

```bash
sudo iptables -L INPUT -n --line-numbers
```

Add rules for 80 and 443 above the final REJECT rule (use its line number instead of `6` if it differs), then save:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

Expected output of the last command ends with `run-parts: executing /usr/share/netfilter-persistent/plugins.d/25-ip6tables save` or similar, with no errors.

## 6. Install Docker and rsync

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl rsync
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

- The first block adds Docker's official package source.
- `docker-ce ... docker-compose-plugin` installs Docker and Compose.
- `usermod -aG docker $USER` lets `ubuntu` run Docker without `sudo`.
- `rsync` is used by the pipeline to upload code.

Log out and back in so the group change applies:

```bash
exit
ssh -i oci_deploy.pem ubuntu@<PUBLIC_IP>
docker run --rm hello-world
docker compose version
```

Expected: a "Hello from Docker!" message and a Compose version line.

## 7. Prepare the deployment folder and harden SSH

```bash
sudo mkdir -p /opt/url-dashboard
sudo chown $USER:$USER /opt/url-dashboard
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sshd -t && sudo systemctl restart ssh
```

- The folder `/opt/url-dashboard` is where the pipeline puts the code.
- The `sed` lines disable password and root login. `sshd -t` checks the config before restarting. Keep your current session open and test a second login in a new terminal before closing it.

Also check `/etc/ssh/sshd_config.d/` for files that re-enable passwords: `sudo grep -ri PasswordAuthentication /etc/ssh/sshd_config.d/`. Edit any that say `yes`.

## 8. Record the server's SSH fingerprint (for GitHub)

On your own computer:

```bash
ssh-keyscan -H <PUBLIC_IP>
```

Copy the whole output. It becomes the `OCI_KNOWN_HOSTS` secret, which lets the pipeline verify it is talking to your VM and not an impostor. See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md).

Next: [GODADDY_DNS.md](GODADDY_DNS.md).
