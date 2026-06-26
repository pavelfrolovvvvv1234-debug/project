import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthUser } from "../middleware/auth.js";

function isAdmin(user: AuthUser) {
  return user.role === "admin";
}

export async function assertNetworkOwner(
  networkId: string,
  user: AuthUser,
  res: Response
) {
  const network = await prisma.network.findFirst({
    where: isAdmin(user) ? { id: networkId } : { id: networkId, ownerId: user.id },
  });
  if (!network) {
    res.status(404).json({ error: "Сеть не найдена" });
    return null;
  }
  return network;
}

export async function assertSiteOwner(siteId: string, user: AuthUser, res: Response) {
  const site = await prisma.site.findFirst({
    where: isAdmin(user) ? { id: siteId } : { id: siteId, ownerId: user.id },
    include: { network: true },
  });
  if (!site) {
    res.status(404).json({ error: "Сайт не найден" });
    return null;
  }
  return site;
}

export function ownerFilter(user: AuthUser) {
  return isAdmin(user) ? {} : { ownerId: user.id };
}
