// All portfolio content lives here — edit this file to update the site.

export const profile = {
  name: "John Mikhail Arazo",
  firstName: "John Mikhail",
  lastName: "Arazo",
  initials: "Arazo",
  title: "Senior Full Stack Web Developer",
  roles: [
    "Senior Full Stack Developer",
    ".NET & C# Engineer",
    "React Developer",
    "Azure DevOps Practitioner",
    "React Native / Expo Dev",
  ],
  location: "Marikina City, Philippines",
  phone: "09686914961",
  email: "arazojohn@yahoo.com",
  // Put your photo at public/profile.jpg (square works best). Initials show until then.
  photo: "/profile.jpg",
  summary:
    "Senior Full Stack Web Developer with 9+ years of professional experience building, maintaining, and modernizing business-critical web applications. Strong background in ASP.NET Core/.NET, C#, React, JavaScript, REST APIs, SQL, and modern application architecture.",
  summary2:
    "Hands-on with Azure DevOps, Docker, Azure Container Apps, Azure Container Registry, CI/CD pipelines, YARP reverse proxies, authentication/authorization, and application security remediation. Also experienced in React Native/Expo mobile development and cross-functional delivery.",
};

export const stats = [
  { value: 9, suffix: "+", label: "Years experience" },
  { value: 3, suffix: "", label: "Companies" },
  { value: 40, suffix: "+", label: "Technologies" },
  { value: 100, suffix: "%", label: "Full stack" },
];

export const skills = [
  {
    category: "Backend",
    icon: "⚙️",
    color: "#8b5cf6",
    items: [
      ".NET 8",
      "ASP.NET Core",
      "ASP.NET MVC",
      "C#",
      "Entity Framework Core",
      "REST APIs",
      "ASP.NET Core Identity",
    ],
  },
  {
    category: "Frontend",
    icon: "🎨",
    color: "#06b6d4",
    items: [
      "React",
      "JavaScript",
      "HTML5",
      "CSS3",
      "jQuery",
      "Vite",
      "DataTables",
      "Tom Select",
    ],
  },
  {
    category: "Mobile",
    icon: "📱",
    color: "#ec4899",
    items: ["React Native", "Expo", "TypeScript", "Expo Router"],
  },
  {
    category: "Cloud / DevOps",
    icon: "☁️",
    color: "#3b82f6",
    items: [
      "Microsoft Azure",
      "Azure DevOps",
      "Azure Container Apps",
      "Azure Container Registry",
      "Docker",
      "CI/CD",
      "NuGet / Azure Artifacts",
    ],
  },
  {
    category: "Architecture",
    icon: "🏛️",
    color: "#f59e0b",
    items: [
      "YARP Reverse Proxy",
      "Clean Architecture",
      "SOLID",
      "Middleware",
      "AuthN & AuthZ",
      "JWT / Cookies",
    ],
  },
  {
    category: "Data / Observability",
    icon: "📊",
    color: "#10b981",
    items: [
      "SQL",
      "SQL Server",
      "OpenTelemetry",
      "Application Logging",
      "Reporting / PDF",
    ],
  },
  {
    category: "Security",
    icon: "🛡️",
    color: "#ef4444",
    items: [
      "VAPT Remediation",
      "HTTP Security Headers",
      "CORS",
      "Secure Cookies",
      "Secrets Management",
    ],
  },
];

// Proficiency bars shown in the Skills section (self-assessed — adjust freely)
export const proficiency = [
  { name: "C# / .NET / ASP.NET Core", level: 95 },
  { name: "React / JavaScript", level: 90 },
  { name: "SQL / SQL Server", level: 88 },
  { name: "Azure / DevOps / Docker", level: 85 },
  { name: "Security & Auth", level: 85 },
  { name: "React Native / Expo", level: 80 },
];

export const experience = [
  {
    period: "2025 – 2026",
    role: "Senior Web Developer / Software Engineer",
    company: "Stradcom Corporation",
    tags: [".NET 8", "React", "Azure", "YARP", "React Native"],
    points: [
      "Develop and maintain enterprise web applications using .NET 8, ASP.NET Core, C#, React, JavaScript, SQL, and REST APIs.",
      "Build and support containerized apps on Azure Container Apps & Azure Container Registry — environment config, secrets, networking, CORS, and diagnostics.",
      "Develop Azure DevOps CI/CD pipelines for .NET and frontend apps, including SDK selection, NuGet restore, artifact feeds, and build/deploy workflows.",
      "Implement reverse-proxy and routing solutions with YARP: path-based routing, header forwarding, auth schemes, and downstream service integration.",
      "Design authentication & authorization flows with JWT, ASP.NET Core Identity, claims, cookies, refresh tokens, and role/permission-based access.",
      "Implement middleware and security headers; remediate VAPT findings including HTTP security configuration and response-header hardening.",
      "Modernize frontends with React, Vite, jQuery, DataTables, Tom Select and reusable UI components integrated with backend APIs.",
      "Work on reporting and document-generation workflows, including PDF rendering and Windows-hosted reporting services.",
      "Build React Native / Expo mobile features: authentication, secure token storage, API integration, SignalR chat/notifications, and theming.",
      "Collaborate with IT security, QA, configuration management, infrastructure, and business stakeholders to troubleshoot and deliver changes.",
    ],
  },
  {
    period: "2021 – 2025",
    role: "Full Stack Web Developer",
    company: "Relia Global Shared Services, Makati",
    tags: ["ASP.NET MVC", "C#", "React", "SQL"],
    points: [
      "Developed and maintained Operations and Head Office web applications using HTML, CSS, JavaScript, ASP.NET MVC, C#, APIs, and SQL.",
      "Designed and implemented middleware solutions for third-party application integration using API-based communication.",
      "Built frontend training applications using React JS and supported requirements gathering, issue resolution, and client coordination.",
      "Worked across frontend and backend components to maintain business applications and deliver enhancements.",
    ],
  },
  {
    period: "2017 – 2020",
    role: "Web Developer",
    company: "Global Comfort Group Corporation, Cubao",
    tags: ["ASP.NET", "C#", "SQL"],
    points: [
      "Maintained Operations web applications and existing business systems.",
      "Developed and supported ASP.NET applications, including a Hotel Management System.",
      "Investigated application issues and implemented maintenance changes based on business requirements.",
    ],
  },
];

export const education = {
  period: "2010 – 2014",
  degree: "Bachelor of Science in Information Technology",
  school: "Institute of Creative Computer Technology",
  location: "Cainta, Rizal",
};
