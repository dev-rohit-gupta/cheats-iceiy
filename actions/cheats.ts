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

    // Create cheat
    const cheat = await createCheat({
      ...validationResult.data,
      adminId: session.user.id,
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
  cheatId: number,
  data: UpdateCheatInput
) {
  try {
    const session = await getServerSession(authOptions);

    // Server-side permission check
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
      };
    }

    // Validate input
    const validationResult = updateCheatSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input",
        details: validationResult.error.errors,
      };
    }

    // Update cheat
    const cheat = await updateCheat(cheatId, validationResult.data);

    if (!cheat) {
      return {
        success: false,
        error: "Cheat not found",
      };
    }

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
export async function deleteCheatAction(cheatId: number) {
  try {
    const session = await getServerSession(authOptions);

    // Server-side permission check
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
      };
    }

    // Delete cheat
    const deleted = await deleteCheat(cheatId);

    if (!deleted) {
      return {
        success: false,
        error: "Cheat not found",
      };
    }

    return {
      success: true,
      message: "Cheat deleted successfully",
    };
  } catch (error) {
    console.error("Delete cheat action error:", error);
    return {
      success: false,
      error: "Failed to delete cheat",
    };
  }
}
