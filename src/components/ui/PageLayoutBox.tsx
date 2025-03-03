import Footer from "./Footer";

export default function PageLayout({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="row-start-1 flex flex-col gap-4 items-center">
        <h1 className="text-4xl font-bold text-center">{title}</h1>
      </header>
      <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {children}
      </main>
      <Footer />
    </div>
  );
}
