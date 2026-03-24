import { useEffect, useState } from "react";
import MoodChart from "./MoodChart";
import api from "./api";
import { useAuth } from "./AuthContext";

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [moods, setMoods] = useState([]);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    tags: "",
  });
  const [moodForm, setMoodForm] = useState({
    mood: "Calm",
    score: 4,
    note: "",
    day: new Date().toISOString().slice(0, 10),
  });

  const loadProfile = async () => {
    const [{ data: profileData }, { data: moodData }] = await Promise.all([
      api.get("/profile"),
      api.get("/moods"),
    ]);

    setProfile(profileData.user);
    setMoods(moodData);
    setForm({
      username: profileData.user.username,
      bio: profileData.user.bio,
      tags: profileData.user.tags.join(", "),
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    const { data } = await api.put("/profile", {
      username: form.username,
      bio: form.bio,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
    setProfile(data);
    setUser((prev) => ({ ...prev, username: data.username, tags: data.tags, bio: data.bio }));
  };

  const saveMood = async (event) => {
    event.preventDefault();
    await api.post("/moods", {
      ...moodForm,
      score: Number(moodForm.score),
    });
    loadProfile();
  };

  if (!profile) return null;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h1 className="mb-4 text-3xl font-bold text-ink">Profile</h1>
          <form onSubmit={saveProfile} className="space-y-4">
            <input
              className="soft-input"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Username"
            />
            <textarea
              className="soft-input min-h-28"
              value={form.bio}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              placeholder="Short bio"
            />
            <input
              className="soft-input"
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="anxiety, stress, loneliness"
            />
            <button className="primary-btn">Save Profile</button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 text-2xl font-semibold text-ink">Daily Mood Check-In</h2>
          <form onSubmit={saveMood} className="space-y-4">
            <select
              className="soft-input"
              value={moodForm.mood}
              onChange={(event) => setMoodForm((prev) => ({ ...prev, mood: event.target.value }))}
            >
              <option>Happy</option>
              <option>Calm</option>
              <option>Stressed</option>
              <option>Sad</option>
              <option>Overwhelmed</option>
            </select>
            <input
              className="soft-input"
              type="number"
              min="1"
              max="5"
              value={moodForm.score}
              onChange={(event) => setMoodForm((prev) => ({ ...prev, score: event.target.value }))}
            />
            <input
              className="soft-input"
              type="date"
              value={moodForm.day}
              onChange={(event) => setMoodForm((prev) => ({ ...prev, day: event.target.value }))}
            />
            <textarea
              className="soft-input min-h-24"
              value={moodForm.note}
              onChange={(event) => setMoodForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="What influenced your mood today?"
            />
            <button className="primary-btn">Save Mood</button>
          </form>
        </div>
      </div>

      <MoodChart data={moods} />
    </div>
  );
}



