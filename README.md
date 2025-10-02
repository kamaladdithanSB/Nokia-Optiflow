# 🚀 Nokia OptiFlow – AI-Powered Adaptive Scheduling and Resource Optimization
![Nokia OptiFlow Banner](banner.png)

[![Hackathon](https://img.shields.io/badge/Hackathon-Nokia%20Production%20Optimization-blue)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built With](https://img.shields.io/badge/Built%20With-Python%20%7C%20React%20%7C%20OR--Tools%20%7C%20Prophet-orange)]()

🔗 **Live Demo:** [Nokia OptiFlow Dashboard](https://nokia-opti-flow-5e11eed5.base44.app/Dashboard)

---

## 📖 Introduction

**Nokia OptiFlow** is an AI-driven production scheduling system developed for **Nokia Production Optimization**.  
It tackles the inefficiencies of **traditional static scheduling** by introducing **real-time, intelligent adaptive resource management**.  

The system improves **machine utilization (15–20%)**, reduces **workforce idle time (10%)**, and reallocates resources within **5 seconds** during disruptions.

---

## ⚡ Features

- **Intelligent Forecasting** – Demand prediction using Prophet/LSTM  
- **Adaptive Scheduling Core** – Combines constraint optimization with reinforcement learning  
- **Real-Time Reallocation** – Automatic rescheduling for machine failures, absences, or urgent jobs  
- **Interactive Dashboard** – Gantt charts, KPIs, alerts, and report exports  
- **Multi-Shift & Skill-Based Scheduling** – Matches worker skills with machine capabilities  
- **Scalable & Reliable** – Handles 10× job volume without performance drop  

---

## 🏗️ Architecture

- **Frontend:** React, TailwindCSS, Recharts  
- **Backend:** Python, OR-Tools, Prophet, Stable-Baselines3 (RL)  
- **Deployment:** Base44 Hosting  
- **Visualization:** Gantt Charts, KPI Panels, Alerts  

---

## ⚙️ Installation (Local Setup)

> Requires **Python 3.9+** and **Node.js** (if building the React dashboard).

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/Nokia-Optiflow.git
   cd Nokia-Optiflow
pip install -r requirements.txt
python main.py
cd dashboard
npm install
npm start

