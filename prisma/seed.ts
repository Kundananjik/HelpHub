import { PrismaClient, type Priority, type Category, type Status } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding HelpHub database…");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Departments
  const deptNames = [
    { name: "IT Support", description: "Hardware, software and network support." },
    { name: "Human Resources", description: "People operations and onboarding." },
    { name: "Finance", description: "Accounting, payroll and procurement." },
    { name: "Sales", description: "Revenue and customer acquisition." },
    { name: "Engineering", description: "Product development teams." },
  ];

  const departments = [];
  for (const d of deptNames) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: { description: d.description },
      create: d,
    });
    departments.push(dept);
  }
  const itDept = departments.find((d) => d.name === "IT Support")!;
  const engDept = departments.find((d) => d.name === "Engineering")!;
  const hrDept = departments.find((d) => d.name === "Human Resources")!;
  const finDept = departments.find((d) => d.name === "Finance")!;

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@helphub.dev" },
    update: {},
    create: {
      name: "Avery Admin",
      email: "admin@helphub.dev",
      passwordHash,
      role: "ADMIN",
      jobTitle: "IT Director",
      departmentId: itDept.id,
    },
  });

  const tech1 = await prisma.user.upsert({
    where: { email: "tech@helphub.dev" },
    update: {},
    create: {
      name: "Taylor Tech",
      email: "tech@helphub.dev",
      passwordHash,
      role: "TECHNICIAN",
      jobTitle: "Support Engineer",
      departmentId: itDept.id,
    },
  });

  const tech2 = await prisma.user.upsert({
    where: { email: "morgan@helphub.dev" },
    update: {},
    create: {
      name: "Morgan Fields",
      email: "morgan@helphub.dev",
      passwordHash,
      role: "TECHNICIAN",
      jobTitle: "Systems Administrator",
      departmentId: itDept.id,
    },
  });

  const emp1 = await prisma.user.upsert({
    where: { email: "employee@helphub.dev" },
    update: {},
    create: {
      name: "Emma Employee",
      email: "employee@helphub.dev",
      passwordHash,
      role: "EMPLOYEE",
      jobTitle: "Account Executive",
      departmentId: finDept.id,
    },
  });

  const emp2 = await prisma.user.upsert({
    where: { email: "jordan@helphub.dev" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "jordan@helphub.dev",
      passwordHash,
      role: "EMPLOYEE",
      jobTitle: "Recruiter",
      departmentId: hrDept.id,
    },
  });

  // Clear existing sample data to keep seed idempotent-ish
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.cannedResponse.deleteMany({});
  await prisma.article.deleteMany({});

  // Tags
  const tagDefs = [
    { name: "VIP", color: "purple" },
    { name: "Hardware", color: "amber" },
    { name: "Onboarding", color: "emerald" },
    { name: "Recurring", color: "sky" },
  ];
  const tags = [];
  for (const t of tagDefs) {
    tags.push(await prisma.tag.create({ data: t }));
  }

  // Canned responses
  await prisma.cannedResponse.createMany({
    data: [
      {
        title: "Ask for more details",
        body: "Thanks for reaching out. To help resolve this quickly, could you share your device name, any error messages, and the steps to reproduce the issue?",
      },
      {
        title: "Password reset steps",
        body: "You can reset your password from the login page using 'Forgot password'. If you don't receive the email within a few minutes, check your spam folder and let us know.",
      },
      {
        title: "Resolved — please confirm",
        body: "We've applied a fix on our side. Please try again and let us know if the issue is resolved so we can close this ticket.",
      },
    ],
  });

  // Auto-assign disabled by default
  await prisma.systemSetting.upsert({
    where: { key: "autoAssignEnabled" },
    update: { value: "false" },
    create: { key: "autoAssignEnabled", value: "false" },
  });

  // Knowledge base articles
  await prisma.article.createMany({
    data: [
      {
        title: "How to connect to the office Wi‑Fi",
        slug: "connect-office-wifi",
        category: "Network",
        body: "1. Open your Wi‑Fi settings.\n2. Select the 'Corp' network.\n3. Enter your company email and password.\n4. Accept the certificate when prompted.\n\nIf authentication fails, submit a ticket and include your device asset tag.",
        published: true,
        authorId: tech1.id,
      },
      {
        title: "Requesting new hardware",
        slug: "requesting-new-hardware",
        category: "Hardware",
        body: "To request new hardware (monitor, laptop, peripherals), submit a ticket in the Hardware category with your manager's name for approval. Standard requests are fulfilled within a few business days.",
        published: true,
        authorId: admin.id,
      },
    ],
  });

  type Seed = {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    status: Status;
    creatorId: string;
    assigneeId?: string;
    departmentId?: string;
    comments?: { authorId: string; body: string; isInternal?: boolean }[];
  };

  const tickets: Seed[] = [
    {
      title: "Laptop won't connect to office Wi-Fi",
      description:
        "Since this morning my laptop can't join the corporate Wi-Fi. It sees the network but fails to authenticate. I've tried restarting.",
      category: "NETWORK",
      priority: "HIGH",
      status: "IN_PROGRESS",
      creatorId: emp1.id,
      assigneeId: tech1.id,
      departmentId: itDept.id,
      comments: [
        {
          authorId: tech1.id,
          body: "Thanks for reporting. Can you tell me your laptop asset tag?",
        },
        { authorId: emp1.id, body: "It's LT-2291." },
        {
          authorId: tech1.id,
          body: "Re-issuing the Wi-Fi cert on the backend.",
          isInternal: true,
        },
      ],
    },
    {
      title: "Request new monitor",
      description:
        "I'd like to request a second monitor to improve productivity. 27-inch preferred.",
      category: "HARDWARE",
      priority: "LOW",
      status: "OPEN",
      creatorId: emp2.id,
      departmentId: hrDept.id,
    },
    {
      title: "Cannot access shared finance drive",
      description:
        "Getting 'Access Denied' when opening the Finance shared drive. I need it for month-end close.",
      category: "ACCOUNT",
      priority: "URGENT",
      status: "OPEN",
      creatorId: emp1.id,
      departmentId: finDept.id,
    },
    {
      title: "Outlook keeps crashing on startup",
      description:
        "Outlook crashes every time I open it. Error appears then it closes.",
      category: "SOFTWARE",
      priority: "MEDIUM",
      status: "PENDING",
      creatorId: emp2.id,
      assigneeId: tech2.id,
      departmentId: itDept.id,
      comments: [
        {
          authorId: tech2.id,
          body: "Please try starting Outlook in safe mode: hold Ctrl while launching.",
        },
      ],
    },
    {
      title: "VPN disconnects every few minutes",
      description:
        "The VPN client drops the connection roughly every 5 minutes when working from home.",
      category: "NETWORK",
      priority: "HIGH",
      status: "RESOLVED",
      creatorId: emp2.id,
      assigneeId: tech1.id,
      departmentId: itDept.id,
      comments: [
        {
          authorId: tech1.id,
          body: "Updated your VPN profile and pushed a new config. Please retest.",
        },
        { authorId: emp2.id, body: "Stable now, thank you!" },
      ],
    },
    {
      title: "Suspicious phishing email received",
      description:
        "I received an email asking me to reset my password from an external domain. Reporting it.",
      category: "SECURITY",
      priority: "URGENT",
      status: "RESOLVED",
      creatorId: emp1.id,
      assigneeId: tech2.id,
      departmentId: itDept.id,
    },
    {
      title: "Need software license for design tool",
      description:
        "Requesting a license for the design suite for an upcoming project.",
      category: "SOFTWARE",
      priority: "MEDIUM",
      status: "CLOSED",
      creatorId: emp2.id,
      assigneeId: tech1.id,
      departmentId: engDept.id,
    },
    {
      title: "Printer on 3rd floor is offline",
      description: "The shared printer near the kitchen won't print. Shows offline.",
      category: "HARDWARE",
      priority: "LOW",
      status: "OPEN",
      creatorId: emp1.id,
      departmentId: itDept.id,
    },
  ];

  for (const t of tickets) {
    const created = await prisma.ticket.create({
      data: {
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        creatorId: t.creatorId,
        assigneeId: t.assigneeId ?? null,
        departmentId: t.departmentId ?? null,
        resolvedAt:
          t.status === "RESOLVED" || t.status === "CLOSED" ? new Date() : null,
        comments: t.comments
          ? {
              create: t.comments.map((c) => ({
                authorId: c.authorId,
                body: c.body,
                isInternal: c.isInternal ?? false,
              })),
            }
          : undefined,
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "ticket.created",
        summary: `Ticket "${created.title}" created`,
        actorId: t.creatorId,
        ticketId: created.id,
      },
    });
    if (t.assigneeId) {
      await prisma.auditLog.create({
        data: {
          action: "ticket.assigned",
          summary: "Ticket assigned to a technician",
          actorId: t.assigneeId,
          ticketId: created.id,
        },
      });
    }
    console.log(`  · ticket ${created.number}: ${created.title}`);
  }

  // Attach a few demo tags to tickets.
  const urgent = await prisma.ticket.findFirst({
    where: { priority: "URGENT" },
    orderBy: { createdAt: "asc" },
  });
  if (urgent) {
    await prisma.ticket.update({
      where: { id: urgent.id },
      data: { tags: { connect: [{ id: tags[0].id }, { id: tags[3].id }] } },
    });
  }
  const hardware = await prisma.ticket.findFirst({
    where: { category: "HARDWARE" },
    orderBy: { createdAt: "asc" },
  });
  if (hardware) {
    await prisma.ticket.update({
      where: { id: hardware.id },
      data: { tags: { connect: [{ id: tags[1].id }] } },
    });
  }

  // A couple of demo notifications for the primary employee.
  const firstTicket = await prisma.ticket.findFirst({
    where: { creatorId: emp1.id },
    orderBy: { createdAt: "desc" },
  });
  if (firstTicket) {
    await prisma.notification.create({
      data: {
        userId: emp1.id,
        type: "comment.added",
        message: `New reply on "${firstTicket.title}"`,
        ticketId: firstTicket.id,
      },
    });
  }

  console.log("\nSeed complete. Demo accounts (password: password123):");
  console.log("  Admin:      admin@helphub.dev");
  console.log("  Technician: tech@helphub.dev / morgan@helphub.dev");
  console.log("  Employee:   employee@helphub.dev / jordan@helphub.dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
