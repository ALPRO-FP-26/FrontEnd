import Sidebar from "../../components/sidebar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </>
  );
}

