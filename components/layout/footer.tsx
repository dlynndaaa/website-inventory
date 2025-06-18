interface FooterProps {
  year?: number
  universityName?: string
  address?: string
}

export function Footer({
  year = 2025,
  universityName = "Universitas Muhammadiyah Surakarta",
  address = "Gedung E Lt. 3, Kampus Terpadu UMS Pabelan Kartasura",
}: FooterProps) {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">
          © {year} SIMPEL-TI
          <br />
          {universityName}
          <br />
          {address}
        </p>
      </div>
    </footer>
  )
}
