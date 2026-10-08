export function Footer() {
  return (
    <footer className="w-full border-t border-[#a3a3a3] bg-white py-2">
      <div className="mx-auto flex max-w-250 items-center justify-center px-6">
        <div className="ml-15 flex flex-col text-left">
          <p>© HTL Weiz 2026</p>
          <a
            href="https://htlweiz.at/impressum"
            className="mb-1.5 text-sm text-black transition-colors duration-200 ease-in hover:text-gray-500"
          >
            Impressum und Datenschutz
          </a>
        </div>
      </div>
    </footer>
  )
}
