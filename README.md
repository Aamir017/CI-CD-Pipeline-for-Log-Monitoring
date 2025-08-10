# 🚀 CI/CD Pipeline with Jenkins, Docker, and Kubernetes

## 📌 Project Overview
This project demonstrates a **full DevOps workflow** by building, containerizing, and deploying a Node.js application using:
- **Jenkins** for CI/CD automation
- **Docker** for containerization
- **Kubernetes** for orchestration
- **AWS EC2** as the hosting environment

The pipeline automates:
1. **Code build & test**
2. **Docker image creation**
3. **Pushing the image to Docker Hub**
4. **Deploying the app to Kubernetes** (currently manual, can be automated later)

---

## 🛠 Tech Stack
- **Backend:** Node.js + Express
- **CI/CD:** Jenkins
- **Containerization:** Docker
- **Orchestration:** Kubernetes (kubectl / k3s / minikube)
- **Hosting:** AWS EC2 (Ubuntu)
- **Registry:** Docker Hub

---

## 📂 Project Structure
```bash
├── ansible/               # Ansible playbooks (infra automation)
├── k8s/                   # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml       # Added ingress config
├── public/                # Static assets for Node.js app
├── terraform/             # Terraform IaC files
├── .dockerignore
├── .gitattributes
├── .gitignore
├── Dockerfile              # Docker build instructions
├── Jenkinsfile             # CI/CD pipeline definition
├── package-lock.json
├── package.json
├── server.js               # Node.js server
```

---

## ⚙️ Pipeline Workflow
- Developer pushes code to GitHub

- Jenkins pulls the code via webhook

- Jenkins builds the Docker image and tags it

- Docker image is pushed to Docker Hub

- (Manual step) Run kubectl apply -f k8s/ to deploy to Kubernetes cluster

--- 

## 📋 Prerequisites
- Before running this project, ensure you have:

- AWS EC2 instance (Ubuntu)

- Docker installed

- Jenkins installed and configured

- Kubernetes cluster (minikube, k3s, or full cluster)

- Docker Hub account

---

## 🚀 Setup & Installation

1️⃣ Clone Repository
```
git clone https://github.com/Aamir017/CI-CD-Pipeline-for-Log-Monitoring.git
cd CI-CD-Pipeline-for-Log-Monitoring
```
2️⃣ Build & Run Locally
```
docker build -t log-monitor .
docker run -p 3000:3000 log-monitor
```
Open http://localhost:3000 in your browser.

3️⃣ Jenkins Setup

- Install required Jenkins plugins:

  * Docker Pipeline

  * Git

  * Kubernetes CLI 

- Create a new Pipeline job and link it to your GitHub repo

- Add your Docker Hub credentials in Jenkins

--- 

## ☸ Kubernetes Deployment
Create Deployment
```
kubectl apply -f k8s/deployment.yaml
```
Create Service
```
kubectl apply -f k8s/service.yaml
```
Check Pods
```
kubectl get pods
```

## Screenshots
<img width="1919" height="910" alt="Screenshot 2025-08-10 185826" src="https://github.com/user-attachments/assets/33f6b90e-14f8-42ca-825b-035661972a7f" />
<img width="1912" height="906" alt="Screenshot 2025-08-08 153633" src="https://github.com/user-attachments/assets/6eaea528-028d-436e-9515-ca30b9b53612" />
![k](https://github.com/user-attachments/assets/27a42204-4be5-4735-8a34-3a7afb743c60)


--- 

👤 Author
**Sk. Aamir Ahmed**
- LinkedIn: [skaamir10](https://www.linkedin.com/in/skaamir10/)
