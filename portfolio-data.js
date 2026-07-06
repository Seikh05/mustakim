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
    statement: "I am an Electronics & Telecommunication Engineering student at Parala Maharaja Engineering College, Berhampur. Recently, I was an IASc Summer Research Fellow at the Department of Electronic Systems Engineering, IISc Bengaluru under Dr. Haresh Dagale. I am passionate about autonomous systems (ROS2, SLAM), embedded hardware control, and designing robust, edge-optimized software-hardware integrations."
  },
  socials: [
    { name: "GitHub", url: "https://github.com/Seikh05", icon: "github" },
    { name: "LinkedIn", url: "https://linkedin.com/in/seikh-mustakim", icon: "linkedin" },
    { name: "Email", url: "mailto:seikh2004mustakim@outlook.com", icon: "mail" },
    { name: "CV (PDF)", url: "assets/MyCV.pdf", icon: "file-text" }
  ],
  currently: "Student at Parala Maharaja Engineering College. Recently completed an IASc Summer Research Fellowship at ESE, IISc Bengaluru, engineering deep learning pipelines for hardware assurance.",
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
    { name: "MediaPipe", category: "Vision & ML" },
    { name: "Lucas-Kanade Optical Flow", category: "Vision & ML" },
    { name: "TensorRT", category: "Vision & ML" },
    { name: "CNNs", category: "Vision & ML" },
    { name: "OCR pipelines", category: "Vision & ML" },
    { name: "Scikit-learn", category: "Vision & ML" },
    
    // GenAI
    { name: "RAG pipelines", category: "Generative AI" },
    { name: "MCP", category: "Generative AI" },
    { name: "prompt engineering", category: "Generative AI" },
    { name: "vector databases", category: "Generative AI" },
    
    // Programming & Tools
    { name: "Python", category: "Languages & Tools" },
    { name: "C / C++", category: "Languages & Tools" },
    { name: "Git", category: "Languages & Tools" },
    { name: "Linux", category: "Languages & Tools" },
    { name: "VS Code", category: "Languages & Tools" },
    { name: "PlatformIO", category: "Languages & Tools" }
  ],
  timeline: [
    {
      period: "Jun 2026 - Aug 2026",
      role: "IASc Summer Research Fellow",
      organization: "Dept. of Electronic Systems Engineering, IISc Bengaluru",
      description: "Selected for the highly competitive IASc-INSA-NASI Summer Research Fellowship Programme (SRFP). Engineered a YOLO-based PCB reverse engineering pipeline (97%+ confidence) and custom OCR for BoM extraction; validated on FICS-PCB dataset on TrustHub."
    },
    {
      period: "Jun 2025 - Aug 2025",
      role: "Generative AI Internship",
      organization: "RMSoEE, IIT Kharagpur",
      description: "Completed a hands-on GenAI programme covering LLM fine-tuning, Retrieval-Augmented Generation (RAG), and Model Context Protocol (MCP); implemented end-to-end generative AI workflows."
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
      description: "Completed basic schooling with 93.8% aggregate."
    }
  ],
  projects: [
    {
      title: "Destination_bot — A* Path Planning on ROS2",
      meta: "ROS2 · Gazebo · SLAM Toolbox · Nav2 · Python · RViz2",
      description: "Built a custom URDF differential-drive robot with a full SLAM pipeline and custom A* path planning node for autonomous collision-free navigation in Gazebo.",
      tags: ["ROS2 Humble", "Gazebo", "SLAM Toolbox", "Nav2", "Python"],
      link: "https://github.com/Seikh05"
    },
    {
      title: "RPLidar Visualisation & Gazebo Simulation",
      meta: "RPLidar A-Series · Pygame · Matplotlib · ROS2 · Gazebo",
      description: "Streamed real-time RPLidar scan data into 2D Pygame and 3D Matplotlib visualisations; integrated sensor into Gazebo + ROS2 as groundwork for SLAM.",
      tags: ["RPLidar", "ROS2 Humble", "Gazebo", "Python"],
      link: "https://github.com/Seikh05"
    },
    {
      title: "Face Recognition Attendance System",
      meta: "PyTorch · MTCNN · FaceNet · SVM · Flask",
      description: "Engineered a real-time face recognition pipeline (MTCNN, FaceNet, SVM) deployed via a Flask web application for automated attendance logging.",
      tags: ["Python", "OpenCV", "CNNs"],
      link: "https://github.com/Seikh05"
    },
    {
      title: "IMU-Coordinated Bot with Heading Stabilisation",
      meta: "MPU6050 · Madgwick Filter · PID Control · Arduino",
      description: "Fused 6-DOF IMU data via Madgwick complementary filter; implemented closed-loop PID heading stabilisation with auto-calibration and deadband control.",
      tags: ["Arduino", "PID Control", "C / C++"],
      link: "https://github.com/Seikh05"
    },
    {
      title: "FemeVision — Vision-Based Safety System",
      meta: "YOLOv8 · Lucas-Kanade Optical Flow · MediaPipe · OpenCV · Streamlit",
      description: "Multi-modal perception pipeline combining object detection, optical flow motion estimation, and pose estimation — Runner-up, Hack for Tomorrow Hackathon, VSSUT Burla 2025.",
      tags: ["YOLOv8", "Optical Flow", "MediaPipe", "OpenCV"],
      link: "https://github.com/Seikh05"
    },
    {
      title: "Smart Environment Monitor (IoT)",
      meta: "Raspberry Pi · Arduino Nano · ESP32 · ThingSpeak",
      description: "Multi-sensor RPi + Arduino hybrid system with real-time cloud telemetry via ThingSpeak; covers temperature, humidity, and ambient light acquisition.",
      tags: ["Raspberry Pi", "Arduino", "ESP32", "IoT"],
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
    { title: "Autonomous Systems", desc: "Robotics, Drone Simulations, Edge AI, Embedded Systems integration." },
    { title: "Artificial Intelligence", desc: "Deep Learning, Computer Vision." }
  ],
  extracurriculars: [
    { title: "Technical Memberships", desc: "Core Member at College Robotics Club and Active IEEE Student Member." },
    { title: "Interests & Hobbies", desc: "Book reading, Traveling and Photography." }
  ],
  posts: [
    {
      file: "2026-06-15-pcb-yolo.md",
      title: "Deep Learning for Automated PCB Auditing",
      date: "2026-06-15",
      excerpt: "Sharing preliminary observations from my summer project at ESE, IISc Bengaluru: training convolutional models to map micro-electronic components.",
      content: `# Deep Learning for Automated PCB Auditing

Currently, at the Electronic Systems Engineering (ESE) Dept, IISc Bengaluru, I am working on automating the extraction of a Bill of Materials (BoM) from raw PCB images.

Normally, quality control and reverse engineering of multi-layer PCBs involve meticulous manual inspection. Our project aims to automate this using convolutional networks.

## The Approach

1. **Object Detection**:
   - We fine-tune a YOLOv8 network on high-resolution orthographic images of printed circuit boards.
   - The network is trained to identify resistors, capacitors, IC chips, diodes, and test points.

2. **OCR Pre-Processing**:
   - Chip identifiers are often laser-etched and highly reflective.
   - I implemented a custom OpenCV pre-processing pipeline (adaptive thresholding, morphological closing, and perspective warps) to crop and normalize text bounding boxes.
   - This increased Tesseract/OCR confidence scores from ~68% to 92%+.
`
    },
    {
      file: "2026-05-10-ros2-astar.md",
      title: "Simulating A* Path Planning in ROS2 Humble",
      date: "2026-05-10",
      excerpt: "Walkthrough of my ROS2 robot model, SLAM node configurations, and implementing a custom pathfinder in Gazebo.",
      content: `# Simulating A* Path Planning in ROS2 Humble

This post covers the design and execution of **Destination Bot**, a custom-modeled differential-drive robot running on **ROS2 Humble** and **Gazebo**.

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
