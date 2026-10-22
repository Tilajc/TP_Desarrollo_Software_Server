import { Role } from "@prisma/client";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding...");

  // 1. Clean up existing data (in reverse order of dependencies)
  await prisma.hint.deleteMany();
  await prisma.card.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.courseSubscription.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log("Existing data cleaned up");

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      lastName: "Sistema",
      email: "admin@gmail.com",
      password: await bcrypt.hash("pass12", 10),
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Carlos",
      lastName: "Gómez",
      email: "carlos.gomez@gmail.com",
      password: await bcrypt.hash("pass12", 10),
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Juan",
      lastName: "Pérez",
      email: "juan.perez@gmail.com",
      password: await bcrypt.hash("pass12", 10),
      role: Role.USER,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "María",
      lastName: "López",
      email: "maria.lopez@gmail.com",
      password: await bcrypt.hash("pass12", 10),
      role: Role.USER,
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

  // 4. Create Courses (un curso = autor + materia)
  const Course1 = await prisma.course.create({
    data: {
      authorId: user1.id,
      subjectId: Subject1.id,
    },
  });

  console.log("Courses created");

  // 5. Create Topics, Summaries, and Cards
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
      authorId: user1.id,
    },
  });

  const card1 = await prisma.card.create({
    data: {
      question: "¿Cuál es la derivada de x^2?",
      answer: "2x",
      topicId: topicDerivatives.id,
      authorId: user1.id,
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
