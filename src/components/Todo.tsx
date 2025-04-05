import { ChangeEvent, FormEvent, useState, useEffect } from "react";
// import { useTimeout } from "usehooks-ts";
import { supabase } from "@/App.tsx";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Item } from "@/types";
import { toast } from "sonner";

export function Todo() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [item, setItem] = useState<Item>({ description: "", done: false });
  const [items, setItems] = useState<Item[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    getItems();
  }, [success]);

  const getItems = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("test")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      if (err) {
        console.log("error getting items:", err);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Not authenticated:", userError);
      return;
    }

    try {
      const { error } = await supabase.from("test").insert({
        user_id: user.id,
        description: item.description,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('added.')
      setItem({ description: "", done: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (id: number) => {
    const itemToggle = items.find((item) => item.id === id);
    if (!itemToggle) return;

    await supabase.from("test").update({ done: !itemToggle.done }).eq("id", id);

    getItems();
  };

  const deleteItem = async (id: number) => {
    console.log("Attempting to delete item ID:", id);

    try {
      const { data, error, status } = await supabase
        .from("test")
        .delete()
        .eq("id", id)
        .select();

      console.log("Supabase response:", { data, error, status });

      if (error) {
        throw error;
      }

      getItems();
      toast.error('deleted.')
    } catch (err) {
      console.error("Full delete error:", err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4 p-4 flex-1">
      <form onSubmit={handleSubmit} className="space-y-4 flex">
        <Input
          type="text"
          name="description"
          value={item.description}
          onChange={handleChange}
          placeholder="create"
          disabled={loading}
          required
        />
        <Button variant="ghost" type="submit" disabled={loading}>
          {loading ? "inserting..." : "add"}
        </Button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2">
        {items.map((todo) => (
          <li
            key={todo.id}
            onClick={() => toggleDone(todo.id!)}
            onContextMenu={(e) => {
              e.preventDefault();
              deleteItem(todo.id!);
            }}
            className={`p-3 rounded-lg cursor-pointer
        ${todo.done ? "line-through text-gray-900" : ""}
        ${deleting === todo.id ? "bg-red-50" : ""}
        hover:bg-slate-900 transition-colors`}
          >
            {todo.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
