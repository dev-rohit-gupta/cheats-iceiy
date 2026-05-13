"use server";

import { createCheat, updateCheat, deleteCheat } from "@/lib/db/cheats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { isAdmin } from "@/lib/utils";
import { createCheatSchema, updateCheatSchema } from "@/lib/validations";
import type { CreateCheatInput, UpdateCheatInput } from "@/lib/validations";

/**
 * Server action to create a cheat
 */
export async function createCheatAction(data: CreateCheatInput) {
  try {
    const session = await getServerSession(authOptions);

    // Server-side permission check (never rely on client)
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
      };
    }

    // Validate input
    const validationResult = createCheatSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input",
        details: validationResult.error.errors,
      };
    }

    const validData = validationResult.data;

    // Create cheat - convert undefined to null for optional fields
    const cheat = await createCheat({
      title: validData.title,
      driveLink: validData.driveLink,
      subject: validData.subject,
      adminId: session.user.id,
      branch: validData.branch ?? null,
      notes: validData.notes ?? null,
      accessLevel: validData.accessLevel,
      status: 'active',
      tags: validData.tags ?? null,
    });

    return {
      success: true,
      data: cheat,
    };
  } catch (error) {
    console.error("Create cheat action error:", error);
    return {
      success: false,
      error: "Failed to create cheat",
    };
  }
}

/**
 * Server action to update a cheat
 */
export async function updateCheatAction(
  id: number,
  data: UpdateCheatInput
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
      };
    }

    const validationResult = updateCheatSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input",
        details: validationResult.error.errors,
      };
    }

    const validData = validationResult.data;
    
    // Build update object with only defined fields, converting undefined to null
    const updateData: Record<string, unknown> = {};
    if (validData.title !== undefined) updateData.title = validData.title;
    if (validData.driveLink !== undefined) updateData.driveLink = validData.driveLink;
    if (validData.subject !== undefined) updateData.subject = validData.subject;
    if (validData.branch !== undefined) updateData.branch = validData.branch ?? null;
    if (validData.notes !== undefined) updateData.notes = validData.notes ?? null;
    if (validData.accessLevel !== undefined) updateData.accessLevel = validData.accessLevel;
    if (validData.status !== undefined) updateData.status = validData.status;
    if (validData.tags !== undefined) updateData.tags = validData.tags ?? null;

    const cheat = await updateCheat(id, updateData as Partial<{
      title: string;
      driveLink: string;
      subject: string;
      branch: string | null;
      notes: string | null;
      accessLevel: string;
      status: string;
      tags: string | null;
    }>);

    return {
      success: true,
      data: cheat,
    };
  } catch (error) {
    console.error("Update cheat action error:", error);
    return {
      success: false,
      error: "Failed to update cheat",
    };
  }
}

/**
 * Server action to delete a cheat
 */
export async function deleteCheatAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
      };
    }

    await deleteCheat(id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete cheat action error:", error);
    return {
      success: false,
      error: "Failed to delete cheat",
    };
  }
}
