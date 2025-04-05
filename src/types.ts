export type Item = {
    id?: number; // bigint in Postgres
    created_at?: string; // timestamp with time zone in Postgres, represented as ISO string
    description?: string; // text in Postgres, optional
    done?: boolean; // boolean in Postgres, optional
    user_id?: string; // uuid in Postgres, optional, represented as string
    is_public?: boolean; // boolean in Postgres, optional
  };