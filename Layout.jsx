import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-8">
      <Navbar />
      <main className="mx-auto max-w-7xl">{children}</main>
    </div>
  );
}



