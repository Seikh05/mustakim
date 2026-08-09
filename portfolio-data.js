// Centralized portfolio data for Seikh Souvagya Mustakim
// Modify this file to update all information across the portfolio website.

window.portfolioData = {
  profile: {
    name: "Seikh Souvagya Mustakim",
    brandName: "SSM",
    title: "IASc Summer Research Fellow @ IISc Bengaluru",
    company: "Parala Maharaja Engineering College",
    location: "Odisha, India",
    email: "seikh2004mustakim@outlook.com",
    avatar: "assets/photo.png",
    cv: "assets/MyCV.pdf",
    interests: "Robotics & Autonomous Systems · Embedded Systems · Computer Vision · Generative AI",
    statement: "I am an Electronics & Telecommunication Engineering student at Parala Maharaja Engineering College, Berhampur. Recently, I was an IASc Summer Research Fellow at the Department of Electronic Systems Engineering, IISc Bengaluru under Proff. Haresh Dagale. I am passionate about autonomous systems (ROS2, SLAM), embedded hardware control, and designing robust, edge-optimized software-hardware integrations."
  },
  socials: [
    { name: "GitHub", url: "https://github.com/Seikh05", icon: "github" },
    { name: "LinkedIn", url: "https://linkedin.com/in/seikh-mustakim", icon: "linkedin" },
    { name: "Email", url: "mailto:seikh2004mustakim@outlook.com", icon: "mail" },
    { name: "CV (PDF)", url: "assets/MyCV.pdf", icon: "file-text" }
  ],
  currently: "Final year Student at Parala Maharaja Engineering College. Recently completed an IASc Summer Research Fellowship at ESE, IISc Bengaluru, engineering PCBRE — an automated multi-modal hardware auditing & reverse engineering framework.",
  skills: [
    // Robotics & Autonomous Systems
    { name: "ROS2 Humble", category: "Robotics" },
    { name: "Gazebo", category: "Robotics" },
    { name: "RViz2", category: "Robotics" },
    { name: "RPLidar", category: "Robotics" },
    { name: "SLAM Toolbox", category: "Robotics" },
    { name: "Nav2", category: "Robotics" },
    { name: "AMCL", category: "Robotics" },
    { name: "A* Path Planning", category: "Robotics" },
    { name: "PID Control", category: "Robotics" },
    { name: "URDF", category: "Robotics" },
    
    // Embedded Systems & Hardware
    { name: "Raspberry Pi", category: "Embedded & IoT" },
    { name: "Arduino", category: "Embedded & IoT" },
    { name: "ESP32", category: "Embedded & IoT" },
    { name: "MPU6050", category: "Embedded & IoT" },
    { name: "Jetson Nano", category: "Embedded & IoT" },
    { name: "Tiva C (TM4C123)", category: "Embedded & IoT" },
    
    // Computer Vision & ML
    { name: "OpenCV", category: "Vision & ML" },
    { name: "YOLOv8", category: "Vision & ML" },
    { name: "YOLOv8 OBB", category: "Vision & ML" },
    { name: "MediaPipe", category: "Vision & ML" },
    { name: "Lucas-Kanade Optical Flow", category: "Vision & ML" },
    { name: "TensorRT", category: "Vision & ML" },
    { name: "CNNs", category: "Vision & ML" },
    { name: "OCR pipelines", category: "Vision & ML" },
    { name: "Scikit-learn", category: "Vision & ML" },
    
    // GenAI
    { name: "Gemini Vision", category: "Generative AI" },
    { name: "RAG pipelines", category: "Generative AI" },
    { name: "MCP", category: "Generative AI" },
    { name: "prompt engineering", category: "Generative AI" },
    { name: "vector databases", category: "Generative AI" },
    
    // Programming & Tools
    { name: "Python", category: "Languages & Tools" },
    { name: "C / C++", category: "Languages & Tools" },
    { name: "Flask", category: "Languages & Tools" },
    { name: "Streamlit", category: "Languages & Tools" },
    { name: "Git", category: "Languages & Tools" },
    { name: "Linux", category: "Languages & Tools" },
    { name: "VS Code", category: "Languages & Tools" },
    { name: "PlatformIO", category: "Languages & Tools" }
  ],
  timeline: [
    {
      period: "May 2026 - Jul 2026",
      role: "IASc Summer Research Fellow",
      organization: "Dept. of Electronic Systems Engineering, IISc Bengaluru",
      description: "Selected for the highly competitive IASc-INSA-NASI Summer Research Fellowship Programme (SRFP). Engineered PCBRE — a non-destructive hardware auditing pipeline using YOLOv8 for component detection and Gemini Vision for chip OCR; integrated silkscreen analysis to map power rails and generate a complete HBoM with datasheet links."
    },
    {
      period: "Jun 2025 - July 2025",
      role: "Generative AI Internship",
      organization: "RMSoEE, IIT Kharagpur",
      description: "Completed a hands-on GenAI program covering Deep Learning fundamentals, Retrieval-Augmented Generation (RAG), and Model Context Protocol (MCP); designed and deployed end-to-end generative AI workflows utilizing vector databases and prompt orchestration"
    },
    {
      period: "2023 - 2027",
      role: "B.Tech - Electronics and Telecommunications",
      organization: "Parala Maharaja Engineering College",
      description: "CGPA: 8.39 / 10. Core coursework in communication systems, signal processing, and electronics."
    },
    {
      period: "2020 - 2022",
      role: "Senior Secondary (Science)",
      organization: "Nalanda Public School, Cuttack",
      description: "Completed secondary education with 91% aggregate."
    },
    {
      period: "2010 - 2020",
      role: "Secondary",
      organization: "St. Xavier's High School, Athagarh",
      description: "Completed basic schooling with 94% aggregate."
    }
  ],
  projects: [
    {
      title: "PCBRE — Multi-Modal Hardware Auditing & Reverse Engineering Framework",
      meta: "YOLOv8 OBB · Gemini Vision · Flask · OpenCV · Python",
      description: "Built a non-destructive hardware auditing pipeline using YOLOv8 for component detection and Gemini Vision for chip OCR; integrated silkscreen analysis to map power rails and generate a complete HBoM with datasheet links. (Research Internship, DESE, IISc Bengaluru 2026).",
      tags: ["YOLOv8 OBB", "Gemini Vision", "Flask", "OpenCV", "Python"],
      link: "https://github.com/Seikh05/PCBRE"
    },
    {
      title: "Destination_bot — Autonomous Navigation on ROS2",
      meta: "ROS2 · Gazebo · SLAM Toolbox · Nav2 · Python",
      description: "Designed a custom differential-drive robot in URDF; integrated SLAM for mapping and a hand-rolled A* planner for collision-free autonomous navigation in simulation.",
      tags: ["ROS2 Humble", "Gazebo", "SLAM Toolbox", "Nav2", "Python", "URDF"],
      link: "https://github.com/Seikh05/destination_bot"
    },
    {
      title: "FemeVision — Multi-Modal Safety Perception",
      meta: "YOLOv8 · Lucas-Kanade · MediaPipe · OpenCV · Streamlit",
      description: "Fused object detection, optical flow, and pose tracking into a real-time violence detection pipeline — Runner-up, Hack for Tomorrow Hackathon, VSSUT Burla 2025.",
      tags: ["YOLOv8", "Lucas-Kanade Optical Flow", "MediaPipe", "OpenCV", "Streamlit"],
      link: "https://github.com/Seikh05/FEMEVISION-V1"
    },
    {
      title: "Face Recognition Attendance System",
      meta: "PyTorch · MTCNN · FaceNet · SVM · Flask",
      description: "Built an end-to-end face recognition pipeline (MTCNN → FaceNet embeddings → SVM) served through a Flask web app for automated attendance logging.",
      tags: ["Python", "OpenCV", "Flask", "CNNs"],
      link: "https://github.com/Seikh05/Face-Recognition-based-Attendance-System"
    },
    {
      title: "IMU-Coordinated Bot with Heading Stabilisation",
      meta: "MPU6050 · Madgwick Filter · PID Control · Arduino",
      description: "Fused 6-DOF IMU data using a Madgwick filter; implemented closed-loop PID control for robot heading stabilization with auto-calibration.",
      tags: ["Arduino", "PID Control", "C / C++"],
      link: "https://github.com/Seikh05/IMU-Coordinated-Bot"
    },
    {
      title: "RPLidar Visualisation & Gazebo Simulation",
      meta: "RPLidar A-Series · Pygame · Matplotlib · ROS2 · Gazebo",
      description: "Streamed real-time RPLidar scan data into 2D Pygame and 3D Matplotlib visualisations; integrated sensor into Gazebo + ROS2 as groundwork for SLAM.",
      tags: ["RPLidar", "ROS2 Humble", "Gazebo", "Python"],
      link: "https://github.com/Seikh05"
    },
    {
      title: "Smart Environment Monitor (IoT)",
      meta: "Raspberry Pi · Arduino Nano · ESP32 · ThingSpeak",
      description: "Multi-sensor RPi + Arduino hybrid system with real-time cloud telemetry via ThingSpeak; covers temperature, humidity, and ambient light acquisition.",
      tags: ["Raspberry Pi", "Arduino", "ESP32"],
      link: "https://github.com/Seikh05"
    }
  ],
  achievements: [
    {
      title: "Vice Chairperson — IEEE EDS Student Branch Chapter, PMEC",
      meta: "2026 - 27",
      description: "Leading technical events, industry talks, and student outreach as elected Vice Chair of the IEEE Electron Devices Society Student Branch Chapter."
    },
    {
      title: "Coordinator R&I Wing — Robotics Club, PMEC",
      meta: "2025 - 26",
      description: "Spearheading research and innovation initiatives; organised RoboExpo-2k25, Robomania 2k26, and the Innovation Challenge Hackathon."
    },
    {
      title: "Semifinalist — Robowar 8 kg, IIT KGP Kshitij 2026",
      meta: "Jan 2026",
      description: "Designed and competed with an 8 kg combat robot nationally — hands-on embedded debugging and hardware-software integration under competition pressure."
    },
    {
      title: "Runner-up — Hack for Tomorrow Hackathon, VSSUT Burla",
      meta: "Jan 2025",
      description: "Led 4-member team to build a real-time violence detection system using optical flow and Harris corner detection."
    },
    {
      title: "Student Volunteer — 1st IEEE Intl. Conference on AIMLCPS 2026, PMEC",
      meta: "Feb 2026",
      description: "Managed hybrid research-paper sessions across 3 days as part of a 50-member volunteer team."
    }
  ],
  certifications: [
    { title: "Autonomous Vehicles Bootcamp", issuer: "Robolearn LLP" },
    { title: "Generative AI: Learn by Doing", issuer: "IIT Kharagpur" },
    { title: "Machine Learning A-Z", issuer: "Udemy" },
    { title: "Python for Data Science & ML", issuer: "Udemy" },
    { title: "Python Specialisation", issuer: "University of Michigan" },
    { title: "Embedded Systems for Beginners", issuer: "NIELIT" }
  ],
  researchInterests: [
    { title: "Autonomous Systems", desc: "Edge AI, Cyber Physical Systems, Robotics and Automations." },
    { title: "Artificial Intelligence", desc: "Generative AI, Deep Learning, Computer Vision." }
  ],
  extracurriculars: [
    { title: "Technical Memberships", desc: "Core Member at College Robotics Club and Active IEEE Student Member." },
    { title: "Interests & Hobbies", desc: "Book reading, Traveling and Photography." }
  ],
  posts: [
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
   - Segmented chip package crops are passed to Gemini Vision for zero-shot text recognition, reliably recovering laser-etched part numbers and serial codes.

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
- An simulated RPLidar sensor publishing on the \`/scan\` topic.

## Mapping & SLAM

We use the \`slam_toolbox\` in ROS2 to map the room dynamically. The lidar publishes range readings, while wheel encoders publish odometry (\`/odom\`). Together, they allow the robot to localize and build a occupancy grid (\`/map\`).
`
    }
  ]
};
