import { Role } from "@prisma/client";
import prisma from "../lib/prisma.js";

async function main() {
  console.log("Seeding...");

  // 1. Clean up existing data (in reverse order of dependencies)
  await prisma.hint.deleteMany();
  await prisma.card.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.classSubscription.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log("Existing data cleaned up");

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      lastName: "Sistema",
      email: "admin@escuela.com",
      password: "password123",
      role: Role.ADMIN,
      docket: "ADM-001",
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      name: "Carlos",
      lastName: "Gómez",
      email: "carlos.gomez@escuela.com",
      password: "password123",
      role: Role.TEACHER,
      docket: "DOC-101",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Juan",
      lastName: "Pérez",
      email: "juan.perez@miemail.com",
      password: "password123",
      role: Role.STUDENT,
      docket: "ALU-501",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "María",
      lastName: "López",
      email: "maria.lopez@miemail.com",
      password: "password123",
      role: Role.STUDENT,
      docket: "ALU-502",
    },
  });

  console.log("Users created");

  // 3. Create Subjects
  const Subject1 = await prisma.subject.create({
    data: {
      name: "Análisis Matemático I",
      description: "Cálculo diferencial e integral básico",
    },
  });

  const Subject2 = await prisma.subject.create({
    data: {
      name: "Algoritmos y Estructuras de Datos",
      description: "Fundamentos de algoritmos y estructuras de datos",
    },
  });

  console.log("Subjects created");

  // 4. Create Classes
  const Class1 = await prisma.class.create({
    data: {
      year: 2026,
      teacherId: teacher1.id,
      status: "active",
      subjectId: Subject1.id,
    },
  });

  console.log("Classes created");

  // 5. Create Student Enrollments
  await prisma.classSubscription.createMany({
    data: [
      {
        classId: Class1.id,
        studentId: student1.id,
        status: "CURSANDO",
      },
      {
        classId: Class1.id,
        studentId: student2.id,
        status: "CURSANDO",
      },
    ],
  });

  console.log("Enrollments created");

  // 6. Create Topics, Summaries, and Cards
  const topicDerivatives = await prisma.topic.create({
    data: {
      name: "Derivadas y Funciones",
      subjectId: Subject1.id,
    },
  });

  await prisma.summary.create({
    data: {
      title: "Regla de la Cadena y Derivación",
      content: "Explicación detallada sobre cómo derivar funciones compuestas.",
      topicId: topicDerivatives.id,
    },
  });

  const card1 = await prisma.card.create({
    data: {
      question: "¿Cuál es la derivada de x^2?",
      answer: "2x",
      topicId: topicDerivatives.id,
    },
  });

  await prisma.hint.create({
    data: {
      content: "Aplica la regla de la potencia: baja el exponente y resta 1.",
      cardId: card1.id,
    },
  });

  console.log("Topics, Summaries, and Cards created");
  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
