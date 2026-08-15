import { createClient } from "@/lib/supabase/server"

/** Compatibility session facade for legacy server modules during the Supabase migration. */
export const auth = {
  api: {
    async getSession(..._args: unknown[]) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      return user ? { user } : null
    },
  },
}
