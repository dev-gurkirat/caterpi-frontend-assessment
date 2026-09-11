"use server";

import { updatePassportVisibility } from "@/lib/data/passport";
import { ROUTES } from "@/lib/domain/routes";
import { revalidatePath } from "next/cache";

export async function savePassportVisibility(isPublic: boolean) {
  const result = await updatePassportVisibility(isPublic);

  if (result.status === "ok") {
    revalidatePath(ROUTES.passport);
    revalidatePath(ROUTES.publicPassport(result.data.username));
  }

  return result;
}
