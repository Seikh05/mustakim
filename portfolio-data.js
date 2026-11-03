// Centralized portfolio data for Seikh Souvagya Mustakim
// Modern, high-impact showcase portfolio dataset.

window.portfolioData = {
  profile: {
    name: "Seikh Souvagya Mustakim",
    brandName: "SSM",
    badge: "Available for Robotics, GNC & AI Research Roles",
    headline: "Building Indigenous Autopilots · Edge AI Perception · Custom RISC-V Silicon",
    title: "Autopilot & Robotics Researcher · IASc Fellow @ IISc Bengaluru",
    company: "Parala Maharaja Engineering College",
    location: "Odisha, India",
    email: "seikh2004mustakim@outlook.com",
    avatar: "assets/photo.png",
    cv: "assets/MyCV.docx",
    bio: "Final-year Electronics & Telecommunication engineer (PMEC '27, CGPA 8.39) and IASc–INSA–NASI Summer Research Fellow at IISc Bengaluru (DESE). Developing an indigenous flight controller on the ARIES v3 (VEGA RISC-V) board as part of a NIDAR 2026–27 National Top 100 team, with hands-on focus on IMU sensor fusion (Madgwick), cascaded PID control, MAVLink telemetry, and guidance, navigation & control (GNC)."
  },

  // Big Trophy Metrics for the Hero Section
  stats: [
    { value: "Top 100", label: "National Finalist", highlight: "NIDAR '26–27 VEGAPilot (DFI)" },
    { value: "IISc Fellow", label: "DESE, IISc Bengaluru", highlight: "IASc–INSA–NASI SRFP" },
    { value: "10-Stage RTL", label: "RISC-V Preprocessing IP", highlight: "Cadence Genus Synthesized" },
    { value: "8.39", label: "B.Tech CGPA", highlight: "Electronics & Telecommunication" }
  ],

  socials: [
    { name: "GitHub", url: "https://github.com/Seikh05", icon: "github" },
    { name: "LinkedIn", url: "https://linkedin.com/in/seikh-mustakim", icon: "linkedin" },
    { name: "Email", url: "mailto:seikh2004mustakim@outlook.com", icon: "mail" },
    { name: "WhatsApp", url: "https://wa.me/919556203794", icon: "whatsapp" },
    { name: "Resume (DOCX)", url: "assets/MyCV.docx", icon: "file-text" }
  ],

  // Curated Superpowers (Grouped into 4 modern high-impact domain cards)
  skillDomains: [
    {
      icon: "🛸",
      title: "Autopilot, Guidance & Robotics",
      skills: ["Autopilot Development", "MAVLink 2.0", "Mission Planner", "IMU Sensor Fusion (Madgwick)", "PID Control", "GNC & Telemetry", "ROS2 Humble", "Gazebo & Nav2"]
    },
    {
      icon: "👁️",
      title: "AI, Vision & Edge Inference",
      skills: ["YOLOv8 / YOLOv8-OBB", "Gemini Vision (1.5 Flash)", "PyTorch", "MTCNN & FaceNet", "OpenCV", "Edge Inference (RPi 5)", "CNNs", "SVM"]
    },
    {
      icon: "⚡",
      title: "Silicon, RTL & Hardware EDA",
      skills: ["Verilog HDL", "VHDL", "RTL Pipelining", "RISC-V Architecture", "Cadence Genus", "Xilinx Vivado", "FPGA (Basys 3)", "LTSpice"]
    },
    {
      icon: "🛠️",
      title: "Embedded Hardware & Firmware",
      skills: ["ARIES v3 (VEGA RISC-V)", "Raspberry Pi 5", "Jetson Orin Nano", "ESP32", "Arduino", "Tiva C", "C / C++", "Python", "Linux"]
    }
  ],

  // Flagship Project Showcases (Curated, high-impact cards)
  projects: [
    {
      id: "aries-autopilot",
      title: "ARIES v3 Autopilot & MAVLink Mission Planner",
      badge: "🏆 NIDAR '26–27 National Top 100 · DFI",
      category: "Autopilot & GNC",
      subtitle: "Indigenous flight controller on VEGA RISC-V with MAVLink 2.0 & closed-loop attitude stabilization",
      description: "Building an indigenous, non-Chinese-component drone autopilot on the ARIES v3 (VEGA RISC-V) board. Engineered the bidirectional MAVLink 2.0 telemetry and Mission Planner communication layer, Madgwick 6-DOF IMU attitude fusion, cascaded PID loops for rate and altitude hold, and autonomous Return-to-Launch (RTL) failsafes.",
      tags: ["Autopilot Development", "ARIES v3 (VEGA RISC-V)", "MAVLink 2.0", "IMU Madgwick", "PID Control", "C / C++"],
      link: "https://github.com/Seikh05",
      actionText: "View on GitHub"
    },
    {
      id: "pcbre-framework",
      title: "PCBRE — AI Hardware Auditing & Reverse Engineering",
      badge: "🏛️ IISc Bengaluru Research Fellowship",
      category: "Computer Vision & AI",
      subtitle: "Multi-modal vision framework (YOLOv8-OBB + Gemini Vision) for non-destructive PCB auditing",
      description: "Engineered during an 8-week IASc research fellowship at DESE, IISc Bengaluru. Features orientation-invariant component detection via YOLOv8-OBB, zero-shot chip OCR with Gemini 1.5 Flash to identify laser-etched IC part numbers without design files, probe-free VCC/GND power-rail mapping, and automated Hardware Bill of Materials (HBoM) generation packaged in Flask.",
      tags: ["YOLOv8 / YOLOv8-OBB", "Gemini Vision (1.5 Flash)", "OpenCV", "Flask", "Python"],
      link: "https://github.com/Seikh05/PCBRE",
      actionText: "View Repository"
    },
    {
      id: "riscv-soc",
      title: "Multi-Threaded RISC-V SoC with CNN Accelerator",
      badge: "⚡ C2S Programme · Custom Silicon IP",
      category: "Silicon & RTL",
      subtitle: "10-stage pipelined RTL datapath feeding an on-chip CNN accelerator (Cadence Genus synthesized)",
      description: "4-member team developing a custom multi-threaded RISC-V SoC with integrated JPEG codec and CNN accelerator. Owned the Preprocessing IP: designed a 10-stage pipelined RTL datapath converting JPEG streams to 28×28 FP32 tensors with 2-deep frame pipelining. Synthesized in Cadence Genus: 50 MHz (target 100 MHz), 8.96 mm² (715 kGE), 0.182 mW for ASIC tapeout.",
      tags: ["Verilog HDL", "Cadence Genus", "Xilinx Vivado", "RTL Pipelining", "RISC-V", "Python"],
      link: "https://github.com/Seikh05",
      actionText: "System Architecture"
    },
    {
      id: "ros2-bot",
      title: "Destination_bot — Autonomous ROS2 Navigation",
      badge: "🤖 ROS2 Humble · Mobile Robotics",
      category: "Autopilot & GNC",
      subtitle: "Custom URDF mobile robot with dynamic SLAM mapping and A* global path planning",
      description: "Designed a custom differential-drive robot model in URDF with simulated RPLidar. Configured SLAM Toolbox for dynamic 2D occupancy grid generation, integrated Nav2 costmaps, and implemented a custom A* pathfinder for collision-free autonomous navigation in Gazebo.",
      tags: ["ROS2 Humble", "Gazebo", "Nav2", "SLAM Toolbox", "Python"],
      link: "https://github.com/Seikh05/destination_bot",
      actionText: "View Repository"
    },
    {
      id: "rpi5-face-recog",
      title: "Face Recognition Attendance System on Raspberry Pi 5",
      badge: "👁️ Edge AI Deployment",
      category: "Computer Vision & AI",
      subtitle: "Real-time edge facial recognition pipeline with MTCNN, FaceNet embeddings, and SVM",
      description: "Built and deployed an end-to-end edge pipeline on Raspberry Pi 5. Implements MTCNN facial detection, 128-D FaceNet embeddings, and SVM classification served via a Flask interface for automated, real-time edge attendance logging with low latency.",
      tags: ["PyTorch", "MTCNN & FaceNet", "Raspberry Pi 5", "Edge AI", "Flask", "Python"],
      link: "https://github.com/Seikh05/Face-Recognition-based-Attendance-System",
      actionText: "View Repository"
    },
    {
      id: "imu-bot",
      title: "IMU-Coordinated Bot with Heading Stabilisation",
      badge: "⚙️ Embedded Control",
      category: "Autopilot & GNC",
      subtitle: "6-DOF IMU fusion via Madgwick filter with closed-loop PID heading control",
      description: "Fused 6-DOF MPU6050 telemetry via a quaternion Madgwick filter; implemented closed-loop PID heading stabilisation with auto-calibration and deadband compensation on Arduino microcontroller.",
      tags: ["IMU Madgwick", "PID Control", "Arduino", "C / C++"],
      link: "https://github.com/Seikh05/IMU-Coordinated-Bot",
      actionText: "View Repository"
    }
  ],

  // Curated Honors & Track Record (High-impact achievements only — no school certificates)
  milestones: [
    {
      title: "Top 100 Shortlisted Teams — NIDAR 2026–27 VEGAPilot",
      org: "Drone Federation of India (DFI)",
      date: "Oct 2026 – Jan 2027",
      highlight: "Track 2: Component Innovation",
      desc: "Selected among the top 100 teams nationwide after technical evaluation. Awarded an ARIES v3 (VEGA RISC-V) dev kit to develop an indigenous flight controller, contributing MAVLink 2.0 communication, Mission Planner integration, and autonomous mission protocols."
    },
    {
      title: "IASc–INSA–NASI Summer Research Fellow",
      org: "Dept. of Electronic Systems Engineering (DESE), IISc Bengaluru",
      date: "May 2026 – Jul 2026",
      highlight: "National Research Fellowship",
      desc: "Selected for the prestigious national fellowship program. Designed and engineered PCBRE, an AI-powered optical PCB reverse engineering and hardware auditing framework using YOLOv8-OBB and Gemini Vision."
    },
    {
      title: "Co-Organizer — IEEE Edge AI Hackathon 2026",
      org: "IEEE EDS Student Branch Chapter, PMEC",
      date: "4–6 Oct 2026",
      highlight: "48-Hour National Hackathon",
      desc: "Helped orchestrate a 48-hour national hackathon across three hardware tracks (FPGA, Raspberry Pi/Renesas, ESP32/Arduino) with a ₹45,000 prize pool."
    },
    {
      title: "Semifinalist — Robowar 8 kg (IIT KGP Kshitij) & Runner-up (VSSUT)",
      org: "IIT Kharagpur & VSSUT Burla",
      date: "Jan 2025 – Jan 2026",
      highlight: "Robotics Competitions",
      desc: "Competed nationally with an 8 kg combat robot at IIT Kharagpur Kshitij; awarded Runner-up at Hack for Tomorrow (VSSUT Burla) for FemeVision, a real-time violence detection vision pipeline."
    },
    {
      title: "Vice Chair (IEEE EDS) & Lead, Research & Innovation (Robotics Club)",
      org: "Parala Maharaja Engineering College",
      date: "2025 – 2027",
      highlight: "Student Leadership",
      desc: "Elected Vice Chair of IEEE EDS Student Branch Chapter and spearheading R&I wing at the Robotics Club; organized RoboExpo-2k25, Robomania 2k26, and coordinated technical sessions at IEEE AIMLCPS."
    }
  ],

  // Blog / Notes Posts for notes page
  posts: [
    {
      file: "2026-10-20-aries-autopilot-mavlink.md",
      title: "Building an Indigenous Autopilot on ARIES v3 (VEGA RISC-V)",
      date: "2026-10-20",
      excerpt: "Engineering an indigenous flight controller stack on the VEGA RISC-V processor: MAVLink 2.0 communication, IMU sensor fusion, and closed-loop attitude stabilization for NIDAR 2026–27.",
      content: `As part of the **NIDAR 2026–27 VEGAPilot Challenge** (selected among the Top 100 teams nationwide), our team is building an indigenous, non-Chinese-component drone autopilot powered by the **ARIES v3.0** development board (built on the indigenous **VEGA RISC-V** processor).

## Architecture & Goals

Modern open-source autopilots are predominantly built for ARM Cortex-M microcontrollers. Porting and architecting flight control logic onto an indigenous RISC-V core requires tailored peripheral integration and real-time responsiveness:

1. **IMU Sensor Fusion**:
   - Integrating 6-DOF / 9-DOF IMU telemetry over SPI/I2C.
   - Employing Madgwick / quaternion filter implementations for accurate attitude estimation with minimal computational overhead on the VEGA core.

2. **MAVLink 2.0 & Mission Planner Integration**:
   - Designing packet serialization and parser state-machines for MAVLink 2.0 protocol over UART.
   - Establishing reliable bidirectional heartbeats, telemetry streaming, and parameter configuration with Ground Control Stations like Mission Planner and QGroundControl.

3. **Closed-Loop Control & Failsafes**:
   - Tuned cascaded PID loops for rate and attitude stabilization.
   - Implementing autonomous waypoint sequencing, altitude hold, Return-to-Launch (RTL), and communication-loss failsafes.
`
    },
    {
      file: "2026-06-15-pcb-yolo.md",
      title: "Deep Learning & LMMs for Automated PCB Auditing (PCBRE)",
      date: "2026-06-15",
      excerpt: "Sharing observations from my research internship at ESE, IISc Bengaluru: engineering PCBRE, an automated multi-modal pipeline for component detection, Gemini Vision OCR, and power rail mapping.",
      content: `During my summer research fellowship at the Department of Electronic Systems Engineering (DESE), IISc Bengaluru, I engineered **PCBRE** — a non-destructive hardware auditing and reverse-engineering framework.

Normally, quality control and reverse engineering of multi-layer PCBs require painstaking manual inspection or destructive acid de-layering. PCBRE automates this through a multi-modal computer vision and Large Multimodal Model (LMM) approach.

## Key Pipeline Components

1. **Oriented Component Detection (YOLOv8-OBB)**:
   - Fine-tuned oriented bounding box detection (YOLOv8-OBB) to localize rotated IC chips, SMD passives, diodes, and pin arrays.

2. **LMM Chip Marking Extraction (Gemini Vision)**:
   - Segmented chip package crops are passed to Gemini Vision (Gemini 1.5 Flash) for zero-shot text recognition, reliably recovering laser-etched part numbers and serial codes.

3. **Probe-Free Power Rail & HBoM Generation**:
   - Silkscreen landmark text analysis combined with trace width classification identifies VCC and GND power rails.
   - Generates a structured Hardware Bill of Materials (HBoM) complete with automated datasheet search links.
`
    },
    {
      file: "2026-05-10-ros2-astar.md",
      title: "Simulating A* Path Planning in ROS2 Humble",
      date: "2026-05-10",
      excerpt: "Walkthrough of my ROS2 robot model, SLAM node configurations, and implementing a custom pathfinder in Gazebo.",
      content: `This post covers the design and execution of **Destination Bot**, a custom-modeled differential-drive robot running on **ROS2 Humble** and **Gazebo**.

## Robot Assembly (URDF)

I created a custom robot description (URDF) with:
- A rectangular chassis.
- Two active wheels driven by a differential drive plugin.
- One caster wheel for balance.
- A simulated RPLidar sensor publishing on the \`/scan\` topic.

## Mapping & SLAM

We use the \`slam_toolbox\` in ROS2 to map the room dynamically. The lidar publishes range readings, while wheel encoders publish odometry (\`/odom\`). Together, they allow the robot to localize and build an occupancy grid (\`/map\`).
`
    }
  ],

  collaboration: {
    status: "Open for Opportunities",
    headline: "Let's Build Something Impactful",
    description: "I am actively seeking robotics, GNC, and AI research roles, internships, and collaborative development in Autopilot Systems, Guidance Navigation & Control, Embedded RISC-V, and Edge AI.",
    domains: ["Autopilot Development & GNC", "Robotics & Autonomous Systems", "Embedded Systems & RISC-V", "Edge AI & Computer Vision"],
    email: "seikh2004mustakim@outlook.com",
    whatsapp: "https://wa.me/919556203794",
    linkedin: "https://linkedin.com/in/seikh-mustakim"
  }
};
