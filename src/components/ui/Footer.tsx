import Image from "next/image";

export default function Footer() {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      <p className="flex items-center gap-2">
        <Image
          aria-hidden
          src="/file.svg"
          alt="File icon"
          width={16}
          height={16}
        />
        Disgned by LinKenCong
      </p>
      <p className="flex items-center gap-2">
        <Image
          aria-hidden
          src="/window.svg"
          alt="Window icon"
          width={16}
          height={16}
        />
        Kyrie Market App
      </p>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/LinKenCong"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/globe.svg"
          alt="Globe icon"
          width={16}
          height={16}
        />
        Go to github →
      </a>
    </footer>
  );
}
